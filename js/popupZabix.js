//
//       ���� ������ ������� ��� ��� ����� �������� � popupZabix
//
var highlightedZH;          // HostId ���������� ����
var resolvedHostIds = {};   // {hostid:{hostid, name, available, groups[], invent, uptime},... }    ����� �������� � ������� � ��� ���������� �����
var hostToResearch = {};    // {hostid, name, available, groups[{groupid,hosts[],internal,name},..], invent, uptime}  // ����������� � ������ ������ ����. ���� undefined, ������ ������ �� �����������

function loadPopupZabix() {
  if (popupStatus < 2) {
    var zClient = "";
    var select = document.getElementById('pzClient');
    select.selectedIndex = 0;
    var tid = document.getElementById('popupTicket').iidd;
    $("#pzFound").empty();
    document.getElementById('pzHostId').value = "";
    document.getElementById('pzLocation').value = "";
//    var expr = new RegExp('&quot;', 'gm');
    document.getElementById('pzCaption').innerText = "����� ���� ���: " + Tickets[tid].name.replace(new RegExp('&quot;', 'gm'), '"') + ".  ������: " + Tickets[tid].client;
    ShowHostStat();   // ������� ������� � ��������� "����������" �����

    switch(Tickets[tid].client){   // ���������� ���������� zabbix groupid �� BSS Client Name
      case "*Adidas*":{ zClient = "������"; break;}
      case "*Alfa group*":{ zClient = "�����-����"; break;}
      case "*ALFA-BANK*":{ zClient = "�����-����"; break;}
      case "*Apteka A5*":{ zClient = "������ �5"; break;}
      case "*BestPrice*":{ zClient = "���� �����"; break;}
      case "*BILLA*":{ zClient = "�����"; break;}
      case "*BIOCAD*":{ zClient = "������"; break;}
      case "*CentrObuv*":{ zClient = "����� �����"; break;}
      case "*CROSSMEDIA*":{ zClient = "����������"; break;}
      case "*DELOVIE LINII*":{ zClient = "������� �����"; break;}
      case "*Delovie Linii*":{ zClient = "������� �����"; break;}
      case "*Deti*":{ zClient = "����"; break;}
      case "*DETMIR*":{ zClient = "������� ���"; break;}
      case "*ELDORADO*":{ zClient = "���������"; break;}
      case "*ENTER*":{ zClient = "�����"; break;}
      case "*ER-Telecom*":{ zClient = "��-������� �������"; break;}
      case "*EUROPLAST*":{ zClient = "���������"; break;}
      case "*EUROSET*":{ zClient = "��������"; break;}
      case "*Fandy*":{ zClient = "������"; break;}
      case "*GarsTelecom*":{ zClient = "�����������"; break;}
      case "*GAZPROMBANK*":{ zClient = "�����������"; break;}
      case "*GOLDTELECOM*":{ zClient = "���� �������"; break;}
      case "*HOMECREDIT*":{ zClient = "����-������"; break;}
      case "*ID Logistic Rus*":{ zClient = "�� ��������� ���"; break;}
      case "*IDEA BANK*":{ zClient = "���� ����"; break;}
      case "*INCITY*":{ zClient = "������"; break;}
      case "*INVESTBANK*":{ zClient = "������-����"; break;}
      case "*KB Transportniy*":{ zClient = "������������"; break;}
      case "*Leroy Merlin*":{ zClient = "����� ������"; break;}
      case "*LETOBANK*":{ zClient = "����-����"; break;}
      case "*Lombard Blago*":{ zClient = "������� �����"; break;}
      case "*M.VIDEO*":{ zClient = "�.����� ����������"; break;}
      case "*MacDonald*":{ zClient = "�����������"; break;}
      case "*MakDak*":{ zClient = "�����������"; break;}
      case "*MChS Russia*":{ zClient = "����������� ���������� ��� � 3 ��� ������"; break;}
      case "*MEGAFON*":{ zClient = "�������"; break;}
      case "*MIRATORG*":{ zClient = "��������"; break;}
      case "*Next Commerce*":{ zClient = "����� �������"; break;}
      case "*Obrazovanie*":{ zClient = "����������� (����)"; break;}
      case "*OSTIN*":{ zClient = "�����"; break;}
      case "*OTP-Bank*":{ zClient = "���-����"; break;}
      case "*PARIBA*":{ zClient = "��� ������"; break;}
      case "*PLANET*":{ zClient = "�������"; break;}
      case "*Quiclymoney*":{ zClient = "������������"; break;}
      case "*RENCAP*":{ zClient = "��������� �������"; break;}
      case "*Rivgosh*":{ zClient = "��� ���"; break;}
      case "*ROSTELECOM-MSK*":{ zClient = "����������"; break;}
      case "*ROSTELECOM-SPB*":{ zClient = "����������"; break;}
      case "*RusTelCompany*":{ zClient = "������� ���������� ��������"; break;}
      case "*SAMOTLOR*":{ zClient = "��������"; break;}
      case "*SBERBANK*":{ zClient = "��������"; break;}
      case "*SPORTMASTER*":{ zClient = "�����������"; break;}
      case "*SrochnoDengi*":{ zClient = "������������"; break;}
      case "*STEC.COM*":{ zClient = "���� ���"; break;}
      case "*SVYAZNOY*":{ zClient = "�������"; break;}
      case "*Svyaznoy*":{ zClient = "��������"; break;}
      case "*SYNTERRA*":{ zClient = "��������"; break;}
      case "*TASCOM*":{ zClient = "������"; break;}
      case "*TechnoSila*":{ zClient = "���������"; break;}
      case "*Telsikom*":{ zClient = "��������"; break;}
      case "*Ulibka Radugi*":{ zClient = "������ ������"; break;}
      case "*UNISTREAM*":{ zClient = "��������"; break;}
      case "*Vertical*":{ zClient = "���������"; break;}
      case "*VladPromBank*":{ zClient = "������������"; break;}
      case "*VTB24*":{ zClient = "�����������"; break;}
      case "*WHITE WIND*":{ zClient = "����� �����"; break;}
      case "*X5*":{ zClient = "�-5"; break;}
      default: zClient = "GA";
    }
    var gids = [];          // ������ ��� �������� ids ���������� z�����
    for(var i = 0; i < zGroups.length; i ++) {
      if(zGroups[i].name.indexOf(zClient) == 0){
        gids.push(zGroups[i].groupid);   // ������� � ������ id ���������� ������
      }
    }
    if(gids.length > 0) {  // ���� ������� ���� ���� ���������� ������
      var method = "host.get";
      var params = {};
      params.output = "extend";
      params.groupids = gids;
      zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // �������� ������ �����, �������� � ��������� ������
    }

    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupZabix").fadeIn("fast");
    popupStatus++;
  }
}

