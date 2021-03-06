/*-----------------------------------------------------------------------------+
|  Project: ZBSS Chrome App
|  Copyright (c) 2014-2016 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/
var Tickets = {};           // ?????? ???? ?????????? ??????? ? ??????? {id: {id:"10547", status: "", open: "", ....., permissions:"???????? ?????? ????????? ? ???? ??????", timer:"??????? ????? ???????? ?? ??????", unpostedComm: "????????, ?? ??????????? ???????????"}}. ??????????????? ??? ? n ??????
var transQueue = [];        // ??????? ???????? ?? ??????? ??????.
var TicketsViewHistory = [];// ?????? ??? ???????? ??????? ????????? ???????.
var hiddenText;             // ?????????? - TEXTAREA
var a, b;
var transAnsiAjaxSys = [];
var Tabs = {};             // ?????? ?????? ?????/???????? ? ??????? id:{name:"", text:"???????????? ??????"}

var userName;              // ??? ???????????? ???????????? ?????? ?.?.
var userId = -1;           // ????????????? ???????????? ????????????
var branchId = 100184;     // ??? ????????????? ???????????? 100184 == "??????????? ??????????? (????????) (13)" !!!!!!
var resp_id = [];          // ?????? ???? ????????????? ???
var organization_id = [];  // ?????? ???? ????????
var tt_region = [];        // ?????? ???? ??????
var tt_status_id = [];     // ?????? ???????? ??????
var branch_id = [];        // ?????? ????????????? ???????
var zGroups = [];          // ?????? (??????) ????? (????? ????????) ? ???????
var zGroupsObj = {};       // ?????? ????? ? ??????? ? ??????? groupid:name
var zResponse = {};        // ????????? ?????? ????????? ??????, ???????? ? ?????? (??? ??????? ShowZList())
var watchPingArr = [];     // ????? ????? ??????, ? ??????? ?????????? ????????? ping
var mtb;                   // Main Table Body
var refreshTime = -1;      // ??????? ?????? ???????? ?? ??????????.
var netTimeout = -1;       // ??? ??????????? ????????? ??????? ????????. >0 - ???? ??????. ==0 - ???????? ???????????. <0 - ?????????
var strTimeout = "";
var filter = {user:"", name:"", status:"", client:"", notClient:"", region:"", regionFull:"", history:false};
var addTicketToHistory = true; // ????????? ????? ?? ????????? ??????????? ????? ? ??????? ??????????

var delayedData = "";      // ????? ???????? html ??? ???????? ??????????????? ?????? (? ??????? ?????????? ??? callbackGetTicket) ? ???, ????? ????? ???? ????? ????? ???????????? Tickets{}, ???????? ????? ? ??? ????????????
var newbornTT = {};        // ????? ???????? ????????? ???????????? zhostid ? name ??? ???????????? ?????? ? ??? ????? renewTickets ????? ?????????? hostid ? ???? ?? ????? ?????????? ???????

var forceShow = true;     // ?????????, ??? ?????? ????? ??? ????? ??????? ????????
var highlightedTT = 0;    // ?????? ????????? ????????? ????? ??? ??? ?????????.
var TTOkTransferCount = 0; // ?????? ?????????? ??????? ???????????? ???????
var TTErTransferCount = 0; // ?????? ?????????? ?????? ??? ???????? ???????
var dontCheckTransferPermissions = false;  // ?? ????????? ???????? ????????????? ???????? ??????
var closedTTduration =  7; // ?????? ???????????? ??????? ??????? ???????? ?????? ? ????

var checkResolved = false; // ????? ?? ??????? ?? ????????, ????????????? ? ??????

var zoptions = {};         // ??? ???????? ? ???????
zoptions.url = 'https://zabbix.msk.unitline.ru/zabbix/api_jsonrpc.php';
var zApiVersion = "";
var zEnabled = false;     // false ???? ??????? ?????????? ??? ????????.
var zSessionId;

var sqlServerAdress = ""; // ????? ??????? ???????? ? ??????? http://drumir.16mb.com/ajax.php
var mySqlLastRenew = "";  // timestamp ?????????? ?????????? ???????? TT -> hostId

var winManager = {};

window.onload = function() {          //

  winManager = new WinManager();

  document.getElementById('buttonNew').onclick = onBtnNewTTClick;
  document.getElementById('ppBtnCreate').onclick = onBtnSaveTTClick;
  document.getElementById('peBtnCreate').onclick = onBtnSaveEditTTClick;
  document.getElementById('ppBtnAlert').onclick = onBtnAlertClick;
  document.getElementById('ppBtnToTabs').onclick = onBtnNewToTabsClick;
  document.getElementById('btResetFilter').onclick = onResetFilterClick;
  document.getElementById('btnTransOnSelf').onclick = onBtnTransOnSelfClick;
  document.getElementById('buttonTransfer').onclick = onButtonTransferClick;
  document.getElementById('buttonTransfer').disabled = false;
  document.getElementById('popupTransfer').onclick = onPopupTransferClick;
  document.getElementById('ptPost').onclick = commentOnKey;
  document.body.onresize = onBodyResize;
  document.getElementById('headChBox').onchange = onHeadChBoxClick;
  document.getElementById('ptPingCBox').onchange = onPingCBoxClick;
  document.getElementById('buttonMove').onclick = onBtnMoveClick;
  document.getElementById('buttonMove').disabled = false;
  document.getElementById('buttonRenew').onclick = onBtnRenewClick;
  document.getElementById('buttonRenew').disabled = false;
  document.getElementById('mainTBody').onclick = onMainTBodyClick;
  document.getElementById('pzFound').onclick = onPzFoundTBodyClick;
  document.getElementById('mainTBody').onmousedown = onMTBmouseDown;
  document.getElementById('mainTBody').onkeydown = onMainTBodyKeyPress;
  document.getElementById('statusName').onclick = onStatusNameClick;
  document.getElementById('comment').onkeypress = commentOnKey;
  document.getElementById('comment').onblur = commentOnBlur;
  document.getElementById('comment').oninput = commentOnInput;
  document.getElementById('sPass').onkeypress = sPassKeyPress;
  document.getElementById('popupTicket').onclick = onTPopupClick;
  document.getElementById('searchStr').oninput = onSearchInput;
  document.getElementById('searchClient').oninput = onSearchClientInput;
  document.getElementById('pzLocation').oninput = onzLocationEdit;
  document.getElementById('pzLocation').onkeypress = onzLocationKey;
  document.getElementById('searchTT').onkeydown = onTTKeyPress;
  document.getElementById('LsSearchTT').onkeydown = onLsTTKeyPress;
  document.getElementById('ptHostId').onkeydown = onHostidEnter;
  document.getElementById('psClass').onchange = getSubClass;
  document.getElementById('psSubClass').onchange = onPsSubClassChange;
  document.getElementById('branchLiist').onchange = GetCPList;
  document.getElementById('ps2Confirm').onclick = onPs2Confirm;
  document.getElementById('ps2Servis').onclick        = onPsActionClick;
  document.getElementById('ps2Resolved').onclick      = onPsActionClick;
  document.getElementById('ps2Hold').onclick          = onPsActionClick;
  document.getElementById('ps2Investigating').onclick = onPsActionClick;
  document.getElementById('ps2Close').onclick         = onPsActionClick;
  document.getElementById('ps2Edit').onclick          = onPsActionClick;
  document.getElementById('thsStatus').onchange = onThsStatusChange;
  document.getElementById('pzClient').onchange = onPzClientChange;
  document.getElementById('wikiLink').onclick = openWikiLink;
  document.getElementById('plLogin').onclick = onLoginClick;
  document.getElementById('selectClient').onclick = qSelectClientClick;
  document.getElementById('tabsTable').onclick = onTabsClick;
  document.getElementById('tabsTable').onmousedown = onTabsMouseDown;
  document.getElementById('PTtimer').onclick = setTimer;
  document.getElementById('ptFindHostId').onclick = onPtFindHostIdClick;
//  document.getElementById('pnFindHostId').onclick = onPnFindHostIdClick;
  document.getElementById('pzBtnCancel').onclick = onPzBtnCancelClick;
  document.getElementById('pzBtnOk').onclick = onPzBtnOkClick;
  document.getElementById('pzRunScripts').onclick = onPzRunScriptsClick;
  document.getElementById('about').onclick = onAboutClick;
  document.getElementById('prsCloseBtn').onclick = onPrsCloseBtnClick;
  document.getElementById('psCopyImg').onclick = onPsCopyImgClick;
  document.getElementById('backgroundPopup').onclick = function(){winManager.hideUper()};
  document.getElementById('options').onclick = onVersionClick;
  document.getElementById('poSave').onclick = onPoSaveClick;
  document.getElementById('pzNotInZbx').onclick = onPzNotInZbxClick;
  document.getElementById('historyLink').onclick = onHistoryLinkClick;
  mtb = document.getElementById('mainTBody');

  prepareToAnsi();                            // ?????????????? ??????? ??? ???????????????

  hiddenText = document.getElementById('hiddenText');
  hiddenText.hidden = true;

  setInterval(oneMoreSecond, 1000);
  setInterval(timeToCheckPing, 240000);     // ??? ? 4 ????? ????????? ??????????? ?????
  setInterval(function(){
                        $.ajax({url: "https://bss.vconnect.ru/adm/", type: "GET", data:null, dataType:"html", contentType:"application/x-www-form-urlencoded; charset=windows-1251", error: onLoadError, success: callbackAuthorization});
                        }
                        , 3600500);     // ??? ? ??? ???????????????????? ?? bss
  setInterval(function(){
                        $.ajax({url: "https://zabbix.msk.unitline.ru/zabbix/index.php", type: "POST", data:"request=&name=monitoring&password=monitoring&autologin=1&enter=Sign+in", dataType:"html", error: cbZAuthErr, success: cbZAuthOk});                        
                        }
                        , 3602500);     // ??? ? ??? ???????????????????? ?? zabbix GUI  
                        
  setInterval(zabbixApiAuth, 3601500);     // ??? ? ??? ???????????????????? ? zabbix API
  onBodyResize();
  chrome.storage.local.get(null, cbRememberPass);  // ????????? ?? ????????? ????????? ? ???/?????? (???/?????? ????? ? ?? ???????????)

     // ??????????? ? Zabbix API
  zabbixApiAuth();

    // ??????????? ? Zabbiz      ?? ??? ?????? ???????? ? JSON ??????? ????? API. ?????????? ????????????? ???????????????? ????? ????? ?????? ? html ?????????
  $("#char3").css({"color":"orange"});
  $.ajax({url: "https://zabbix.msk.unitline.ru/zabbix/index.php", type: "POST", data:"request=&name=monitoring&password=monitoring&autologin=1&enter=Sign+in", dataType:"html", error: cbZAuthErr, success: cbZAuthOk});

    // ??????????? ? BSS
  $("#char1").css({"color":"orange"});
  $.ajax({url: "https://bss.vconnect.ru/adm/", type: "GET", data:null, dataType:"html", contentType:"application/x-www-form-urlencoded; charset=windows-1251", error: onLoadError, success: callbackAuthorization});

}

function zabbixApiAuth() {    // ??????????? ? Zabbix API
  $("#char0").css({"color":"orange"});
  zserver = new $.jqzabbix(zoptions);
  zserver.getApiVersion(null, function(response){
      zApiVersion = response.result;
      zoptions.username = "monitoring";
      zoptions.password = "monitoring";
      zserver.setOptions(zoptions);
      zserver.userLogin(null, null, cbZAuthErr, zGetGroups);
  }, cbZgetApiErr, null);   
}

function onLoadError(jqXHR, textStatus){      // callback ??? ???????? ???????????
  $("#char1").css({"color":"red"});
  if(jqXHR.status == 404 && textStatus == "error") {
    setStatus("?? ???? ??????? ???????? BSS. ???????? ??? ??? ?? ??????? ? ?????, ??? ??? ?????.");
  }
}
function onAboutClick(){
}

function cbZgetApiErr() {
  $("#char0").css({"color":"red"});
  zEnabled = false;
  setStatus("?? ???? ??????? Zabbix. ???????? ???????? ??? ?? ??????? ? ?????, ??? ??? ?????.");
}

function cbZAuthErr(data, status) {
  $("#char3").css({"color":"red"});
  zEnabled = false;
  setStatus("?????? ??????????? ? Zabbix");
}

function cbZAuthOk(data, status) {
  $("#char3").css({"color":"green"});
  zEnabled = true;
  var adr = data.indexOf('id="sid" name="sid" value="');
  data = data.substring(adr + 27);
  adr = data.indexOf('">');
  zSessionId = data.substring(0, adr);
  setStatus("???????? ??????????? ? Zabbix");
}

/******************************************************************************/
function oneMoreSecond(){
  if(refreshTime > 0 && filter.status != "Closed / ???????")  // ???? ???????? ? "????????" ??????, ?????? ????????? ?? ????
  {
    refreshTime --;
    document.getElementById('buttonRenew').innerText = "???????? (" + refreshTime + ")";
  }
  if(refreshTime == 0 && netTimeout <= 0){
    loadTickets();
    refreshTime = 60;
  }
  if(netTimeout > 0){        // ???? netTimeout > 0, ?????? ???? ?????-?? ??????? ????????
    netTimeout --;
  }
  if(netTimeout == 0){      // ???? netTimeout = 0, ?????? ??????? ???????? ?? ???????.
    setStatus(strTimeout);
    refreshTime = 60;
    netTimeout = 0;        // ????????? ??????.
  }
  var fNeedRepaint = false;
  var now = new Date();           // ??? ? ??????? ????????? ??? ?????? ?? ?????????. ?? ????? ???!
  now = now.getTime();
  for(var key in Tickets) {
    if(Tickets[key].timer != 0 && Tickets[key].timer < now){
      Tickets[key].timer = 0;          // ???????? ??????
      Tickets[key].redAttention = true;   // ??????? ????? ??? ????????? ????????
      fNeedRepaint = true;
    }
  }
  if(fNeedRepaint) {showIt();}
}

