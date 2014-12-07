
function callbackAuthorization(data, textStatus){
  resetTimeout();      // ��������� ������
  if(data != null) {  // null ��?!
    var div1 = document.createElement('div');
    div1.hidden = true;
    div1.insertAdjacentHTML( 'beforeend', data );
    document.body.appendChild(div1);
    if(document.getElementById('divUserName') != undefined){  // ����������� ��� ����������
      userName = document.getElementById('divUserName').innerText;
      document.getElementById('statusName').innerText = userName;
      loadEnvironment();
    }
    if(document.getElementById('divLoginVirgin') != undefined){  // �������� ������ �����������
      loadPopupLogin();
      centerPopupLogin();
    }
    if(document.getElementById('divLogin') != undefined){  // ����������� ���������
      setStatus("�����������  ���������");
    }
    document.body.removeChild(div1)
    div1.innerHTML = "";
  }
}

function loadEnvironment() {
  mySetTimeout(12, "������ �������� ���������� ���������");
  $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_list.asp", {type: "8", id: "1", tt_gate: "2", page: "1", rows: "10", hide: "0"}, callbackLoadEnvironment, "html");
  setStatus("�������� ���������� ���������  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Renew' TITLE='Renew'>");
}

function callbackLoadEnvironment(data, textStatus) {
  resetTimeout();
  if(data != null) {  // null ��?!
    var div1 = document.createElement('div');
    div1.insertAdjacentHTML( 'beforeend', data );                 // �������� �� data DOM ������
    div1.hidden = true;
    document.body.appendChild(div1);
                                      // �������� ������
    if(document.getElementById('resp_id') != undefined){
      resp_id = document.getElementById('resp_id').children;          // ������������� ����
    }
    if(document.getElementById('organization_id')!= undefined){
      organization_id = document.getElementById('organization_id').children;  // �������
    }
    if(document.getElementById('tt_region')!= undefined){
      tt_region = document.getElementById('tt_region').children;        // ������
    }
    if(document.getElementById('tt_status_id')!= undefined){
      tt_status_id = document.getElementById('tt_status_id').children;     // ������ ������
    }

    $("#resp_id_s").empty();          // �������� ������ ���. ��� � ����� ������� � ������ ��������� ���� ID
    for(var i = 0; i < resp_id.length; i ++) {
      $("#resp_id_s").append("<option value='" + resp_id[i].value + "'>" + resp_id[i].text + "</option>")
      if(resp_id[i].text === userName) {
        userId = resp_id[i].value;
      }
    }

    document.body.removeChild(div1)    // ������� ��������� div
    div1.innerText = "";

    $("#resp_id_s").change(onRespIdChange);
    refreshTime = 1;            // ������� ��������������. ������ ���������� ����� 1 �������
  }
}

function callbackLoadEnvironment2(data, textStatus) {    // ���� ������� ������������ ��� ��������� ������ ������������� �������. ���������� ��� ������ ��������� ������ ��������
  resetTimeout();
  if(data != null) {  // null ��?!
    var div1 = document.createElement('div');
    div1.insertAdjacentHTML( 'beforeend', data );                 // �������� �� data DOM ������
    div1.hidden = true;
    document.body.appendChild(div1);
                                      // �������� ������
    if(document.getElementById('branchlist') != undefined){
      branch_id = document.getElementById('branchlist').children;          // ������������� ����
//      document.getElementById('branchLiist').children = branch_id; // �������� ������ ����� � ����� �������� - ������ �������������
      $("#branchLiist").empty();                             // �������� ������ ����� � ����� �������� - ������ �������������
      for(var i = 0; i < branch_id.length; i ++) {
        if(branch_id[i].value === "100184")
          $("#branchLiist").append("<option value='" + branch_id[i].value + "' selected = 'true'>" + branch_id[i].text + "</option>");
        else
          $("#branchLiist").append("<option value='" + branch_id[i].value + "'>" + branch_id[i].text + "</option>");
      }
    }
    else {
      document.getElementById('buttonTransfer').hidden = true;
      document.getElementById('btTransfNote').text = "���������� �������� ������ �������������";
    }
    document.body.removeChild(div1)    // ������� ��������� div
    div1.innerText = "";
    }
}

function loadTickets() {
  mySetTimeout(12, "������ �������� ������ �������");
  $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "8", id: "1", organization_id: "0", resp_id: "0", tt_is_group: "2", tt_priority_id: "0", tt_gate: "2"  , tt_region: "0", tt_closed_name: "128", tt_type_closed: "0", tt_subtype_closed: "0", tt_status_id: "1000", page: "1", rows: "500", hide: "0"}, callbackLoadTickets, "json");
                                                      //                     �����������        , ���. ����   , �������. ������ ,  ���������         ,��� ����� �����, ������        , ��� ����             , ����� ������       , �������� ������       , ��� ����� ��������  ,
  setStatus("�������� ������ �������  <IMG SRC='/images/wait.gif' alignment='vertical' alt='Renew'>");
}

function callbackLoadTickets(data, textStatus) {
  resetTimeout();
  if(data != null) {
    renewTickets(data);
  }
  setStatus("������");
}

