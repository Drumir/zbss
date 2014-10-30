var printArea;

function Authorization(user, password) {
  setStatus("�����������  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Autorization' TITLE='Autorization'>");
  var par = {};
  par.refer = "";
  par.hex = "3ebf20264ddfea73ef2717f93dfed2c1";
  par.tries = "-1";
  par.user = user;
  par.password = password;
  setTimeout(6, "������ �����������");
  $.post("https://oss.unitline.ru:995/adm/login.asp", par, callbackAuthorization, "html");
}

function callbackAuthorization(data, textStatus){
  resetTimeout();      // ��������� ������
  if(data != null) {  // null ��?! 
    var div1 = document.createElement('div');
    div1.hidden = true;
    div1.insertAdjacentHTML( 'beforeend', data );
    document.body.appendChild(div1);
    userName = document.getElementById('divUserName').innerText; 
    document.body.removeChild(div1)
    div1.innerHTML = "";
    document.getElementById('statusName').innerText = userName; 
    loadEnvironment(); 
  }
}

function loadEnvironment() {
  setTimeout(6, "������ �������� ���������� ���������");
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
//      document.getElementById('branchList').children = branch_id; // �������� ������ ����� � ����� �������� - ������ �������������
      $("#branchList").empty();                             // �������� ������ ����� � ����� �������� - ������ �������������
      for(var i = 0; i < branch_id.length; i ++) {
        if(branch_id[i].value === "100184") {
          branch_id[i].selected = true;
        }
        $("#branchList").append(branch_id[i])
      }
    }   
    else {
      console.log("� ������ ��� ������������ ������. �������� ���� ����� ������ ��������");
    }
    document.body.removeChild(div1)    // ������� ��������� div
    div1.innerText = ""; 
    }   
}

function loadTickets() {
  setTimeout(6, "������ �������� ������ �������");
  $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "8", id: "1", organization_id: "0", resp_id: "0", tt_is_group: "2", tt_priority_id: "0", tt_gate: "2"  , tt_region: "0", tt_closed_name: "128", tt_type_closed: "0", tt_subtype_closed: "0", tt_status_id: "1000", page: "1", rows: "500", hide: "0"}, callbackLoadTickets, "json");
                                                      //                     �����������        , ���. ����   , �������. ������ ,  ���������         ,��� ����� �����, ������        , ��� ����             , ����� ������       , �������� ������       , ��� ����� ��������  ,
  setStatus("�������� ������ �������  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Renew' TITLE='Renew'>");
}

function callbackLoadTickets(data, textStatus) {
  resetTimeout();
  if(data != null) {  
    renewTickets(data);
  }  
  setStatus("������");
}

function callbackGetTicket(data, textStatus) {
  var permissions;
  if(data != null) {  // null ��?! 
    if(printArea != undefined){
      printArea.parentNode.removeChild(printArea);
      printArea.innerHTML = "";
    }  
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
    printArea = document.getElementById('PrintArea');
    var buttons = document.getElementsByClassName('inpButton');  // ������� ������ ��������� ������
    permissions = "";
    for(var i = 0; i < buttons.length; i ++) {                          // ��������� ��� �� �������� � permissions ����� ***
      permissions += buttons[i].value + "***";  
    }
    var tid = printArea.children[1].children[0].children[0].children[1].innerText;   
    if(Tickets[tid] != undefined) Tickets[tid].permissions = permissions;                                 // �������� permissions ��� �������� ������
    document.getElementById('popupTicket').iidd = tid
    document.getElementById('tempDiv').innerHTML = ""; 
    printArea.removeChild(printArea.children[2]);    // ������ ������� ������
    var tb = printArea.children[1].children[0];
    tb.children[1].children[0].innerText = "������";
    tb.children[3].children[0].innerText = "���";
    tb.children[5].children[0].innerText = "���. ����";
    tb.children[5].children[1].id = "otv";  // ��� ������� ������������� �� e.target.id
    tb.children[7].children[1].id = "stat";  // ��� ������� ������������� �� e.target.id

    if(permissions.indexOf("�����������") != -1){ // ���� �������� ������ �� ������������ - ������� ������
      tb.children[5].children[1].style.backgroundColor = "#FFA500";
    }
    tb.children[0].children[0].width = "75px";
    tb.children[0].children[1].width = "255px";
    printArea.children[1].width = "";
//    printArea.children[1].clas = "";
    printArea.children[1].border = "1";
    printArea.removeChild(printArea.children[0]);    // ������ ���������
    document.getElementById('leftPopupTicket').appendChild(printArea);
    document.getElementById('hTable').innerHTML = "";
    loadPopupTicket();
    centerPopupTicket();                                               
    document.getElementById('historyDiv').height = document.getElementById('leftPopupTicket').height - 75;
//    var a = document.getElementById('popupTicket');    
    $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "10", id: "1", tt_id: tid, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
  }
}

function callbackGetHistory(data, textStatus) {
  if(data != null) {  // null ��?!
    var innerHTML = "";
    document.getElementById('comment').value = "";
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
  var start = data.indexOf("������� ���������");
  if(start === -1){return;}
  data = data.substring(start);
  start = data.indexOf('title="');
  if(start === -1){return;}
  data = data.substring(start);
  start = data.indexOf('">'); 
  if(start === -1 || start > 100){return;}
  var region = data.substring(7, start);
  for(var i = 1; i < tt_region.length; i ++){
    if(tt_region[i].text === region){
      document.getElementById('ppRegion').selectedIndex = i;
      break;
    } 
  }
}