function timeToCheckPing(){
//  if(netTimeout <= 0 && watchPingArr.length == 0){ // ??? ? 6 ?????, ???? ??? ???????? ???????? ? ?????????? ????? ????????, ????????? ??????????? ??????
  if(watchPingArr.length == 0){ // ??? ? 6 ?????, ???? ??? ???????? ???????? ? ?????????? ????? ????????, ????????? ??????????? ??????
    checkPing();
  }
}


function showIt() {         // ?????????? ??????? ???????
  var str = "";
  var stat = {begin:0, service:0, resolved:0, investigating:0, hold:0, closed:0};
  var fNeedRedAttention = false;    // ????, ??? ? ??????-?? ?????? ????? ?????? ? ?? ??????? ????????
  var fNeedGreenAttention = false;    // ????, ??? ? ??????-?? ?????? ??????? ? ?? ????? ?? ??????????.
  var fNeedOrangeAttention = false;    // ????, ??? ?????-?? ????? ???????? ? ???????.

  document.getElementById('tabsTable').hidden = true;      // ??????? ?????? ????????
  if(Object.keys(Tabs).length > 0){                          // ???? ???? ???????? - ????????? ??
    str = "";
    for(var key in Tabs) {                                   // ?????????? HTML ??? ?????? ????????
      if(Tickets[key] != undefined && Tickets[key].redAttention === true){ str += '<td id="' + key + '" style="background-color:#F87777">';}
      else {str += '<td id="' + key + '">';}
      str += key + ' ' + Tabs[key].name + '</td>';
    }
    document.getElementById('tabs').innerHTML = str;
    document.getElementById('tabsTable').hidden = false;
  }

  $("#mainTBody").empty();
  document.getElementById('btResetFilter').hidden = true;
  if(filter.user + filter.name + filter.client + filter.status + filter.region + filter.notClient != "" || filter.history) {
    document.getElementById('btResetFilter').hidden = false;
  }  
  var List = [];
  if(filter.history){       // ???? ????????????? ???????
    for(var key in TicketsViewHistory)
      List.push(Tickets[TicketsViewHistory[key]]); // ??????? List ?? ????????? Ticket ? ??????? TicketsViewHistory
  }
  else {
    List = Tickets; 
  }  
  for(var key in List) {
    if(filter.user != "" && List[key].otv != filter.user) continue;  // ???? filterUser ?? ???? ? ???? ????? ??????? ?????, ?????????? ?????
    if(filter.name != "" && List[key].name.toUpperCase().indexOf(filter.name.toUpperCase()) === -1) continue;  // ???? filterName ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
    if(filter.client != "" && List[key].client.toUpperCase().indexOf(filter.client.toUpperCase()) === -1) continue;  // ???? filterClient ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
    if(filter.notClient != "" && filter.notClient.toUpperCase().indexOf(List[key].client.toUpperCase()) != -1) continue;  // ???? filter.notClient ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
 //   if(filter.notClient != "" && List[key].client.toUpperCase().indexOf(filter.notClient.toUpperCase()) != -1) continue;  // ???? filter.notClient ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
    if(filter.region != "" && List[key].region != filter.region) continue;  // ???? filterRegion ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
    if(filter.status != "" && filter.status.indexOf(List[key].status) === -1) continue;  // ???? filterStatus ?? ???? ? ???? ????? ?? ?????????????, ?????????? ?????
    if(filter.history === false && List[key].renewed === false ) continue;  // ????????????? ?????? ?????????? ?? ?????
    var ttr = document.createElement('tr');
    ttr.filial = List[key].filial;
    ttr.iidd = List[key].id;

    str = '<tr><td><input type="checkbox"></td><td>' + '<a href="https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp?id=' + List[key].id + '" target="_blank">' + List[key].id + '</a>' + '</td><td style="color:'+ statusToColor(List[key].status) + '; font-weight:600">' + List[key].status;
    str += '</td><td>' + List[key].data_open + '</td><td>' + List[key].region + '</td><td>' + List[key].author + '</td><td>' + List[key].otv + '</td><td>' + List[key].client + '</td><td>' + List[key].name + '</td><td width = "100px">' + List[key].clas + '</td></tr>';
    ttr.innerHTML = str;
    ttr.children[0].children[0].checked = List[key].checked;

    switch(List[key].status) {
      case "??????????": {stat.begin ++; break;}
      case "Service / ????????????": {stat.service ++; break;}
      case "Resolved / ??????": {stat.resolved ++; break;}
      case "Investigating / ?????????????": {stat.investigating ++; break;}
      case "Hold / ????????": {stat.hold ++; break;}
      case "Closed / ???????": {stat.closed ++; break;}
    }

    if(key == highlightedTT){
      ttr.style.backgroundColor = "#FFFFCC"; // ????????? ?????
    }
    if(List[key].redAttention === true){
      ttr.style.backgroundColor = "#F87777"; // ????? ????????? ????????
      fNeedRedAttention = true;
    }
    if(List[key].orangeAttention === true){
      ttr.style.backgroundColor = "#F87700"; // ????? ????????? ????????
      fNeedOrangeAttention = true;
    }
    if(List[key].greenAttention === true){
      ttr.style.backgroundColor = "#77F877"; // ????? ????????? ????????
      fNeedGreenAttention = true;
    }
    mtb.insertBefore(ttr, mtb.children[0]);
  }
  document.getElementById('statusFieldRight').innerHTML = "";
  if(fNeedRedAttention) document.getElementById('statusFieldRight').innerHTML = '<span style="color:#FF0000; font-weight:bold">????????!&nbsp;&nbsp;&nbsp;</span>';
  if(fNeedGreenAttention) document.getElementById('statusFieldRight').innerHTML += '<span style="color:#008800; font-weight:bold">????????&nbsp;&nbsp;&nbsp;</span>';
  if(fNeedOrangeAttention) document.getElementById('statusFieldRight').innerHTML += '<span style="color:#F87700; font-weight:bold">????????&nbsp;&nbsp;&nbsp;</span>';
  if(filter.history) mainTBody.style.backgroundColor = "#E9CC8B";
  else mainTBody.style.backgroundColor = "#F8F8F8";
  document.getElementById('statusFieldRight').innerHTML += "??????????:" + stat.begin + " ????????????:" + stat.service + " ??????:" + stat.resolved + " ?????????????:" + stat.investigating + " ????????:" + stat.hold + " ???????:" + stat.closed + "   ?????:" + (stat.begin + stat.service + stat.resolved + stat.investigating + stat.hold + stat.closed);
}

