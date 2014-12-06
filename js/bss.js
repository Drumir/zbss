//
//    BSS Parser by drumir@mail.ru
//
//
var Tickets = {};           // ������ ���� ���������� ������� � ������� {id: {id:"10547", status: "", open: "", ....., permissions:"�������� ������ ��������� � ���� ������", timer:"������� ����� �������� �� ������"}}. ��������������� ��� � n ������
var transQueue = [];        // ������� �������� �� ������� ������.
var hiddenText;             // ���������� - TEXTAREA
var a, b;
var transAnsiAjaxSys = [];
var Tabs = {};             // ������ ������ �����/�������� � ������� id:{name:"", text:"������������ ������"}


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
var newSelectedIndex = 0;  // ���������� ��� onchange � onmouseup ����������� ������ ������� �� �������

var forceShow = true;     // ���������, ��� ������ ����� ��� ����� ������� ��������
var highlightedTT = 0;    // ������ ��������� ��������� ����� ��� ��� ���������.
var TTOkTransferCount = 0; // ������ ���������� ������� ������������ �������
var TTErTransferCount = 0; // ������ ���������� ������ ��� �������� �������

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
  document.getElementById('comment').onkeypress = commentOnKey;
  document.getElementById('sPass').onkeypress = sPassKeyPress;
  document.getElementById('popupTicket').onclick = onTPopupClick;
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
  document.getElementById('thsStatus').onmouseup = onThsStatusMouseUp;
  document.getElementById('wikiLink').onclick = openWikiLink;
  document.getElementById('plLogin').onclick = onLoginClick;
  document.getElementById('selectClient').onclick = qSelectClientClick;
  document.getElementById('tabsTable').onclick = onTabsClick;
  document.getElementById('PTtimer').onclick = setTimer;

  mtb = document.getElementById('mainTBody');

  prepareToAnsi();                            // �������������� ������� ��� ���������������

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

    // ������� ��������������
  $.ajax({url: "https://oss.unitline.ru:995/adm/", data: null, dataType : "html", contentType : "application/x-www-form-urlencoded; charset=windows-1251", error: onLoadError, success: callbackAuthorization});

}
function onLoadError(jqXHR, textStatus){      // callback ��� �������� �����������
  if(jqXHR.status == 404 && textStatus == "error") {
    setStatus("�� ���� ������� �������� BSS. �������� ��� ��� �� ������� � Chrome");
  }
}

/******************************************************************************/
function oneMoreSecond(){
  if(refreshTime > 0){
    refreshTime --;
    document.getElementById('buttonRenew').innerText = "�������� (" + refreshTime + ")";
  }
  if(refreshTime == 0 && netTimeout <= 0){
    loadTickets();
    refreshTime = 60;
  }
  if(netTimeout > 0){        // ���� netTimeout > 0, ������ ���� �����-�� ������� ��������
    netTimeout --;
  }
  if(netTimeout == 0){      // ���� netTimeout = 0, ������ ������� �������� �� �������.
    setStatus(strTimeout);
    refreshTime = 60;
    netTimeout = 0;        // ��������� ������.
  }
}

