/*-----------------------------------------------------------------------------+
|  Project: ZBSS Chrome App
|  Copyright (c) 2014-2016 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/

//
//       ���� ������ ������� ��� ��� ����� �������� � popup NewTT � EditTT
//

function loadPopupNewTT() {
  $("#shortTTDescr")[0].value = "";
  $("#TTDescr")[0].value = "";
  $("#ppClient")[0].selectedIndex = 0;
  $("#ppRegion")[0].selectedIndex = 0;
  $("#wikiLink")[0].text = "";

  var reg =  $("#ppRegion");
  if(reg != undefined && reg[0].length === 0) {
    for(var i = 0; i < tt_region.length; i ++){
      reg.append("<option value='" + tt_region[i].value + "'>" + tt_region[i].text + "</option>");
    }
  }
  reg =  $("#ppClient");
  if(reg != undefined && reg[0].length === 0) {
    for(i = 0; i < organization_id.length; i ++){
      reg.append("<option value='" + organization_id[i].value + "'>" + organization_id[i].text + "</option>");
    }
  }
  winManager.showMe("popupNewTT");
}

function centerPopupNewTT() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupNewTT").height();
  var popupWidth = $("#popupNewTT").width();

  $("#popupNewTT").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function loadPopupEditTT() {
  $("#peShortTTDescr")[0].value = "";
  $("#peTTDescr")[0].value = "";
  $("#peClient")[0].selectedIndex = 0;
  $("#peRegion")[0].selectedIndex = 0;

  var reg =  $("#peRegion");
  if(reg != undefined && reg[0].length === 0) {
    for(var i = 0; i < tt_region.length; i ++){
      reg.append("<option value='" + tt_region[i].value + "'>" + tt_region[i].text + "</option>");
    }
  }
  reg =  $("#peClient");
  if(reg != undefined && reg[0].length === 0) {
    for(i = 0; i < organization_id.length; i ++){
      reg.append("<option value='" + organization_id[i].value + "'>" + organization_id[i].text + "</option>");
    }
  }
  winManager.showMe("popupEditTT");
}

function centerPopupEditTT() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupEditTT").height();
  var popupWidth = $("#popupEditTT").width();

  $("#popupEditTT").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function onBtnNewTTClick (e) {
  loadPopupNewTT();
  centerPopupNewTT();
}

function onBtnSaveTTClick (e) {      // $.ajax ������       //����� ����� ����� -> ���������
  if($("#shortTTDescr")[0].value.length < 10 || $("#shortTTDescr")[0].value.length > 100 ) return;
  if($("#TTDescr")[0].value.length < 10 || $("#TTDescr")[0].value.length > 500) return;
  if($("#ppClient")[0].selectedIndex === 0) return;
  if($("#ppRegion")[0].selectedIndex === 0) return;
  var id = document.getElementById('ppRegion');
  var rid = id[id.selectedIndex].value;
  id = document.getElementById('ppClient');
  var cid = id[id.selectedIndex].value;
  var param = "id=0&ip=&name=" + encodeURIComponent($("#shortTTDescr")[0].value) + "&trouble_ticket_type_id=33&priority=1";
  param += "&region_id=" + rid + "&organization_id=" + cid + "&descr=" + encodeURIComponent($("#TTDescr")[0].value);
  $.ajax({
    url: "https://bss.vconnect.ru/adm/tt/trouble_ticket_edt_process.asp",
    type: "POST",
    data: param,
    dataType : "html",
    contentType : "application/x-www-form-urlencoded; charset=windows-1251",
    success : onTtEditProcessSuccess
  });
/*
  if(!isNaN(parseInt($("#ppHostId")[0].value, 10))){
    newbornTT.name = $("#shortTTDescr")[0].value;
    newbornTT.zhostid = $("#ppHostId")[0].value;
  }
*/
  winManager.hideUper();
}