function callbackGetTicket(data, textStatus) {
  var tid, permissions, t, h, m, str;
  if(data != null) {  // null ��?!
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
    var tb = document.getElementById('PrintArea').children[1].children[0];    // �������� �������
    var ltb = document.getElementById('leftPTtBody');                         // ��� �������
    var buttons = document.getElementsByClassName('inpButton');  // ������� ������ ��������� ������
    permissions = "";
    for(var i = 0; i < buttons.length; i ++) {                          // ��������� ��� �� �������� � permissions ����� ***
      permissions += buttons[i].value + "***";
    }

    tid = tb.children[0].children[1].innerText;
    if(Tickets[tid] != undefined) Tickets[tid].permissions = permissions;                                 // �������� permissions ��� �������� ������
    document.getElementById('popupTicket').iidd = tid


    ltb.children[0].children[1].innerText = tid;
    ltb.children[1].children[1].innerText = tb.children[1].children[1].innerText;   // ������
    ltb.children[2].children[1].innerText = tb.children[2].children[1].innerText;   // ���������
    ltb.children[3].children[1].innerText = tb.children[4].children[1].innerText;   // �����
    ltb.children[4].children[1].innerText = tb.children[5].children[1].innerText;   // ���. ����
    ltb.children[5].children[1].innerText = tb.children[6].children[1].innerText;   // ���������
    ltb.children[6].children[1].innerText = tb.children[7].children[1].innerText;   // ������
    ltb.children[7].children[1].innerText = tb.children[8].children[1].innerText;   // ������
    ltb.children[8].children[1].innerHTML = tb.children[9].children[1].innerHTML;   // ������
    ltb.children[9].children[1].children[0].innerHTML = tb.children[10].children[1].innerHTML;   // �����. ������ �� innerText � �������� ������� �����!

    document.getElementById('toTabs').innerText = "� ��������"; if(Tabs[tid] != undefined) document.getElementById('toTabs').innerText = "�� ��������";

    if(permissions.indexOf("�����������") != -1){ // ���� �������� ������ �� ������������ - ������� ������
      ltb.children[4].children[1].style.backgroundColor = "#FFA500";
    }
    document.getElementById('hTable').innerHTML = "";
    delete tb;
    document.getElementById('tempDiv').innerHTML = "";

    document.getElementById('timeLeft').innerText = " �����  0�  0�";
    var now = new Date();
    now = now.getTime();
    if(Tickets[tid].timer > now){
      t = Math.floor((Tickets[tid].timer - now) / 60000);
      h = Math.floor(t/60);
      m = t - h*60;
      str = "&nbsp;�����&nbsp;";
      if(h < 10) str += "&nbsp";
      str += h + "�&nbsp;";
      if(m < 10) str += "&nbsp";
      str += m + "�";
      document.getElementById('timeLeft').innerHTML = str;
    }

    loadPopupTicket();
    centerPopupTicket();
    $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "10", id: "1", tt_id: tid, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
  }
}

function callbackGetHistory(data, textStatus) {
  if(data != null) {  // null ��?!
    var innerHTML = "";
    document.getElementById('comment').value = "";
    if(Tabs[document.getElementById('popupTicket').iidd] != undefined) {  // ���� ���� ����� ��� �� ��������, ����������� ��������� � comment �����
      document.getElementById('comment').value = Tabs[document.getElementById('popupTicket').iidd].text;
    }
    for(var i = 0; i < data.rows.length;  i ++) {
      arrFio = data.rows[i].fio.split(" ", 3);
      fio = arrFio[0] + " " + arrFio[1].substring(0,1) + ". " + arrFio[2].substring(0,1) + ".";
      innerHTML += '<tr align="left" style="color:#1111bb"><td><b>' + ' ' + fio + '('+ data.rows[i].date +') ';
      if(data.rows[i].action.indexOf("��������� ������������� ����") != -1){
        innerHTML += "<IMG SRC='/images/arrow.png'> " + fullName2FIO(data.rows[i].action.substring(29));
      }
      else if(data.rows[i].action.indexOf("�������� �����������") != -1){
        innerHTML += ':';
      }
      else if(data.rows[i].action.indexOf("���������� � ������") != -1){
        innerHTML += '<span style="color:#118888">' + data.rows[i].action.substring(19) + '</span>';
      }
      else {
        innerHTML += data.rows[i].action;
      }
      innerHTML += '<b></td></tr>';
      if(data.rows[i].comment.length > 1){
        innerHTML += '<tr style="color:#330000"><td>&nbsp;' + data.rows[i].comment + '</td></tr>';
      }
    }
    document.getElementById('hTable').innerHTML = innerHTML;
  }

}

function cbWiki(data, textStatus) {
  document.getElementById('ppRegion')[0].text = "- ��� ������� -";
  document.getElementById('ppRegion').disabled = false;
  document.getElementById('ppRegion').selectedIndex = 0;
//  document.getElementById('wikiLink').text += " - ������ � Wiki";
  var start = data.indexOf("������� ���������");
  if(start === -1){return;}
  data = data.substring(start, start + 1000);
  start = data.indexOf('title="');
  if(start === -1){return;}
  data = data.substring(start);
  start = data.indexOf('">');
  if(start === -1 || start > 100){return;}
  var region = data.substring(7, start);
  for(var i = 1; i < tt_region.length; i ++){
    if(tt_region[i].text == region || ((tt_region[i].text.indexOf(region) != -1) && (tt_region[i].text.indexOf("����������") != -1))){
      document.getElementById('ppRegion').selectedIndex = i;
      break;
    }
  }
}