function showIt() {         // ���������� ������� �������
  var str = "";
  var stat = {begin:0, service:0, resolved:0, investigating:0, hold:0, closed:0};

  document.getElementById('tabsTable').hidden = true;      // ������� ������ ��������
  for(var key in Tabs) {                                   // �������� ������ ����������
    str = '<td id="' + key + '">' + key + ' ' + Tabs[key].name + '</td>' + str;
  }
  if(str.length > 0) {                                     // ���� ���� ���� ���� ��������, ������� ������
    document.getElementById('tabsTable').hidden = false;
  }
  document.getElementById('tabs').innerHTML = str;

  $("#mainTBody").empty();
  document.getElementById('btResetFilter').hidden = true;
  if(filterUser + filterName + filterClient + filterStatus != "") {
    document.getElementById('btResetFilter').hidden = false;
  }
  for(var key in Tickets) {
    if(filterUser != "" && Tickets[key].otv != filterUser) continue;  // ���� filterUser �� ���� � ���� ����� ������� �����, ���������� �����
    if(filterName != "" && Tickets[key].name.toUpperCase().indexOf(filterName.toUpperCase()) === -1) continue;  // ���� filterName �� ���� � ���� ����� �� �������������, ���������� �����
    if(filterClient != "" && Tickets[key].client.toUpperCase().indexOf(filterClient.toUpperCase()) === -1) continue;  // ���� filterClient �� ���� � ���� ����� �� �������������, ���������� �����
    if(filterStatus != "" && filterStatus.indexOf(Tickets[key].status) === -1) continue;  // ���� filterStatus �� ���� � ���� ����� �� �������������, ���������� �����
    var ttr = document.createElement('tr');
    ttr.filial = Tickets[key].filial;
    ttr.iidd = Tickets[key].id;

    str = '<tr><td><input type="checkbox"></td><td>' + '<a href="https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp?id=' + Tickets[key].id + '" target="_blank">' + Tickets[key].id + '</a>' + '</td><td>' + Tickets[key].status;
/*    if(Tickets[key].attention === true){
      str += '(��)';
    }*/
    str += '</td><td>' + Tickets[key].data_open + '</td><td>' + Tickets[key].region + '</td><td>' + Tickets[key].author + '</td><td>' + Tickets[key].otv + '</td><td>' + Tickets[key].client + '</td><td>' + Tickets[key].name + '</td><td width = "100px">' + Tickets[key].clas + '</td></tr>';
    ttr.innerHTML = str;
    ttr.children[0].children[0].checked = Tickets[key].checked;

    switch(Tickets[key].status) {
      case "����������": {stat.begin ++; break;}
      case "Service / ������������": {stat.service ++; break;}
      case "Resolved / ������": {stat.resolved ++; break;}
      case "Investigating / �������������": {stat.investigating ++; break;}
      case "Hold / ��������": {stat.hold ++; break;}
      case "Closed / �������": {stat.closed ++; break;}
    }

    if(key == highlightedTT){
      ttr.style.backgroundColor = "#FFFFCC";
    }
    mtb.insertBefore(ttr, mtb.children[0]);
  }
  document.getElementById('statusFieldRight').innerText = "����������:" + stat.begin + " ������������:" + stat.service + " ������:" + stat.resolved + " �������������:" + stat.investigating + " ��������:" + stat.hold + " �������:" + stat.closed + "   �����:" + (stat.begin + stat.service + stat.resolved + stat.investigating + stat.hold + stat.closed);
}

function renewTickets(data) {
  for(var key in Tickets)               // ������� ������ ����� � ������ ��� ��� �� �����������
    Tickets[key].renewed = false;

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
    tt.timer = 0;                          // ������-����������� ��������

    if(Tickets[tt.id] === undefined){       // ���� ������ ������ � ������ ��� ���, �������
      Tickets[tt.id] = tt;
      Tickets[tt.id].checked = false;
      Tickets[tt.id].renewed = true;
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
      Tickets[tt.id].renewed = true;
    }
  }

  for(var key in Tickets)               // ������ �� ������ ��� ������, ������� �� ����������. (���, ��������, ��� �������)
    if(Tickets[key].renewed == false)
      delete Tickets[key];

  showIt();
  if(delayedData != "") {                   // ������� � onBtnSaveTTClick ����� ��� ����������� ��������������� ������ � Tickets{} ��� ���� ������ � ��
    callbackGetTicket(delayedData, "sucess");
    delayedData = "";
  }
}

/******************************************************************************/
/******************************************************************************/

function onRespIdChange(){
  filterUser = $("#resp_id_s")[0][$("#resp_id_s")[0].selectedIndex].innerText;
  if($("#resp_id_s")[0].selectedIndex === 0)
    filterUser = "";
  showIt();
}

function onThsStatusChange(){   // �.�. � ������� onchange ������ ������ ����� �� ����, ������ �������� ����� ������ � newSelectedIndex
  newSelectedIndex = document.getElementById('thsStatus').selectedIndex;
  if(newSelectedIndex == 0)
    filterStatus = "";
  showIt();
}