function renewTickets(data) {
  for(var key in Tickets)               // ??????? ?????? ????? ? ?????? ??? ??? ?? ???????????
    Tickets[key].renewed = false;

  for(var i = 0; i < data.rows.length;  i ++) {
    var tt = {};
    tt.id = data.rows[i].id;                // 52956
    tt.status = data.rows[i].status;        // Service / ????????????"
    tt.data_open = data.rows[i].data_open;  // 05.09.2014 21:42
    tt.region = data.rows[i].region;        // RST
    tt.author = data.rows[i].author;        // ??????? ?. ?.
    tt.otv = data.rows[i].otv;              // ??????? ?. ?.
    tt.client = data.rows[i].client;        // *M.VIDEO*
    tt.name = data.rows[i].name;            // Wi-Fi SZ ?101 ?. ??????-??-????, ??. ???????????????, 157
    tt.clas = data.rows[i].clas;            // 6. ?????? ??? ???? ??????????????? ??????????? ?????? VC. ???????? ?? ???? ?????????????????? ????????? ?????
    tt.filial = data.rows[i].filial;        // ?????????? ???????
    tt.branch = data.rows[i].branch;        // ??????????? ??????????? (????????).<br>????????
                                            // 	{ "id":"52956", "status":"Service / ????????????", "data_open":"05.09.2014 21:42", "data_res":"", "data_close":"", "region":"RST", "author":"??????? ?. ?.", "otv":"??????? ?. ?.", "client":"*M.VIDEO*", "name":"Wi-Fi SZ ?101 ?. ??????-??-????, ??. ???????????????, 157", "clas":"", "filial":"?????????? ???????", "is_group":"-", "branch":"??????????? ??????????? (????????).<br>????????" }
    tt.redAttention = false;                   // ????, ??? ? ?????? ?????????? ???. ???? ?? ???. ???? ????????? ?????????? ?? ??? ????????????.
    tt.permissions = "";                    // ???????? ???? ????????? ? ?????? ?????? ??????????? "***"
    tt.timer = 0;                          // ??????-??????????? ????????

    if(Tickets[tt.id] === undefined){       // ???? ?????? ?????? ? ?????? ??? ???, ???????
      Tickets[tt.id] = tt;
      Tickets[tt.id].checked = false;
      Tickets[tt.id].renewed = true;
      if(newbornTT.name != undefined && newbornTT.zhostid != undefined && Tickets[tt.id].name === newbornTT.name){
        Tickets[tt.id].zhostid = newbornTT.zhostid;   // ???????? ??????????????? ?????? ??? ????????? zhostid
        delete newbornTT.zhostid;
        delete newbornTT.name;
      }
    }
    else {
      if(tt.otv === userName && Tickets[tt.id].otv !== userName) {  // ???? ???. ???? ?????????? ?? ???
        Tickets[tt.id].redAttention = true;
        // ??? ?????? ???? ???????? ????????????? ????????????? ???? ???. ????
      }
      if(checkResolved == true && tt.status === "Resolved / ??????" && Tickets[tt.id].status !== "Resolved / ??????") {  // ???? ?????? ???????? ? ????????
        Tickets[tt.id].orangeAttention = true;          // (???? ?????? ??????? ? ???????? ? ????????? ??????, ??? ?? ?????? ??????, ??????? ?? ?????????)
      }
      Tickets[tt.id].status = tt.status;        // ????????? ?????????, ??????? ????? ??????????
      Tickets[tt.id].otv = tt.otv;
      Tickets[tt.id].clas = tt.clas;
      Tickets[tt.id].branch = tt.branch;
      Tickets[tt.id].name = tt.name;
      Tickets[tt.id].renewed = true;
      Tickets[tt.id].client = tt.client;
    }
  }

  var params = {action:"readLater", timestamp:mySqlLastRenew };     // ????????? ???????? ????????
  if(mySqlLastRenew == ""){   // ???? ???????? TT->hostId ??? ?? ???????????
    params = {action:"readFrom", ttid:tt.id};   // ???????? ???????? ?? ??? ?????? ??????? ? ?????? ??????? ???????????
    $("#char2").css({"color":"orange"});
  }
  $.ajax({
    url: sqlServerAdress,
    type: 'post',
    dataType: 'json',
    data: params,
    success: cbSqlMultiSuccess,
    error: cb16mbError
  });

  showIt();
  if(delayedData != "") {                   // ??????? ? onBtnSaveTTClick ????? ??? ??????????? ??????????????? ?????? ? Tickets{} ??? ???? ?????? ? ???
    callbackGetTicket(delayedData, "sucess");
    delayedData = "";
  }
}

