//
//       ���� ������ ������� ��� ��� ����� �������� � popupZabix
//
var highlightedZH;          // HostId ���������� ����
var resolvedHostIds = {};   // {hostid:{hostid, name, available, groups[], invent, uptime},... }    ����� �������� � ������� � ��� ���������� �����
var hostToResearch = {};    // {hostid, name, available, groups[{groupid,hosts[],internal,name},..], invent, uptime}  // ����������� � ������ ������ ����. ���� undefined, ������ ������ �� �����������

function loadPopupZabix() {
  var zClient = "";
  var select = document.getElementById('pzClient');
  var tid = document.getElementById('popupTicket').iidd;
  select.selectedIndex = 0;
  $("#pzFound").empty();
  document.getElementById('pzHostId').innerText = "";
  document.getElementById('pzLocation').value = "";
//    var expr = new RegExp('&quot;', 'gm');
  document.getElementById('pzCaption').innerText = "����� ���� ���: " + Tickets[tid].name.replace(new RegExp('&quot;', 'gm'), '"') + ".  ������: " + Tickets[tid].client;
  ShowHostStat();   // ������� ������� � ��������� "����������" �����   
  document.getElementById('pzLostGrath').style.color = "#000000";     // �������� ������ ������ � �����
  document.getElementById('pzLostGrath').href = "https://zabbix.msk.unitline.ru/zabbix/";  // ������� ������
  document.getElementById('pzLostGrath').text = "������ ?%";


  zClient = bssClient2zGroup(Tickets[tid].client);  // ���������� ���������� zabbix groupid �� BSS Client Name
  document.getElementById('popupZabix').zClient = zClient;

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
  winManager.showMe("popupZabix");
  document.getElementById('pzLocation').focus();
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

function zGetGroups() {   // ���������� ���������� ����� ����������� ��� ��������� ������ ����� � zabbix
    // method
  $("#char0").css({"color":"green"});
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
  }
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
    ttr.id = "hostid=" + zResponse[key].hostid;

    str = '<td><a href="https://zabbix.msk.unitline.ru/zabbix/latest.php?open=1&apps[0]=7374&hostid=' + zResponse[key].hostid + '&fullscreen=0" target="_blank">' +  zResponse[key].hostid + '</a></td>';
    str += '<td>' + zResponse[key].host + '</td>';
    str += '<td></td>';
    str += '<td>' + zResponse[key].name + '</td>';
    str += '<td>';
    for(var gr in zResponse[key].groups){
      var grid = zResponse[key].groups[gr].groupid;
      str += zGroupsObj[grid] + " ";
    }
    str += '</td>';
    ttr.innerHTML = str;
//    ttr.id = "hostid=" +
    if(ttr.hostid == highlightedZH){
      ttr.style.backgroundColor = "#FFFFCC"; // ��������� �����
    }
    document.getElementById('pzFound').insertBefore(ttr, document.getElementById('pzFound').children[0]);
  }
  var a = document.getElementById('pzClient');
  if(str.length == 0 && document.getElementById('popupZabix').zClient != "GA"){  // ���� ������ �� �������, � ������ �� � GA
    document.getElementById('pzFound').innerHTML = "<tr width=100% align='center'><td></td><td></td><td></td><td>������ �� �������. ������� Enter ����� ������ � ������ GA</td></tr>";
  }
  centerPopupZabix();
          // ���� �������� �� �� "�����", � �� "��������", �� ����� ����� ���������� ���� �� ��������� �����
  var tid = document.getElementById('popupTicket').iidd;
  if(Tickets[tid].zhostid != undefined && Tickets[tid].zhostid != 0){           // ���� � �������� ������ ��� �������� hostid
    if(document.getElementById('pzHostId').innerText != Tickets[tid].zhostid){  // ���� ��������� ������� ���� ��� �� ����������
      var e = {target:{parentNode:{hostid:Tickets[tid].zhostid},nodeName:"TD"}};// ���������  e.target.parentNode.hostid
      onPzFoundTBodyClick(e);                                                   // ���������� ���� �� ������ � �������� ������
    }
  }
}

function onzLocationEdit() {
  ShowZList();
}