function onThsStatusMouseUp(e){  // ����� onchange ����� onmouseup �� �������� �� ������ ������ ����� � �������� ��������������� ������
  if(newSelectedIndex > 0){
    if(e.shiftKey == true){
      filterStatus += $("#thsStatus")[0][newSelectedIndex].innerText;
    }else {
      filterStatus = $("#thsStatus")[0][newSelectedIndex].innerText;
    }
  newSelectedIndex = 0;
  showIt();
  }
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
  if(e.target.nodeName === "TD" && e.target.cellIndex != 1 && e.ctrlKey == false && e.shiftKey == false){    // ���� �������� �� �� �������, ������� ��������� �����
    document.getElementById('popupTicket').iidd = e.target.parentNode.iidd; // ����� ��������� � popupTicket id ������������� ������
    highlightedTT = e.target.parentNode.iidd;  // �������� ����� ������ ��� ��� ��������� � showIt()
    showIt();
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: e.target.parentNode.iidd}, callbackGetTicket, "html");
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 2 && (e.ctrlKey == true || e.shiftKey == true) ){    // ���� �������� �� ������� c ctrl ��� shift
    var select = document.getElementById('thsStatus');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        newSelectedIndex = i;
        onThsStatusMouseUp(e);
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

function onTPopupClick(e) {
  var tid = document.getElementById('popupTicket').iidd;
  if(tid === undefined){ return;}

  switch(e.target.id){
    case "otv":{     // ���� ��� �� �������������� ����.
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
      break;
    }
    case "stat":{     // ���� ��� �� �������.
      document.getElementById('popupStatus').iidd = tid; // ����� ��������� � popupStatus id ������������� ������
      loadPopupStatus();
      centerPopupStatus();
      break;
    }
    case "toTabs":{     // ���� ��� �� "� ��������".
      if(Tabs[tid] === undefined){
        var tab = {};
        tab.name = Tickets[tid].name;  // �������� ��� ��� �����������
        tab.text = document.getElementById('comment').value; // �������� ���������� �����
        Tabs[tid] = tab;
      }else{
        delete Tabs[tid];
      }
      disablePopup();
      showIt();
      break;
    }
    case "plus05":{     // ���� �� �������� 0,5 ����.
      break;
    }
    case "plus1":{     // ���� �� �������� 1 ���.
      break;
    }
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
    $("#popupStatus").fadeOut("fast");
    popupStatus--;
    return;
  }

}

function onStatusNameClick(e) {   // �� ����� �� ����� ������������ ������������
  if(e.ctrlKey == true){       // ���� �������� � Ctrl - ������������.
    $.get("https://oss.unitline.ru:995/app/ruser/logoff.asp?refer=/", null, callbackAuthorization, "html");
    return;
  }
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

function onBtnMoveClick(e) {
  loadPopupTransfer();
  centerPopupTransfer();
}

function onBtnRenewClick(e) {
  loadTickets();
  refreshTime = 60;
}
function onBtnNewTTClick (e) {
  loadPopupNewTT();
  centerPopupNewTT();
}

function onBtnSaveTTClick (e) {      // $.ajax ������       //����� ����� ����� -> ���������
  if($("#shortTTDescr")[0].value.length < 10) return;
  if($("#TTDescr")[0].value.length < 10) return;
  if($("#ppClient")[0].selectedIndex === 0) return;
  if($("#ppRegion")[0].selectedIndex === 0) return;
  var id = document.getElementById('ppRegion');
  var rid = id[id.selectedIndex].value;
  id = document.getElementById('ppClient');
  var cid = id[id.selectedIndex].value;
  var param = "id=0&ip=&name=" + encodeURIComponent($("#shortTTDescr")[0].value) + "&trouble_ticket_type_id=33&priority=1";
  param += "&region_id=" + rid + "&organization_id=" + cid + "&descr=" + encodeURIComponent($("#TTDescr")[0].value);
  $.ajax({
    url: "https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt_process.asp",
    type: "POST",
    data: param,
    dataType : "html",
    contentType : "application/x-www-form-urlencoded; charset=windows-1251",
    success : onTtEditProcessSuccess
  });
  disablePopup();
}
function onTtEditProcessSuccess(data, textStatus) {  // Callback ��� �������� ������� onBtnSaveTTClick(e)
  delayedData = data;  // ������� ����� loadTickets() ����� ����� ������������ Tickets{}, ������ ����� �� �������������� �������. ���������������� ����� callbackGetTicket(data); �� ����� �������� Tickets[id].permissions
  loadTickets();
  refreshTime = 60;
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
  if(city === "������" || city === "�����-���������"){
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
  document.getElementById('statusFieldLeft').innerHTML = status;
}

function onMainTBodyKeyPress(e){
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){

  }
}

function commentOnKey(e){     //$.ajax ������
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){     // ����� �������� �� ������������ ������
    var str = document.getElementById('comment').value;
    document.getElementById('comment').value = "";       // Clear text field for not dublicate comments
    var converted_str = encodeURIComponent(str);
    var iidd = document.getElementById('popupTicket').iidd;
    var param = "id=" + iidd + "&status_id=0&comment=" + converted_str;
    $.ajax({
      url: "https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp",
      type: "POST",
      data: param,
      dataType : "html",
      contentType : "application/x-www-form-urlencoded; charset=windows-1251",
    })
  $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "10", id: "1", tt_id: iidd, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
  }
}

function sPassKeyPress(e){     //������� ����� � ���� ����� ������
  if(e.keyIdentifier === "Enter" && document.getElementById('sPass').value.length > 0){     //
    onLoginClick();
  }
}

function mySetTimeout(duration, str){netTimeout = duration;strTimeout = str;}
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
  mySetTimeout(12, "������ �����������");
  $.post("https://oss.unitline.ru:995/adm/login.asp", par, callbackAuthorization, "html");
  document.getElementById('sLogin').value = "";           // ������ ��� ������������
  document.getElementById('sPass').value = "";            // ������ ������
  disablePopup();

}

