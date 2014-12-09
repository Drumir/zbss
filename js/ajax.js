
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