/******************************************************************************/
function cb16mbError(){
  $("#char2").css({"color":"red"});
}
/******************************************************************************/

function onRespIdChange(){
  filter.user = $("#resp_id_s")[0][$("#resp_id_s")[0].selectedIndex].innerText;
  if($("#resp_id_s")[0].selectedIndex === 0)
    filter.user = "";
  showIt();
}

function onThsStatusChange(){   // 
  if(document.getElementById('thsStatus').selectedIndex > 0){
    filter.status = $("#thsStatus")[0][document.getElementById('thsStatus').selectedIndex].innerText;
    if(filter.status != "Closed / ???????") showIt();
    else loadTickets();
  } 
  else {
    filter.status = ""; showIt();
  } 
}

function onMainTBodyClick(e) {
  if(e.target.nodeName === "INPUT") {
    Tickets[e.target.parentNode.parentNode.iidd].checked = e.target.checked;
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex != 1 && e.ctrlKey == false && e.shiftKey == false){    // ???? ???????? ?? ?? ???????, ??????? ????????? ?????
    document.getElementById('popupTicket').iidd = e.target.parentNode.iidd; // ????? ????????? ? popupTicket id ????????????? ??????
    highlightedTT = e.target.parentNode.iidd;  // ???????? ????? ?????? ??? ??? ????????? ? showIt()
    showIt();
    $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: e.target.parentNode.iidd}, callbackGetTicket, "html");
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 2 && e.ctrlKey == true){    // ???? ???????? ?? ??????? c ctrl
    var select = document.getElementById('thsStatus');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        newSelectedIndex = i;
        onThsStatusChange();
        break;
      }
    }
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 6 && e.ctrlKey == true){    // ???? ???????? ?? ???.???
    var select = document.getElementById('resp_id_s');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        onRespIdChange();
        break;
      }
    }
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 4 && e.ctrlKey == true){    // ???? ???????? ??  ???????
    filter.region = Tickets[e.target.parentNode.iidd].region;
    filter.regionFull = Tickets[e.target.parentNode.iidd].filial;
    filter.status === "Closed / ???????" ? loadTickets() : showIt();
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 7 && e.ctrlKey == true){    // ???? ???????? ?? ???????
    document.getElementById('searchClient').value = e.target.innerText;
    document.getElementById('searchClient').oninput();

    filter.client = e.target.innerText;
    filter.status === "Closed / ???????" ? loadTickets() : showIt();
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 7 && e.shiftKey == true){    // ???? ???????? ?? ???????
    document.getElementById('searchClient').value = "-" + e.target.innerText;
    filter.notClient += e.target.innerText;

    filter.status === "Closed / ???????" ? loadTickets() : showIt();
  }
}

