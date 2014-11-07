//
//    BSS Parser by drumir@mail.ru
//    
//
var Tickets = {};           // ������ ���� ���������� ������� � ������� {id: {id:"10547", status: "", open: "", ....., permissions:"�������� ������ ��������� � ���� ������"}}. ��������������� ��� � n ������
var transQueue = [];        // ������� �������� �� ������� ������.
var hiddenText;             // ���������� - TEXTAREA
var a, b;
var transAnsiAjaxSys = [];


var userName;              // ��� ������������ ������������ ������ �.�.
var userId = -1;           // ������������� ������������ ������������
var branchId = 100113;     // ��� ������������� ������������ 100113 == "����������� ����������� (��������) (13)" !!!!!!
var resp_id = [];          // ������ ���� ������������� ���
var organization_id = [];  // ������ ���� ��������
var tt_region = [];        // ������ ���� ������
var tt_status_id = [];     // ������ �������� ������
var branch_id = [];        // ������ ������������� �������

var mtb;                   // Main Table Body
var refreshTime = -1;      // ������� ������ �������� �� ����������.
var netTimeout = -1;       // ��� ����������� ��������� ������� ��������. >0 - ���� ������. ==0 - �������� �����������. <0 - ���������
var strTimeout = "";
var filterUser = "";
var filterName = "";
var filterStatus = "";
var filterClient = "";

var delayedData = "";      // ����� �������� html ��� �������� ��������������� ������ (� ������� ���������� ��� callbackGetTicket) � ���, ����� ����� ���� ����� ����� ������������ Tickets{}, �������� ����� � ��� ������������  

var forceShow = true;     // ���������, ��� ������ ����� ��� ����� ������� ��������
var highlightedTT = 0;    // ������ ��������� ��������� ����� ��� ��� ���������.

window.onload = function() {          // 
                             
  document.getElementById('buttonNew').onclick = onBtnNewTTClick;
  document.getElementById('ppBtnCreate').onclick = onBtnSaveTTClick;
  document.getElementById('ppBtnAlert').onclick = onBtnAlertClick;
  document.getElementById('btResetFilter').onclick = onResetFilterClick;
  document.getElementById('buttonTransfer').onclick = onButtonTransferClick;
  document.getElementById('buttonTransfer').disabled = false;
  document.body.onresize = onBodyResize;
  document.getElementById('headChBox').onchange = onHeadChBoxClick; 
  document.getElementById('buttonMove').onclick = onBtnMoveClick;
  document.getElementById('buttonMove').disabled = false;
  document.getElementById('buttonRenew').onclick = onBtnRenewClick;
  document.getElementById('buttonRenew').disabled = false; 
  document.getElementById('mainTBody').onclick = onMainTBodyClick;
  document.getElementById('mainTBody').onkeydown = onMainTBodyKeyPress;
  document.getElementById('statusName').onclick = onStatusNameClick;
  document.getElementById('statusName').ondblclick = onStatusNameDblClick;
  document.getElementById('comment').onkeypress = commentOnKey;
  document.getElementById('leftPopupTicket').onclick = onLeftTPopupClick; 
  document.getElementById('searchStr').oninput = onSearchInput; 
  document.getElementById('searchClient').oninput = onSearchClientInput; 
  document.getElementById('searchTT').onkeydown = onTTKeyPress; 
  document.getElementById('psClass').onchange = getSubClass; 
  document.getElementById('branchLiist').onchange = GetCPList;
  document.getElementById('ps2Confirm').onclick = onPs2Confirm;
  document.getElementById('ps2Servis').onclick        = onPsActionClick;
  document.getElementById('ps2Resolved').onclick      = onPsActionClick;
  document.getElementById('ps2Hold').onclick          = onPsActionClick;
  document.getElementById('ps2Investigating').onclick = onPsActionClick;
  document.getElementById('ps2Close').onclick         = onPsActionClick;
  document.getElementById('thsStatus').onchange = onThsStatusChange;
  document.getElementById('wikiLink').onclick = openWikiLink;
  document.getElementById('plLogin').onclick = onLoginClick;
  
  document.getElementById('selectClient').onclick = qSelectClientClick;
//  $("qSelectClient").click(qSelectClientClick);
  

  mtb = document.getElementById('mainTBody');
 
  $("#backgroundPopup").click(function() {
    disablePopup();
  });
  /*
  $(document).keydown(function(e) {
    if (e.keyCode == 27 && popupStatus > 0) {
      disablePopup();
    }
  });
  */
  $("#popupPictCloseTransfer").click(function() {
    if (popupStatus > 0) {            // ����� ������� popup Transfer
      $("#popupTransfer").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // ���� Transfer ��� ������ �� ������ ������� ������, � ��� �� ����, �� ������� � background popup
      $("#backgroundPopup").fadeOut("fast");
    }
  });

  $("#popupPictCloseStatus").click(function() {
    if (popupStatus > 0) {            // ����� ������� popup Status
      $("#popupStatus").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // ���� Status ��� ������ �� ������ ������� ������, � ��� �� ����, �� ������� � background popup
      $("#backgroundPopup").fadeOut("fast");
    }
  });

  $("#popupPictCloseTicket").click(function() {
    disablePopup();
  });

  
  hiddenText = document.getElementById('hiddenText');
  hiddenText.hidden = true;
  
  setInterval(oneMoreSecond, 1000); 
  onBodyResize();  

  $.get("https://oss.unitline.ru:995/adm/", null, callbackAuthorization, "html");

};