function onTabsClick(e){
  if(e.ctrlKey == false){
    document.getElementById('popupTicket').iidd = e.target.id; // ����� ��������� � popupTicket id ������������� ������
    highlightedTT = e.target.id;  // �������� ����� ������ ��� ��� ��������� � showIt()
    showIt();
    document.getElementById('comment').value = Tabs[e.target.id].text;
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: e.target.id}, callbackGetTicket, "html");
  }else{
    delete Tabs[e.target.id];
    showIt();
  }
}

function prepareToAnsi(){
// �������������� ������� ��������
  for (var i = 0x410; i <= 0x44F; i++) {
    transAnsiAjaxSys[i] = i - 0x350; // �-��-�
  }
  transAnsiAjaxSys[0x401] = 0xA8;    // �
  transAnsiAjaxSys[0x451] = 0xB8;    // �
  transAnsiAjaxSys[0x2116] = 0xB9;    // �

  //var escapeOrig = window.escape;
  // �������������� ������� escape()
  window.encodeURIComponent = function(str) {
    var ret = [];
    // ���������� ������ ����� ��������, ������� ��������� ���������
    for (var i = 0; i < str.length; i++){
      var n = str.charCodeAt(i);
      if (typeof transAnsiAjaxSys[n] != 'undefined')
        n = transAnsiAjaxSys[n];
      if (n <= 0xFF)
        ret.push(n);
    }
    var s = escape(String.fromCharCode.apply(null, ret));
    var j = s.indexOf("+");                              // ������������� "+"
    while(j != -1) {
      s = s.substring(0, j) + "%2B" + s.substring(j+1);
      j = s.indexOf("+");
    }
    return s;
  }
}

function setTimer(e){
  var tid = document.getElementById('popupTicket').iidd;
  var now = new Date();
  now = now.getTime();
  if(Tickets[tid].timer < now)
    Tickets[tid].timer = now;

  switch(e.target.id){
    case "plus5": {
      Tickets[tid].timer += 5;
      break;
    }
    case "plus15": {
      Tickets[tid].timer += 15*60000;
      break;
    }
    case "plus1": {
      Tickets[tid].timer += 60*60000;
      break;
    }
    case "plus3": {
      Tickets[tid].timer += 180*60000;
      break;
    }
    case "plus6": {
      Tickets[tid].timer += 360*60000;
      break;
    }
    case "plus0": {
      Tickets[tid].timer = 0;
      break;
    }
  }
  var t = Math.floor((Tickets[tid].timer - now)/60000);
  var h = Math.floor(t/60);
  var m = t - h*60;
  var str = "&nbsp;�����&nbsp;";
  if(h < 10) str += "&nbsp";
  str += h + "�&nbsp;";
  if(m < 10) str += "&nbsp";
  str += m + "�";
  document.getElementById('timeLeft').innerHTML = str;
}