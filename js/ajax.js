
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
      $("#char1").css({"color":"green"});
      loadEnvironment();
    }
    if(document.getElementById('divLoginVirgin') != undefined){  // �������� ������ �����������
      $("#char1").css({"color":"orange"});
      loadPopupLogin();
      centerPopupLogin();
    }
    if(document.getElementById('divLogin') != undefined){  // ����������� ���������
      $("#char1").css({"color":"red"});
      document.getElementById('statusName').innerText = "����";
      setStatus("�����������  ���������");

    }
    document.body.removeChild(div1)
    div1.innerHTML = "";
  }
}

function loadEnvironment() {
  mySetTimeout(12, "������ �������� ���������� ���������");
  $.post("https://bss.vconnect.ru/adm/tt/trouble_ticket_list.asp", {type: "8", id: "1", tt_gate: "2", page: "1", rows: "10", hide: "0"}, callbackLoadEnvironment, "html");
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

function loadTickets() {
  var i, dateTo = "", dateFrom = "", status_id = "1000", region = "0", client = "0";
  if(filter.status === "Closed / �������"){          // ����  ������ � "��������" ������
    status_id = "7";
    var now = new Date();
    dateTo = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
    now.setTime(now.getTime() - closedTTduration*1000*60*60*24);
    dateFrom = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
    if(filter.region != ""){
      for(i = 1; i < tt_region.length && tt_region[i].text != filter.regionFull; i ++);
      if(i != tt_region.length) region = tt_region[i].value;
    }
    if(filter.client != ""){
      for(i = 0; i < organization_id.length && organization_id[i].text != filter.client; i ++);  // ������ � ������ ����������� ������
      if(i != organization_id.length) client = organization_id[i].value;
    }
  }

  mySetTimeout(12, "������ �������� ������ �������");
  $.post("https://bss.vconnect.ru/inc/jquery.asp", {type: "8", id: "1", organization_id: client, resp_id: "0", tt_is_group: "2", tt_priority_id: "0", tt_gate: "2"  , tt_region: region, tt_closed_name: "128", tt_type_closed: "0", tt_subtype_closed: "0", tt_status_id: status_id, DateFrom: dateFrom, DateTo: dateTo, page: "1", rows: "500", hide: "0"}, callbackLoadTickets, "json");
                                                      //                     �����������        , ���. ����   , �������. ������ ,  ���������         ,��� ����� �����, ������        , ��� ����             , ����� ������       , �������� ������       , ��� ����� ��������  ,
  setStatus("�������� ������ �������  <IMG SRC='/images/wait.gif' alignment='vertical' alt='Renew'>");
}

function callbackLoadTickets(data, textStatus) {
  if(data == null) return;
  resetTimeout();
  if(filter.status === "Closed / �������" && data.rows.length < 300 && closedTTduration < 365){  // ����  ������ � "��������" ������, � � data ������ 300 �������
    data.rows.length === 0 ? closedTTduration = 183 : closedTTduration = closedTTduration*450 / data.rows.length;
    if(closedTTduration > 365) closedTTduration = 365;          // ������� ����� ������������
    loadTickets();    // �������� ������ ��� ���
    return;
  }
  closedTTduration = 7;
  renewTickets(data);
  setStatus("������");
}

function cbSqlMultiSuccess(data, textStatus) {      // ������� �������� TT -> hostid � Tickets{}
  if(data.status == "success"){
    $("#char2").css({"color":"green"});
    mySqlLastRenew = data.timestamp;
    for(var i = 0; i < data.result.length; i ++){
      if(Tickets[data.result[i].ttid] != undefined)
        Tickets[data.result[i].ttid].zhostid = data.result[i].hostid;
    }
  }
}

function cbSqlWriteSuccess(data, textStatus) {      // cb �������� ������ � ����. ���� �� ��������� ������� ��...
}