/******************************************************************************/
function oneMoreSecond(){
  if(refreshTime > 0){
    refreshTime --;
  }
  if(refreshTime == 0 && netTimeout <= 0){
    loadTickets();
    refreshTime = 180;
  } 
  
  if(netTimeout > 0){        // ���� netTimeout > 0, ������ ���� �����-�� ������� ��������
    netTimeout --;
  }
  if(netTimeout == 0){      // ���� netTimeout = 0, ������ ������� �������� �� �������.
    setStatus(strTimeout); 
    refreshTime = -1; 
    netTimeout = 0;        // ��������� ������.
  } 
  
}

function showIt() {
var str;  
  $("#mainTBody").empty();
  document.getElementById('btResetFilter').hidden = true;
  if(filterUser + filterName + filterClient + filterStatus != "") {
    document.getElementById('btResetFilter').hidden = false;
  }
  for(var key in Tickets) { 
    if(filterUser != "" && Tickets[key].otv != filterUser) continue;  // ���� filterUser �� ���� � ���� ����� ������� �����, ���������� �����
    if(filterName != "" && Tickets[key].name.toUpperCase().indexOf(filterName.toUpperCase()) === -1) continue;  // ���� filterName �� ���� � ���� ����� �� �������������, ���������� �����
    if(filterClient != "" && Tickets[key].client.toUpperCase().indexOf(filterClient.toUpperCase()) === -1) continue;  // ���� filterClient �� ���� � ���� ����� �� �������������, ���������� �����
    if(filterStatus != "" && Tickets[key].status.indexOf(filterStatus) === -1) continue;  // ���� filterStatus �� ���� � ���� ����� �� �������������, ���������� �����
    var ttr = document.createElement('tr');
    ttr.filial = Tickets[key].filial;
    ttr.iidd = Tickets[key].id; 
    
    str = '<tr><td><input type="checkbox"></td><td>' + '<a href="https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp?id=' + Tickets[key].id + '" target="_blank">' + Tickets[key].id + '</a>' + '</td><td>' + Tickets[key].status;
    if(Tickets[key].attention === true){
      str += '(��)';
    }             
    str += '</td><td>' + Tickets[key].data_open + '</td><td>' + Tickets[key].region + '</td><td>' + Tickets[key].author + '</td><td>' + Tickets[key].otv + '</td><td>' + Tickets[key].client + '</td><td>' + Tickets[key].name + '</td><td width = "100px">' + Tickets[key].clas + '</td></tr>';
    ttr.innerHTML = str;
    ttr.children[0].children[0].checked = Tickets[key].checked;

    if(key == highlightedTT){
      ttr.style.backgroundColor = "#FFFFCC";
    }
    mtb.insertBefore(ttr, mtb.children[0]);
  } 
//  document.getElementById('headChBox').checked = false;
}