function centerPopupZabix() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupZabix").height();
  var popupWidth = $("#popupZabix").width();

  $("#popupZabix").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2 - 60,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function onPtFindHostIdClick() {      // ����� �� popupTicket (������ ����� �� Tickets)
  loadPopupZabix();
  centerPopupZabix();
}
/*
function onPnFindHostIdClick() {        // ����� �� popupNewTT (������ ����� �� popupNewTT)
  document.getElementById('popupZabix').BssClient = document.getElementById('ppClient')[document.getElementById('ppClient').selectedIndex].text;
  document.getElementById('popupZabix').Caption = document.getElementById('shortTTDescr').value;
  loadPopupZabix();
}
*/
function zGetGroups() {   // ���������� ���������� ����� ����������� ��� ��������� ������ ����� � zabbix
    // method
  var method = "hostgroup.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.sortfield = "name";
  zserver.sendAjaxRequest(method, params, cbzGetGroups, null); // �������� ������ ����� (����� ��������)
}

function cbzGetGroups(response, status) {         // ������� ������ ���� �����
  if(typeof(response.result) === 'object') {
    zEnabled = true;
    zGroups = response.result;
    $("#pzClient").empty();          // �������� ������ �������� � popupZabix
    $("#pzClient").append("<option value='0'>������� ������</option>")
    for(var i = 0; i < zGroups.length; i ++) {
      $("#pzClient").append("<option value='" + zGroups[i].groupid + "'>" + zGroups[i].name + "</option>")
      zGroupsObj[zGroups[i].groupid] = zGroups[i].name;     // ������ ���������� ������-������ ���� � ������� groupid:groupname
    }
  }
}

function cbSuccessZgetHostsOfGroups(response, status) {  // ������� ������ ������, �������� � �������� ������
  if (typeof(response.result) === 'object') {
    zResponse = response.result;
    ShowZList();
    // ������, ����� ������� ������ ������, ����� ��������� ������� ��������
  }
  centerPopupZabix();
}