function onzLocationKey(e){
  if(e.keyIdentifier == "Enter"){     // ���� � ������ ������ ����� ������ �����
    var select = document.getElementById('pzClient');
    for(var key in select){
      if(select[key].text == "GA"){
        select.selectedIndex = select[key].index; // ������� ������ GA
        onPzClientChange();
        return;
      }
    }

  }
}

function onPzFoundTBodyClick(e) {
  document.getElementById('pzLocation').focus(); // ������ ����� ������ �����
  if(e.target.nodeName == "A") return;            // �������� �� ������, ������������ �� �����
  document.getElementById('pzHostId').innerText = e.target.parentNode.hostid;
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

  hostToResearch.name = response.result[0].name;
  /*if(response.result[0].snmp_disable_until == 0)
    hostToResearch.available = response.result[0].snmp_available; */ // ���������� ������ ��� ����
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
  }           // �����-������ � ����� � �������� ��� ��� ������ �������� hostinventories.php � �������� ���������
  $.get("https://zabbix.msk.unitline.ru/zabbix/hostinventories.php?hostid=" + hostToResearch.hostid, null, cbzResearch4, "html");
}

function cbzResearch4(data, textStatus){
  hostToResearch.mac = "-:-:-:-:-:-";
  var adr0 = data.indexOf('MAC&nbsp;�����&nbsp;A');
  if(adr0 != -1){
    data = data.substring(adr0);
    adr0 = data.indexOf('<span class="pre">');
    var adr1 = data.indexOf('</span>');
    if(adr0 != -1 && adr1 != -1) hostToResearch.mac = data.substring(adr0+18, adr1);
  }

  hostToResearch.invent = "������ �� �������";
  var adr0 = data.indexOf('>����������</td>');
  if(adr0 != -1){
    data = data.substring(adr0);
    adr0 = data.indexOf('<span class=');
    var adr1 = data.indexOf('</span>');
    if(adr0 != -1 && adr1 != -1) hostToResearch.invent = data.substring(adr0+18, adr1);
  }
  var params = {};

  var method = "item.get";
  params.hostids = hostToResearch.hostid;
  params.output = "extend";
  zserver.sendAjaxRequest(method, params, cbzResearch5, null); // �������� �����������, ���, IP ����

}

function cbzResearch5(response, status){
  if (typeof(response.result) === 'object') {
    var i;
    for(i = 0; i < response.result.length && response.result[i].name != "������ %"; i ++); // ������ � ������� ������ ������ c ������ "������ %"
    if(i != response.result.length && response.result[i].lastclock != 0){  // ���� ������ � �������� �������
      document.getElementById('pzLostGrath').href = "https://zabbix.msk.unitline.ru/zabbix/history.php?action=showgraph&itemid=" + response.result[i].itemid;  // �������� ������
      document.getElementById('pzLostGrath').text = "������ " + response.result[i].lastvalue + "%";
      
      document.getElementById('pzLostGrath').style.color = "#FF2222";     // ������
      if(response.result[i].lastvalue < 5 || response.result[i].prevvalue < 5)
        document.getElementById('pzLostGrath').style.color = "#86AC00";    // ������ ������ �������� ��� ������ �����������
      if(response.result[i].lastvalue < 5 && response.result[i].prevvalue < 5)
        document.getElementById('pzLostGrath').style.color = "#116611";    // ������ ���
    }
  }

  ShowHostStat();
}

function ShowHostStat() {
  var str = "";
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

  document.getElementById('pzMAC').innerText = "";
  if(hostToResearch.mac != undefined)
    document.getElementById('pzMAC').innerText = hostToResearch.mac;

  var expr = new RegExp('&quot;', 'gm');
  document.getElementById('pzHostName').innerText = "";
  if(hostToResearch.name != undefined)
    document.getElementById('pzHostName').innerText = hostToResearch.name.replace(expr, '"');

  document.getElementById('pzHostInfo').innerText = "";
  if(hostToResearch.invent != undefined)
    document.getElementById('pzHostInfo').innerText = hostToResearch.invent.replace(expr, '"');

  for(var key in hostToResearch) delete hostToResearch[key];  // ������ ��������� ������ � �����, ����� ��� �� ��������� ��������� ���������� ������������
}