function renewTickets(data) {
  for(var i = 0; i < data.rows.length;  i ++) {
    var tt = {};
    tt.id = data.rows[i].id;                // 52956
    tt.status = data.rows[i].status;        // Service / ������������"
    tt.data_open = data.rows[i].data_open;  // 05.09.2014 21:42
    tt.region = data.rows[i].region;        // RST
    tt.author = data.rows[i].author;        // ������� �. �.
    tt.otv = data.rows[i].otv;              // ������� �. �. 
    tt.client = data.rows[i].client;        // *M.VIDEO*
    tt.name = data.rows[i].name;            // Wi-Fi SZ �101 �. ������-��-����, ��. ���������������, 157 
    tt.clas = data.rows[i].clas;            // 6. ������ ��� ���� ��������������� ����������� ������ VC. �������� �� ���� ������������������ ��������� �����
    tt.filial = data.rows[i].filial;        // ���������� �������
    tt.branch = data.rows[i].branch;        // ����������� ����������� (��������).<br>��������     
                                            // 	{ "id":"52956", "status":"Service / ������������", "data_open":"05.09.2014 21:42", "data_res":"", "data_close":"", "region":"RST", "author":"������� �. �.", "otv":"������� �. �.", "client":"*M.VIDEO*", "name":"Wi-Fi SZ �101 �. ������-��-����, ��. ���������������, 157", "clas":"", "filial":"���������� �������", "is_group":"-", "branch":"����������� ����������� (��������).<br>��������" }
    tt.attention = false;                   // ����, ��� � ������ ���������� ���. ���� �� ���. ���� ��������� ���������� �� ��� ������������.
    tt.permissions = "";                    // �������� ���� ��������� � ������ ������ ����������� "***"
                              
    if(Tickets[tt.id] === undefined){       // ���� ������ ������ � ������ ��� ���, �������
      Tickets[tt.id] = tt;
      Tickets[tt.id].checked = false;
    }
    else {
      if(tt.otv === userName && Tickets[tt.id].otv !== userName) {  // ���� ���. ���� ���������� �� ��� 
        Tickets[tt.id].attention = true;
        // ��� ������ ���� �������� ������������� ������������� ���� ���. ����
      }
      Tickets[tt.id].status = tt.status;       
      Tickets[tt.id].otv = tt.otv;              
      Tickets[tt.id].clas = tt.clas;           
      Tickets[tt.id].branch = tt.branch;            
    }                                                 
  }
//  addTestTT();
  showIt();
  if(delayedData != "") {                   // ������� � onBtnSaveTTClick ����� ��� ����������� ��������������� ������ � Tickets{} ��� ���� ������ � ���
    callbackGetTicket(delayedData, "sucess");
    delayedData = "";
  }
}

/******************************************************************************/
function addTestTT(){
  var tt = {};
  tt.id = "49300";                // 52956
  tt.status = "Closed / �������";        // Service / ������������"
  tt.data_open = "02.07.2014 21:42";  // 05.09.2014 21:42
  tt.region = "TMN";        // RST
  tt.author = "������ �. �.";        // ������� �. �.
  tt.otv = "��������� �. �.";              // ������� �. �. 
  tt.client = "*M.VIDEO*";        // *M.VIDEO*
  tt.name = "�����: ������ �����: ��.�.�������� �.42 �� '������' Shop 158";            // Wi-Fi SZ �101 �. ������-��-����, ��. ���������������, 157 
  tt.clas = "6";            // 6. ������ ��� ���� ��������������� ����������� ������ VC. �������� �� ���� ������������������ ��������� �����
  tt.filial = "��������� �������";        // ���������� �������
  tt.branch = "����������� ����������� (��������).<br>��������";        // ����������� ����������� (��������).<br>��������     
  tt.attention = false;                   // ����, ��� � ������ ���������� ���. ���� �� ���. ���� ��������� ���������� �� ��� ������������.
                              
  Tickets[tt.id] = tt;
  Tickets[tt.id].checked = false;

}
/******************************************************************************/

function onRespIdChange(){
  filterUser = $("#resp_id_s")[0][$("#resp_id_s")[0].selectedIndex].innerText;
  if($("#resp_id_s")[0].selectedIndex === 0) 
    filterUser = "";
  showIt();
}