function onMTBmouseDown(e) {             // ??????? ??????????? ? ???????????? ?????? ?????????
  if(e.button === 1) {                   // ???? ???????? ?????????
    var tid = e.target.parentNode.iidd;  // ????????? id ?????????? ??????
    if(Tabs[tid] === undefined){         // ???? ? ????????? ??? ??? ?????? ??????
      var tab = {};
      tab.name = Tickets[tid].name;  // ???????? ??? ??? ???????????
      tab.text = "";
      Tabs[tid] = tab;
    }
    showIt();
  }
}

/*
  ??????? ????????? ??????:
  ??????????????? ?? ???????? ?????? ?? Tickets[id].permissions
*/


function onPsActionClick(e) {        // ?????? ???? ?? ?????? ????? ??????? ? ????? Status (????????????, ??????, ??????? ? ?.?)
  var tid = document.getElementById('popupTicket').iidd;
  var par = {};
  var i;
  par.branch_id = "100113";      // ????????????? ?????? ?? ?????????
  par.resp_person_id = "931";    // id ???????????? ?? ?????????
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
      par.status_id = "2";     // ? ????????????
      break;
    }
    case "ps2Resolved": {
      if(document.getElementById('psClass').value == "0") return;
      if(document.getElementById('psSubClass').value == "0") return;
      if(document.getElementById('psResolve').value == "0") return;
      par.trouble_type_closed = document.getElementById('psClass').value;
      par.trouble_subtype_closed = document.getElementById('psSubClass').value;
      par.trouble_type_name = document.getElementById('psType').value;
      par.trouble_type_resolution = document.getElementById('psResolve').value;
      par.status_id = "5";     // ??????
      break;
    }
    case "ps2Hold": {
      par.status_id = "4";     // ????????
      break;
    }
    case "ps2Investigating": {
      par.status_id = "3";     // ?????????????
      break;
    }
    case "ps2Close": {
      par.status_id = "7";     // ???????
      if(Tickets[tid] != undefined) Tickets[tid].status = "Closed / ???????"; // ????? ????????? ??????. ???? ???????? ?? ????????? ?? ?????-?? ????????? ???????, ?????? ????????????? ?????????? ??? ???? ?????????? ??????.
      break;
    }
    case "ps2Edit": {         // ????????????? ??
      winManager.hideUper();        // ??????? ????? ??????
      winManager.hideUper();        // ??????? ????? ?????
      loadPopupEditTT();
      centerPopupEditTT();    // ??????? ????? EditTT
      document.getElementById('popupEditTT').iidd = tid;  // ????????? ? ????? Edit ????? ??????
      document.getElementById('peShortTTDescr').value = Tickets[tid].name;  // ????????? ? ????? Edit ?????????
      document.getElementById('peTTDescr').value = document.getElementById('leftPopupTicketDescription').innerText // ????????? ? ????? Edit ?????
      for( i = 0; i < organization_id.length && organization_id[i].text != Tickets[tid].client; i ++){}  // ?????? ? ?????? ???????? ????? ???????
        if(i != organization_id.length) {
          document.getElementById('peClient').selectedIndex = i;       // ? ????????? ? ????? Edit ???????
        }
      for(i = 0; i < tt_region.length && tt_region[i].text != Tickets[tid].filial; i ++){}  // ?????? ? ?????? ???????? ????? ???????
        if(i != tt_region.length) {
          document.getElementById('peRegion').selectedIndex = i;       // ? ????????? ? ????? Edit
        }
      return;
    }
  }

  winManager.hideUper();        // ??????? ????? ??????
  winManager.hideUper();        // ? ????? ?????. ?? ????????????? by callbackGetTicket
  $.post("https://bss.vconnect.ru/adm/tt/trouble_ticket_status_process.asp", par, callbackGetTicket, "html");
  loadTickets();
  return;

}