// ARP:         https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=5&sid=e99e99bd382fd777
// Des of Inter https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=6&sid=e99e99bd382fd777
// ping         https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=1&sid=e99e99bd382fd777
// Traceroute   https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=2&sid=e99e99bd382fd777


function onPzRunScriptsClick(e){
  var tid = document.getElementById('popupTicket').iidd;
  var scriptId = 1;
  if(document.getElementById('pzHostId').innerText != ""){           // ���� hostid ��� ������
    switch(e.target.id){
      case "pzARP":       {scriptId = 5; break;}
      case "pzDesOfInt":  {scriptId = 6; break;}
      case "pzRunPing":   {scriptId = 1; break;}
      case "pzTracert":   {scriptId = 2; break;}
      default: return;
    }
  $.get("https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=" + document.getElementById('pzHostId').innerText + "&scriptid=" + scriptId + "&sid=" + zSessionId, null, cbRunScripts, "html");
  loadPopupRunScripts();
  centerPopupRunScripts();
  }
}

function cbRunScripts(data, status){
  document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
  if(document.getElementsByClassName("pre fixedfont") == undefined) {    // ���� ����������� �� ��
    document.getElementById('popupInRunScripts').innerText = "�� ������� �������� ����������";
    return;
  }
  document.getElementById('prsCaption').innerText = document.getElementById("tab_scriptTab").innerText;
  document.getElementById('popupInRunScripts').innerText = document.getElementsByClassName("pre fixedfont")[0].innerText;
  document.getElementById('tempDiv').innerHTML = "";
  centerPopupRunScripts();
}

function onPzClientChange() {         // ���������� ��� ������ ������ � <select>
  document.getElementById('pzLocation').focus(); // ������ ����� ������ �����
  var select = document.getElementById('pzClient');
  if(select.selectedIndex == 0) return;
  document.getElementById('popupZabix').zClient = select[select.selectedIndex].text; // �������� ��� ������ ������
  var method = "host.get";
  var params = {};
  params.output = "extend";
  params.groupids = select[select.selectedIndex].value;
  zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // �������� ������ �����, �������� � ��������� ������
}

function onPzBtnCancelClick(){
  winManager.hideUper();
}

function onPzBtnOkClick(){
  if(!isNaN(parseInt(document.getElementById('pzHostId').innerText, 10))){
    winManager.hideUper();       // ����� ������� ���� �������
    var iidd = document.getElementById('popupTicket').iidd;               // ������� id ��������� ������
    if(Tickets[iidd] != undefined){
      Tickets[iidd].zhostid = document.getElementById('pzHostId').innerText;  // �������� zhostid ������
      winManager.hideUper();  // ������� ��� �� � ���� ������, ����� ��� ������������� � ������ �������
      $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");

      params = {action:"write", ttid:iidd, hostid:Tickets[iidd].zhostid};   // ������� ������ �������� � ����
      $.ajax({
        url: sqlServerAdress,
        type: 'post',
        dataType: 'json',
        data: params,
        success: cbSqlWriteSuccess
      });
    }
  }
}

function onPzNotInZbxClick(){                  // ���� �� ������� "�������, ��� ��� ����� �� ��� ���� � Zabbix"
  var iidd = document.getElementById('popupTicket').iidd;               // ������� id ��������� ������
  if(Tickets[iidd] != undefined){
    Tickets[iidd].zhostid = "0";  // �������� zhostid ������
    winManager.hideUper();  // ������� ��� �� � ���� ������, ����� ��� ������������� � ������ �������
    $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");

    params = {action:"write", ttid:iidd, hostid:Tickets[iidd].zhostid};   // ������� ������ �������� � ����
    $.ajax({
      url: sqlServerAdress,
      type: 'post',
      dataType: 'json',
      data: params,
      success: cbSqlWriteSuccess
    });
    }

}

function bssClient2zGroup(client) {
  var zClient;
  switch(client){   // ���������� ���������� zabbix groupid �� BSS Client Name
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
  return zClient;
}