function onThsStatusChange(){
  filterStatus = $("#thsStatus")[0][$("#thsStatus")[0].selectedIndex].innerText;
  if($("#thsStatus")[0].selectedIndex === 0) 
    filterStatus = "";
  showIt();
}

function onHeadChBoxClick(){
  var flag = document.getElementById('headChBox').checked;
  for (var i = 0; i < mtb.childElementCount; i ++) {
    Tickets[mtb.children[i].iidd].checked = flag;
  } 
  showIt();
}

function onMainTBodyClick(e) {
  if(e.target.nodeName === "INPUT") {
    Tickets[e.target.parentNode.parentNode.iidd].checked = e.target.checked;
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex != 1 && e.ctrlKey == false){    // ���� �������� �� �� �������, ������� ��������� �����
    document.getElementById('popupTicket').iidd = e.target.parentNode.iidd; // ����� ��������� � popupTicket id ������������� ������
    highlightedTT = e.target.parentNode.iidd;  // �������� ����� ������ ��� ��� ��������� � showIt() 
    showIt();                              
    if(Tickets[e.target.parentNode.iidd].attention === true) 
      Tickets[e.target.parentNode.iidd].attention = false;
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: e.target.parentNode.iidd}, callbackGetTicket, "html");
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 2 && e.ctrlKey == true){    // ���� �������� �� �� ������� c ctrl
    var select = document.getElementById('thsStatus');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        select.onchange();
        break;
      }
    }
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 6 && e.ctrlKey == true){    // ���� �������� �� �� ������� c ctrl
    var select = document.getElementById('resp_id_s');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        onRespIdChange();
        break;
      }
    }
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 7 && e.ctrlKey == true){    // ���� �������� �� �� ������� c ctrl
    document.getElementById('searchClient').value = e.target.innerText;
    document.getElementById('searchClient').oninput();
  }
}

/*
  ������� ��������� ������:
  ��������������� �� �������� ������ �� Tickets[id].permissions
*/

function onLeftTPopupClick(e) {
  var tid = document.getElementById('popupTicket').iidd;
  if(tid === undefined){ return;}
  if(e.target.id === "otv"){     // ���� ��� �� �������������� ����.
    if(Tickets[tid].permissions.indexOf("�����������") != -1){
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html"); 
      loadTickets();
      return;
    }
    if(Tickets[tid].permissions.indexOf("������������� ����") != -1){
      for (var key in Tickets) {
        Tickets[key].checked = false;
      } 
      Tickets[tid].checked = true;
      loadPopupTransfer();
      centerPopupTransfer();
      return;
    }
  }
  if(e.target.id === "stat"){     // ���� ��� �� �������.
    document.getElementById('popupStatus').iidd = tid; // ����� ��������� � popupStatus id ������������� ������
    loadPopupStatus();
    centerPopupStatus();
  } 
}

function onPsActionClick(e) {        // ������ ���� �� ������ ����� ������� � ����� Status (������������, ������, ������� � �.�)
  var tid = document.getElementById('popupTicket').iidd;
  var par = {};
  par.branch_id = "100113";      // ������������� ������ �� ���������
  par.resp_person_id = "931";    // id ������������ �� ���������
  par.trouble_root_tt = "0"; 
  par.trouble_type_closed = "0";
  par.trouble_subtype_closed = "0";
  par.trouble_type_name = "0";
  par.trouble_type_resolution = "1";
  par.id = tid;
  par.region_id = filialToRegionId(Tickets[tid].filial);
  var str = document.getElementById('psComment').value;
  if(str.length === 0){ par.comment = "."; }
  else { par.comment = str; }  
  switch(e.target.id){
    case "ps2Servis": {
      par.status_id = "2";     // � ������������
      break;
    }
    case "ps2Resolved": {
      par.trouble_type_closed = document.getElementById('psClass').value;
      par.trouble_subtype_closed = document.getElementById('psSubClass').value;
      par.trouble_type_name = document.getElementById('psType').value;                   
      par.trouble_type_resolution = document.getElementById('psResolve').value;
      par.status_id = "5";     // ������
      break;
    }
    case "ps2Hold": {
      par.status_id = "4";     // ��������
      break;
    }
    case "ps2Investigating": {
      par.status_id = "3";     // �������������
      break;
    }
    case "ps2Close": {
      par.status_id = "7";     // �������
      break;
    }
  }

  $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", par, callbackGetTicket, "html");
  loadTickets();
  $("#popupStatus").fadeOut("fast");
  popupStatus--;
  return;

}