function onPs2Confirm() {        // ?????? "???????????"
  var tid = document.getElementById('popupTicket').iidd;
  if(Tickets[tid].permissions.indexOf("???????????") != -1){
    winManager.hideUper();        // ??????? ????? ??????
    $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html");
    loadTickets();
    return;
  }

}

function onStatusNameClick(e) {   // ?? ????? ?? ????? ???????????? ????????????
  if(e.ctrlKey == true){       // ???? ???????? ? Ctrl - ????????????.
    $.get("https://bss.vconnect.ru/app/ruser/logoff.asp?refer=/", null, callbackAuthorization, "html");
    userId = -1;
    return;
  }
  if(document.getElementById('statusName').innerText == "????"){
    $("#char1").css({"color":"orange"});
    loadPopupLogin();
    centerPopupLogin();
  }
  if(userId != -1){
    filter.user = userName;
    showIt();
    for(i = 0; i < resp_id.length; i ++) {     // ? ??????? ??? ? ?????????? ??????
      if(resp_id[i].value === userId) {
        $("#resp_id_s")[0].selectedIndex = i;
        break;
      }
    }
  }
}

function onBtnRenewClick(e) {
  loadTickets();
  refreshTime = 60;
}

function onBodyResize() {
  document.body.style.maxHeight = (window.innerHeight - 31) + "px";
  centerPopupTransfer();
  centerPopupStatus();
  centerPopupTicket();
  centerPopupNewTT();
  centerPopupZabix();
  centerPopupEditTT();
  centerPopupLogin();
//  centerPopupRunScripts();
}