function onBtnSaveEditTTClick (e) {      // $.ajax ������       //����� ������������� ����� -> ���������
  if($("#peShortTTDescr")[0].value.length < 10) return;
  if($("#peTTDescr")[0].value.length < 10) return;
  if($("#peClient")[0].selectedIndex === 0) return;
  if($("#peRegion")[0].selectedIndex === 0) return;
  var id = document.getElementById('peRegion');
  var rid = id[id.selectedIndex].value;
  id = document.getElementById('peClient');
  var cid = id[id.selectedIndex].value;
  id = document.getElementById('popupEditTT').iidd;
  if(id === undefined || id === 0) return;
  var param = "id=" + id + "&ip=&name=" + encodeURIComponent($("#peShortTTDescr")[0].value) + "&trouble_ticket_type_id=33&priority=1";
  param += "&region_id=" + rid + "&organization_id=" + cid + "&descr=" + encodeURIComponent($("#peTTDescr")[0].value);
  $.ajax({
    url: "https://bss.vconnect.ru/adm/tt/trouble_ticket_edt_process.asp",
    type: "POST",
    data: param,
    dataType : "html",
    contentType : "application/x-www-form-urlencoded; charset=windows-1251",
    success : onTtEditProcessSuccess
  });
  document.getElementById('popupEditTT').iidd = 0;  // �� ������ ������ ������ id ������������������ TT
  winManager.hideUper();
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
  if(adr1 != -1 && adr2 != -1 && adr2 != -1){   // ���� ��� ������������� ������
    $("#shortTTDescr")[0].value = str.substring(adr1+7, adr2-1) + ", " + str.substring(adr2+7, adr3-1) + ', ' + str.substring(22, adr1-1);
    for(var i = 0; i < organization_id.length && organization_id[i].text != "*M.VIDEO*"; i ++){}  // ������ � ������ ����������� ������
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // ������� ��� � select
    }
    var adr4 = str.indexOf("**************************");
    if(adr4 != -1) {str = str.substring(0, adr4-1);}
    $("#TTDescr")[0].value = str;
    var city = str.substring(adr1 + 7, adr2-1);
    var region = "";
    switch(city){
      case "������": {region = "������"; break;}
      case "�����-���������": {region = "�����-���������"; break;}
      case "�����": {region = "��������� �������"; break;}
      case "��������": {region = "������������ �������"; break;}
      case "������": {region = "������������ �������"; break;}
      /*case "": {region = ""; break;}
      case "": {region = ""; break;}
      case "": {region = ""; break;}
      case "": {region = ""; break;}
      case "": {region = ""; break;}
      case "": {region = ""; break;}
      case "": {region = ""; break;}*/
    }
    if(region != ""){
      for(var i = 1; i < tt_region.length; i ++){
        if(tt_region[i].text === region){
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
  if(str.indexOf("���������") != -1 || str.indexOf("��������") != -1){  // ������ �� �5 
    for(var i = 0; i < organization_id.length && organization_id[i].text != "*X5*"; i ++){}  // ������ � ������ ����������� ������
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // ������� ��� � select
    }
    if(str.indexOf("�������, ����") != -1 || str.indexOf("������ ����") != -1)     // ������� ������ � ������������
      str = str.substring(str.indexOf('\n') + 1);
      adr0 = str.match(/\n\w\d{2,3}\t/);      // ������ ������ ������� 
//    adr0 = str.match(/.........\t/);      // ������ ������ �������  
    if(adr0 == null || adr0.length === 0) return;
    $("#TTDescr")[0].value = str.substring(0, adr0.index) + '\n';
    str = str.substring(adr0.index); 
    adr1 = str.indexOf('\t');
    str = str.substring(adr1 + 1);
    adr1 = str.indexOf('\t');
    str = str.substring(adr1 + 1);
    adr1 = str.indexOf('\t');
    str = str.substring(adr1 + 1);
    adr1 = str.indexOf('\t');
    str = str.substring(adr1 + 1);
    adr1 = str.indexOf('\t');
    $("#TTDescr")[0].value += str.substring(0, adr1) + '\n'; 
    $("#shortTTDescr")[0].value = str.substring(0, adr1); 
    for(var i = 0; i < 13; i ++){
      str = str.substring(adr1 + 1);
      adr1 = str.indexOf('\t');
    }  
    var city = str.substring(0, adr1);
    var strnn = "";
    strnn += '\n';
    strnn += '\n';
    adr1 = str.indexOf(strnn);
    $("#TTDescr")[0].value += str.substring(adr1 + 2);
    
    var region = "";
    switch(city){
      case "������": {region = "������"; break;}
      case "�����-���������": {region = "�����-���������"; break;}
      case "�����": {region = "��������� �������"; break;}
      case "��������": {region = "������������ �������"; break;}
      }
    if(region != ""){
      for(var i = 1; i < tt_region.length; i ++){
        if(tt_region[i].text === region){
          document.getElementById('ppRegion').selectedIndex = i;
        }
      }
    }
    else {
      document.getElementById('ppRegion')[0].text = "����������� �������";
      document.getElementById('ppRegion').disabled = true;
      document.getElementById('wikiLink').text = city;
      $.get("https://ru.wikipedia.org/w/index.php", {search:city}, cbWiki, "html");
    }
    
/*    var b = str.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
    str = str.substring(b.index);
    b = str.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d\d\t/);
    str = str.substring(b.index);
    */
  }
}

function cbWiki(data, textStatus) {
  document.getElementById('ppRegion')[0].text = "- ��� ������� -";
  document.getElementById('ppRegion').disabled = false;
  document.getElementById('ppRegion').selectedIndex = 0;
//  document.getElementById('wikiLink').text += " - ������ � Wiki";
  var start = data.toLowerCase().indexOf("������� ���������");
  if(start === -1){return;}
  data = data.substring(start, start + 1000);
  start = data.indexOf('title="');
  if(start === -1){return;}
  data = data.substring(start);
  start = data.indexOf('">');
  if(start === -1 || start > 100){return;}
  var region = data.substring(7, start);
  if(region == "�����-���������� ���������� ����� � ����") region = "�����-���������� ���������� �����";
  for(var i = 1; i < tt_region.length; i ++){
    if(tt_region[i].text == region || ((tt_region[i].text.indexOf(region) != -1) && (tt_region[i].text.indexOf("����������") != -1))){
      document.getElementById('ppRegion').selectedIndex = i;
      break;
    }
  }
}

function openWikiLink() {
  window.open("https://ru.wikipedia.org/w/index.php?search=" + document.getElementById('wikiLink').text, null, null);
}

function qSelectClientClick(e){
  if(e.target.id === "qSelectClient"){
    for(var i = 0; i < organization_id.length && organization_id[i].text != e.target.text; i ++);  // ������ � ������ ����������� ��������� �������
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // ������� ��� � select
    }
  }
}

function onBtnNewToTabsClick(e){
  for(var i = 0; Tabs["new "+i] != undefined ; i ++);  // �������� ��������� id ��� ���� ��������
  var tab = {};
  tab.name = document.getElementById('shortTTDescr').value;  // �������� ��� ��� �����������
  tab.text = document.getElementById('TTDescr').value;
  tab.region = document.getElementById('ppRegion').selectedIndex;
  tab.client = document.getElementById('ppClient').selectedIndex;
  Tabs["new "+i] = tab;
  winManager.hideUper();
  showIt();
}