function onPs2Confirm() {        // ������ "�����������"
  var tid = document.getElementById('popupTicket').iidd;
  if(Tickets[tid].permissions.indexOf("�����������") != -1){
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html");
    loadTickets();
    return;
  }

}

function onStatusNameClick() {   // �� ����� �� ����� ������������ ������������
  if(userId != -1){
    filterUser = userName;
    showIt();
  }
  for(i = 0; i < resp_id.length; i ++) {     // � ������� ��� � ���������� ������
    if(resp_id[i].value === userId) {
      $("#resp_id_s")[0].selectedIndex = i;
      break;
    }
  }
}

function onStatusNameDblClick() {   // �� ����� �� ����� ������������ ������������
  filterUser = "";
  showIt();
  $("#resp_id_s")[0].selectedIndex = 0;
}

function onBtnMoveClick(e) {                                                                             
  loadPopupTransfer();
  centerPopupTransfer();
}

function onBtnRenewClick(e) {
  if(e.ctrlKey == true){
    $.get("https://oss.unitline.ru:995/app/ruser/logoff.asp?refer=/", null, null, "html");
    return;
  }
  loadTickets();
  refreshTime = 180;
 
}
function onBtnNewTTClick (e) {
  loadPopupNewTT();
  centerPopupNewTT();
}

function onBtnSaveTTClick (e) {      // ����� ����� ����� -> ���������
  if($("#shortTTDescr")[0].value.length < 10) return;
  if($("#TTDescr")[0].value.length < 10) return;
  if($("#ppClient")[0].selectedIndex === 0) return;
  if($("#ppRegion")[0].selectedIndex === 0) return;

  var par = {};
  par.id = "0";
  par.ip = "";
  par.name = $("#shortTTDescr")[0].value;
  par.trouble_ticket_type_id = "33";
  par.priority = "1";
  var t = document.getElementById('ppRegion'); 
  par.region_id = t[t.selectedIndex].value;
  t = document.getElementById('ppClient'); 
  par.organization_id = t[t.selectedIndex].value;
  par.descr = $("#TTDescr")[0].value;
  $.post( "https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", 
          par, 
          function () {
            delayedData = data;  // ������� ����� loadTickets() ����� ����� ������������ Tickets{}, ������ ����� �� �������������� �������. ���������������� ����� callbackGetTicket(data); �� ����� �������� Tickets[id].permissions
            loadTickets();
            refreshTime = 180;
          }, 
          "html");
  disablePopup();
}


    
function onBtnAlertClick (e) {
  var str = $("#TTDescr")[0].value;
  if(str.length === 0){
    $("#TTDescr")[0].selectionStart = 0;                                              // �������� ������ � ����� ������
    $("#TTDescr")[0].selectionEnd = str.length;
    document.execCommand("Paste");
    str = $("#TTDescr")[0].value;
  } 
  var adr0 = str.indexOf("� ���������� �������");
  if(adr0 != -1) {str = str.substring(adr0);} 
  var adr1 = str.indexOf("�����: ");
  var adr2 = str.indexOf("�����: ");
  var adr3 = str.indexOf("�����: ");
  if(adr1 === -1 || adr2 === -1 || adr2 === -1) return;
  $("#shortTTDescr")[0].value = str.substring(adr1 + 7, adr2-1) + ", " + str.substring(adr2 + 7, adr3-1);
  for(var i = 0; i < organization_id.length && organization_id[i].text != "*M.VIDEO*"; i ++){}  // ������ � ������ ����������� ������
  if(i != organization_id.length) {
    document.getElementById('ppClient').selectedIndex = i;       // ������� ��� � select
  }
  var adr4 = str.indexOf("**************************");
  if(adr4 != -1) {str = str.substring(0, adr4-1);}
  $("#TTDescr")[0].value = str; 
  var city = str.substring(adr1 + 7, adr2-1);
  if(city === "������"){
    for(var i = 1; i < tt_region.length; i ++){
      if(tt_region[i].text === city){
        document.getElementById('ppRegion').selectedIndex = i;
      } 
    }
  }
  else {
    document.getElementById('ppRegion')[0].text = "����������� �������";
    document.getElementById('ppRegion').disabled = true;
    document.getElementById('wikiLink').text = str.substring(adr1 + 7, adr2-1);     
    $.get("https://ru.wikipedia.org/w/index.php", {search:str.substring(adr1 + 7, adr2-1)}, cbWiki, "html");
  }
}