function setStatus(status) {
  document.getElementById('statusFieldLeft').innerHTML = status;
}

function onMainTBodyKeyPress(e){
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){

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
  filter.name = this.value;
  showIt();
}
function onSearchClientInput() {
  filter.client = this.value;
  showIt();
}

function onTTKeyPress(e) {       // ???? ?????? ??????
  if(e.keyIdentifier === "Enter"){
    if(!isNaN(parseInt(this.value, 10))){
      $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: this.value}, callbackGetTicket, "html");
      this.value = "";
    }
  }
}

function onLsTTKeyPress(e) {       // ???? ?????? ?????? ???????? ??????
  if(e.keyIdentifier === "Enter"){
    if(!isNaN(parseInt(this.value, 10))){
//      $.get("https://bss.vconnect.ru/adm/ttls/trouble_ticket_edt.asp", {id: this.value}, callbackGetLsTicket, "html");
      window.open("https://bss.vconnect.ru/adm/ttls/trouble_ticket_edt.asp?id=" + this.value, this.value, null);
      this.value = "";
    }
  }
}

function onResetFilterClick() {   // ????? ???? ????????
  document.getElementById('searchClient').value = "";
  filter.client = "";
  filter.notClient = "";
  document.getElementById('searchStr').value = "";
  filter.name = "";
  document.getElementById('resp_id_s').value = "0";
  filter.user = "";
  filter.region = "";
  filter.history = false;      // ???????? ????? ????????? ???????
  addTicketToHistory = true;

  document.getElementById('thsStatus').value = "0";
  if(filter.status == "Closed / ???????"){
    filter.status = "";
    loadTickets();
    return;
  }
  filter.status = "";
  showIt();
}