function ShowZList() {
  $("#pzFound").empty();                                          // ������� ������ �������� ������
  var str = "";
  var filterFlag;
  var filterZLocation = [];                                      // ������ ���� ��� ������
  filterZLocation = document.getElementById('pzLocation').value.toLowerCase().split(' ');
  for(var key in zResponse) {      // ���� �� ���� �������� ������
    filterFlag = false;
    for(var i in filterZLocation)  // �������� ������� � ����� ����� ���� ���� �� �������_����_���_������
      if(zResponse[key].name.toLowerCase().indexOf(filterZLocation[i]) == -1){
        filterFlag = true;
        continue;
      }
    if(filterFlag) continue;       // ���� � ����� ����� �� ��������� ���� �� 1 ����� �� �������_����_���_������, ���������� ���� ����
    var ttr = document.createElement('tr');
    ttr.hostid = zResponse[key].hostid;

    str = '<tr>';
    str += '<td><a href="https://zabbix.msk.unitline.ru/zabbix/latest.php?open=1&apps[0]=7374&hostid=' + zResponse[key].hostid + '&fullscreen=0" target="_blank">' +  zResponse[key].hostid + '</a></td>';
    str += '<td>' + zResponse[key].host + '</td>';
    str += '<td></td>';
    str += '<td>' + zResponse[key].name + '</td>';
    str += '<td>';
    for(var gr in zResponse[key].groups){
      var grid = zResponse[key].groups[gr].groupid;
      str += zGroupsObj[grid] + " ";
    }
    str += '</td></tr>';
    ttr.innerHTML = str;
    if(ttr.hostid == highlightedZH){
      ttr.style.backgroundColor = "#FFFFCC"; // ��������� �����
    }
    document.getElementById('pzFound').insertBefore(ttr, document.getElementById('pzFound').children[0]);
  }
  centerPopupZabix();
}

function onPzBtnCancelClick(){
  if (popupStatus > 0) {            // ����� ������� popup Zabix
    $("#popupZabix").fadeOut("fast");
    popupStatus--;
  }
  if (popupStatus === 0) {          // ���� popup Zabix ��� ������ �� ������ ������� ������, � ��� �� ����, �� ������� � background popup
    $("#backgroundPopup").fadeOut("fast");
  }
}
function onPzBtnOkClick(){
  if(!isNaN(parseInt(document.getElementById('pzHostId').innerText, 10))){

    if(popupStatus > 0) {            // ����� ������� popup Zabix
      $("#popupZabix").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // ���� popup Zabix ��� ������ �� ������ ������� ������, � ��� �� ����, �� ������� � background popup
      $("#backgroundPopup").fadeOut("fast");
    }
    var iidd = document.getElementById('popupTicket').iidd;               // ������� id ��������� ������
    if(Tickets[iidd] != undefined){
      Tickets[iidd].zhostid = document.getElementById('pzHostId').innerText;  // �������� zhostid ������
      disablePopups();                                                        // ����������� ����� � �������
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");
    }
  }
}

function onzLocationEdit() {
  ShowZList();
}

function onPzFoundTBodyClick(e) {
  document.getElementById('pzHostId').innerText = e.target.parentNode.hostid;
  document.getElementById('pzPing').style.fontWeight = "bold";
  highlightedZH = e.target.parentNode.hostid;

  if(hostToResearch.hostid == undefined){                // ���� � ������ ������ ������� ���� �� �����������,
    ShowHostStat();                                     // ������ ���� � ���������� ��������� �����
    zResearchHost(e.target.parentNode.hostid);          // �������� ��� ���� � ��������� �����
  }
//  ShowZList();
}

function zResearchHost(hostid) {
  hostToResearch.hostid = hostid;
  var method = "hostgroup.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch0, null); // �������� ������ ����� � ������� ������ ��������� hostid
}



function cbzResearch0(response, status){
  if(typeof(response.result) != 'object') {   // ������������ ��������� ��������
    delete hostToResearch;
    return;
  }
  hostToResearch.groups = response.result;
  var method = "host.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch1, null); // �������� ������ �����
}

function cbzResearch1(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // ������������ ��������� ��������

//  hostToResearch = response.result[0];
  hostToResearch.name = response.result[0].name;
  hostToResearch.available = response.result[0].snmp_available;
  hostToResearch.ip = response.result[0].host;
  var method = "application.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch2, null); // �������� ������ application's ��� �����
}