function qSelectClientClick(e){
  if(e.target.id === "qSelectClient"){
    for(var i = 0; i < organization_id.length && organization_id[i].text != e.target.text; i ++);  // ������ � ������ ����������� ��������� �������
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // ������� ��� � select
    }
  }
}
function onBodyResize() {
   document.body.style.maxHeight = (window.innerHeight - 31) + "px";
}

function setStatus(status) {
  document.getElementById('statusField').innerHTML = status;
}

function onMainTBodyKeyPress(e){
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){
    var str = document.getElementById('comment').value;
    var converted_str = encodeURIComponent(str);
    var iidd = document.getElementById('popupTicket').iidd;
    var param = "id=" + iidd + "&status_id=0&region_id=" + filialToRegionId(Tickets[iidd].filial) + "&comment=" + converted_str;
  }
}

function commentOnKey(e){
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){   // ����� �������� �� ������������ ������
    var par = {};                                          
    par.id = document.getElementById('popupTicket').iidd;
    par.status_id = "0";
    par.comment = document.getElementById('comment').value;
    document.getElementById('comment').value = "";       // Clear text field for not dublicate comments
    $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", 
          par, 
          function() {
            $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "10", id: "1", tt_id: document.getElementById('popupTicket').iidd, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
          }, 
          "html");
    
  }
}

function setTimeout(duration, str){netTimeout = duration;strTimeout = str;}
function resetTimeout(){netTimeout = -1; strTimeout = "";}

function fullName2FIO(fullName) {
  var arrFio = [];
  arrFio = fullName.split(" ", 3);
  if(arrFio.length != 3) 
    return "no_name"; 
  fio = arrFio[0] + " " + arrFio[1].substring(0,1) + ". " + arrFio[2].substring(0,1) + "."; 
  return fio;
}

function onSearchInput() {
  filterName = this.value;
  showIt();
}
function onSearchClientInput() {
  filterClient = this.value;
  showIt();
}
function onTTKeyPress(e) {       // ���� ������ ������
  if(e.keyIdentifier === "Enter"){
    if(!isNaN(parseInt(this.value, 10))){
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: this.value}, callbackGetTicket, "html");
      this.value = "";
    }       
  }
}

function onResetFilterClick() {   // ����� ���� ��������
  document.getElementById('searchClient').value = "";
  filterClient = "";
  document.getElementById('searchStr').value = "";  
  filterName = "";
  document.getElementById('resp_id_s').value = "0";  
  filterUser = "";
  document.getElementById('thsStatus').value = "0";  
  filterStatus = "";
  
  showIt();
}

function openWikiLink() {
  window.open("https://ru.wikipedia.org/w/index.php?search=" + document.getElementById('wikiLink').text, null, null);  
// $.get("https://ru.wikipedia.org/w/index.php", {search:str.substring(adr1 + 7, adr2-1), title:"���������:�����", go:"�������" }, cbWiki, "html");
}

function onLoginClick() {
  setStatus("�����������  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Autorization' TITLE='Autorization'>");
  var par = {};
  par.refer = "";
  par.hex = hex_md5(document.getElementById('sPass').value);
  par.tries = "-1";
  par.user = document.getElementById('sLogin').value;
  par.password = document.getElementById('sPass').value;
  setTimeout(6, "������ �����������");
  $.post("https://oss.unitline.ru:995/adm/login.asp", par, callbackAuthorization, "html");
  document.getElementById('sLogin').value = "";           // ������ ��� ������������
  document.getElementById('sPass').value = "";            // ������ ������ 
  disablePopup();

}