function onTabsClick(e){
  if(e.ctrlKey == true){
    delete Tabs[e.target.id];
    showIt();
    return;
  }
  if(e.target.id.indexOf("new") == -1){     // ???? ???????? ?? ???????????? ?????
    document.getElementById('popupTicket').iidd = e.target.id; // ????? ????????? ? popupTicket id ????????????? ??????
    highlightedTT = e.target.id;  // ???????? ????? ?????? ??? ??? ????????? ? showIt()
    $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: e.target.id}, callbackGetTicket, "html");
  } else {                                  // ???? ?? ???????? ?? ????????????? ?????
    loadPopupNewTT();
    centerPopupNewTT();
    document.getElementById('shortTTDescr').value = Tabs[e.target.id].name;  // ???????? ??? ??? ???????????
    document.getElementById('TTDescr').value = Tabs[e.target.id].text;
    document.getElementById('ppRegion').selectedIndex = Tabs[e.target.id].region;
    document.getElementById('ppClient').selectedIndex = Tabs[e.target.id].client;
    delete Tabs[e.target.id];
  }
  showIt();
}


function onTabsMouseDown(e){
  if(e.button === 1){
    delete Tabs[e.target.id];
    showIt();
  }
}

function prepareToAnsi(){
// ?????????????? ??????? ????????
  for (var i = 0x410; i <= 0x44F; i++) {
    transAnsiAjaxSys[i] = i - 0x350; // ?-??-?
  }
  transAnsiAjaxSys[0x401] = 0xA8;    // ?
  transAnsiAjaxSys[0x451] = 0xB8;    // ?
  transAnsiAjaxSys[0x2116] = 0xB9;    // ?

  //var escapeOrig = window.escape;
  // ?????????????? ??????? escape()
  window.encodeURIComponent = function(str) {
    var ret = [];
    // ?????????? ?????? ????? ????????, ??????? ????????? ?????????
    for (var i = 0; i < str.length; i++){
      var n = str.charCodeAt(i);
      if (typeof transAnsiAjaxSys[n] != 'undefined')
        n = transAnsiAjaxSys[n];
      if (n <= 0xFF)
        ret.push(n);
    }
    var s = escape(String.fromCharCode.apply(null, ret));
    var j = s.indexOf("+");                              // ????????????? "+"
    while(j != -1) {
      s = s.substring(0, j) + "%2B" + s.substring(j+1);
      j = s.indexOf("+");
    }
    return s;
  }
}

function statusToColor(status){
  switch(status){
    case "??????????": return "#663333";
    case "Service / ????????????": return "#111177";
    case "Resolved / ??????": return "#005000";
    case "Investigating / ?????????????": return "#808000";
    case "Hold / ????????": return "#408080";
    case "Closed / ???????": return "#FFC0C0";
  }
  return "#000000";
}

function checkPing(){
  watchPingArr.length = 0;    // ?? ?????? ?????? ??????? ??????
  for(var key in Tickets)     // ?????????? ?????? ???????, ? ??????? ????? ????????? ????
//    if(Tickets[key].zhostid != undefined)    // ???????? ??? ?????? ? ????????? zhostid
    if(Tickets[key].zhostid != undefined && Tickets[key].watchPing == true) // ???????? ?????? ?????? ? ????????????? watchPing
      watchPingArr.push(Tickets[key]);
  if(watchPingArr.length > 0) lookOnTicketPing();
}

function lookOnTicketPing(response, status) {
  if (response != undefined && typeof(response.result) === 'object') {
    var i;
    for(i = 0; i < response.result.length && response.result[i].name != "?????? %"; i ++); // ?????? ? ??????? ?????? ?????? 
    if(i != response.result.length){  // ???? ?????? ? ???????? ???????
      if(response.result[i].lastvalue != undefined && response.result[i].lastvalue == 0){       // ???? ?????? ???
        Tickets[watchPingArr[0].id].greenAttention = true; //  ?????????? ???? greenAttention
        showIt();                                          // ????? ?? ????????? ????????? ???????
      } 
      //Tickets[watchPingArr[0].id].ping = response.result[i].lastvalue; // ???????? ????????? ???? ???????? 
    }
    watchPingArr.shift();  // ?????? ????????? ??????? ???????
  }

  if(watchPingArr.length > 0 && watchPingArr[0].zhostid != undefined){
    var params = {};
    var method = "item.get";
    params.hostids = watchPingArr[0].zhostid;
    params.output = "extend";
    zserver.sendAjaxRequest(method, params, lookOnTicketPing, cbZabbixApiError); // ???????? ???????????, ???, IP ????
  }
}

function onHistoryLinkClick(e){
  filter.history = !filter.history;           // ???????????? ?????? ??????????.???????
  addTicketToHistory = !filter.history;
  showIt();
}

/*
function callbackGetLsTicket(data, textStatus) {
  var st, str = "??????? ????? ??????????";
  var arr1 = [];
  var arr2 = [];
  if(data) {
    var adr0, adr1 = 1;
    if(adr1 != -1){
      adr1 = data.indexOf('<td class="text">????????????? ????:</td>'); data = data.substring(adr1);
      adr1 = data.indexOf('<td class="textb">'); data = data.substring(adr1);
      adr0 = data.indexOf('</td>');
      data = data.substring(18, adr0);
      st = window.encodeURIComponent(data);
      for(var i = 0; i < str.length; i ++)
        arr1[i] = str.charCodeAt(i);
      for(var i = 0; i < data.length; i ++)
        arr2[i] = data.charCodeAt(i);
    }
  }
  document.getElementById('LsSearchTT').placeholder = str;
}
*/