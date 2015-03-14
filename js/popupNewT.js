//
//       Файл хранит функции так или иначе связаные с popup NewTT и EditTT
//

function loadPopupNewTT() {
  if (popupStatus == 0) {
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
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupNewTT").fadeIn("fast");
    popupStatus++;
  }
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
  if (popupStatus == 0) {
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
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupEditTT").fadeIn("fast");
    popupStatus++;
  }
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

function onBtnSaveTTClick (e) {      // $.ajax версия       //Попап новый тикет -> Сохранить
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
/*
  if(!isNaN(parseInt($("#ppHostId")[0].value, 10))){
    newbornTT.name = $("#shortTTDescr")[0].value;
    newbornTT.zhostid = $("#ppHostId")[0].value;
  }
*/
  disablePopups();
}

function onBtnSaveEditTTClick (e) {      // $.ajax версия       //Попап Редактировать тикет -> Сохранить
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
    url: "https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt_process.asp",
    type: "POST",
    data: param,
    dataType : "html",
    contentType : "application/x-www-form-urlencoded; charset=windows-1251",
    success : onTtEditProcessSuccess
  });
  document.getElementById('popupEditTT').iidd = 0;  // На всякий случай сотрем id отредактированного TT
  disablePopups();
}

function onTtEditProcessSuccess(data, textStatus) {  // Callback для соседней функции onBtnSaveTTClick(e)
  delayedData = data;  // Костыль чтобы loadTickets() сразу после актуализации Tickets{}, открыл попап со свежесозданным тикетом. Непосредственный вызов callbackGetTicket(data); не может обновить Tickets[id].permissions
  loadTickets();
  refreshTime = 60;
}

function onBtnAlertClick (e) {
  var str = $("#TTDescr")[0].value;
  if(str.length === 0){
    $("#TTDescr")[0].selectionStart = 0;                                              // Копируем список в буфер обмена
    $("#TTDescr")[0].selectionEnd = str.length;
    document.execCommand("Paste");
    str = $("#TTDescr")[0].value;
  }
  var adr0 = str.indexOf("№ удаленного объекта");
  if(adr0 != -1) {str = str.substring(adr0);}
  var adr1 = str.indexOf("Город: ");
  var adr2 = str.indexOf("Адрес: ");
  var adr3 = str.indexOf("Канал: ");
  if(adr1 === -1 || adr2 === -1 || adr2 === -1) return;
  $("#shortTTDescr")[0].value = str.substring(adr1 + 7, adr2-1) + ", " + str.substring(adr2 + 7, adr3-1);
  for(var i = 0; i < organization_id.length && organization_id[i].text != "*M.VIDEO*"; i ++){}  // Найдем в списке организаций мвидео
  if(i != organization_id.length) {
    document.getElementById('ppClient').selectedIndex = i;       // Веберем его в select
  }
  var adr4 = str.indexOf("**************************");
  if(adr4 != -1) {str = str.substring(0, adr4-1);}
  $("#TTDescr")[0].value = str;
  var city = str.substring(adr1 + 7, adr2-1);
  if(city === "Москва" || city === "Санкт-Петербург"){
    for(var i = 1; i < tt_region.length; i ++){
      if(tt_region[i].text === city){
        document.getElementById('ppRegion').selectedIndex = i;
      }
    }
  }
  else {
    document.getElementById('ppRegion')[0].text = "Определение региона";
    document.getElementById('ppRegion').disabled = true;
    document.getElementById('wikiLink').text = str.substring(adr1 + 7, adr2-1);
    $.get("https://ru.wikipedia.org/w/index.php", {search:str.substring(adr1 + 7, adr2-1)}, cbWiki, "html");
  }
}

function cbWiki(data, textStatus) {
  document.getElementById('ppRegion')[0].text = "- Все регионы -";
  document.getElementById('ppRegion').disabled = false;
  document.getElementById('ppRegion').selectedIndex = 0;
//  document.getElementById('wikiLink').text += " - Искать в Wiki";
  var start = data.indexOf("Субъект федерации");
  if(start === -1){return;}
  data = data.substring(start, start + 1000);
  start = data.indexOf('title="');
  if(start === -1){return;}
  data = data.substring(start);
  start = data.indexOf('">');
  if(start === -1 || start > 100){return;}
  var region = data.substring(7, start);
  for(var i = 1; i < tt_region.length; i ++){
    if(tt_region[i].text == region || ((tt_region[i].text.indexOf(region) != -1) && (tt_region[i].text.indexOf("Республика") != -1))){
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
    for(var i = 0; i < organization_id.length && organization_id[i].text != e.target.text; i ++);  // Найдем в списке организаций щелкнутоо клиента
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // Веберем его в select
    }
  }
}

function onBtnNewToTabsClick(e){
  for(var i = 0; Tabs["new "+i] != undefined ; i ++);  // Создадим временный id для этой закладки
  var tab = {};
  tab.name = document.getElementById('shortTTDescr').value;  // Запомним имя для отображения
  tab.text = document.getElementById('TTDescr').value;
  tab.region = document.getElementById('ppRegion').selectedIndex;
  tab.client = document.getElementById('ppClient').selectedIndex;
  Tabs["new "+i] = tab;
  disablePopups();
  showIt();
}