function cbzResearch2(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // ������������ ��������� ��������

  for(var key in response.result) {
    if(response.result[key].name == "General"){   // ������ � ��������� ������ ������ � name General
      var method = "item.get";
      var params = {};
      params.output = "extend";
      params.applicationids = response.result[key].applicationid;  // �������� items ��� applicationid ������ � ������ General
      zserver.sendAjaxRequest(method, params, cbzResearch3, null); // �������� items
      break;
    }
  }
}

function cbzResearch3(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // ������������ ��������� ��������

  for(var key in response.result) {
    if(response.result[key].name == "Device uptime"){   // ������ � ��������� ������ ������ � name General
      hostToResearch.upTime = response.result[key].lastvalue;
      hostToResearch.upTimeLc = response.result[key].lastclock;
      break;
    }
  }           // �����-������ � ������ � �������� ��� ��� ������ �������� hostinventories.php � �������� ���������
  $.get("https://zabbix.msk.unitline.ru/zabbix/hostinventories.php?hostid=" + hostToResearch.hostid, null, cbzResearch4, "html");
}

function cbzResearch4(data, textStatus){
  hostToResearch.invent = "������ �� �������";
  var adr0 = data.indexOf('>����������</td>');
  if(adr0 != -1){
    data = data.substring(adr0);
    adr0 = data.indexOf('<span class=');
    var adr1 = data.indexOf('</span>');
    if(adr0 != -1 && adr1 != -1) hostToResearch.invent = data.substring(adr0+18, adr1);
  }
  ShowHostStat();
}

function ShowHostStat() {
  var str = "";
  if(hostToResearch.available == undefined)document.getElementById('pzPing').style.color = "#000000";
  if(hostToResearch.available == 1) document.getElementById('pzPing').style.color = "#226622";
  if(hostToResearch.available == 2) document.getElementById('pzPing').style.color = "#FF2222";

  str = "������: ";
  if(hostToResearch.groups != undefined)
    for(var key in hostToResearch.groups) str += hostToResearch.groups[key].name + "; ";
  document.getElementById('pzGroups').innerText = str;

  str = "Device Uptime ---";
  if(hostToResearch.upTime != undefined){
    str = "Device Uptime&nbsp;&nbsp;<b>";
    if(hostToResearch.upTime > 3600*24) {
      str += Math.floor(hostToResearch.upTime / (3600*24)) + " ���, ";
      hostToResearch.upTime %= 3600*24;
    }
    str += Math.floor(hostToResearch.upTime / 3600) + ":";
    hostToResearch.upTime %= 3600;
    str += Math.floor(hostToResearch.upTime / 60) + ":";
    hostToResearch.upTime %= 60;
    str += hostToResearch.upTime;
  }
  if(hostToResearch.upTimeLc != undefined){
    var d = new Date(1000*hostToResearch.upTimeLc);
    str += "</b>&nbsp;&nbsp;&nbsp;&nbsp;(���������&nbsp;&nbsp;<b>" + d.toLocaleString() + "</b>&nbsp;&nbsp;)";
  }
  document.getElementById('pzUpTime').innerHTML = str;

  document.getElementById('pzIp').innerText = "";
  if(hostToResearch.ip != undefined)
    document.getElementById('pzIp').innerText = hostToResearch.ip;

  var expr = new RegExp('&quot;', 'gm');
  document.getElementById('pzHostName').innerText = "";
  if(hostToResearch.name != undefined)
    document.getElementById('pzHostName').innerText = hostToResearch.name.replace(expr, '"');

  document.getElementById('pzHostInfo').innerText = "";
  if(hostToResearch.invent != undefined)
    document.getElementById('pzHostInfo').innerText = hostToResearch.invent.replace(expr, '"');

  for(var key in hostToResearch) delete hostToResearch[key];  // ������ ��������� ������ � �����, ����� ��� �� ��������� ��������� ���������� ������������
}

function onPzClientChange() {         // ���������� ��� ������ ������ � <select>
  var select = document.getElementById('pzClient');
  if(select.selectedIndex == 0) return;
  var method = "host.get";
  var params = {};
  params.output = "extend";
  params.groupids = select[select.selectedIndex].value;
  zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // �������� ������ �����, �������� � ��������� ������
}