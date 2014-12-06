//
//    BSS Parser by drumir@mail.ru
//
//
var Tickets = {};           // Список всех актуальных тикетов в формате {id: {id:"10547", status: "", open: "", ....., permissions:"Названия кнопок доступных в этом тикете", timer:"Сколько минут осталось до звонка"}}. Актуализируется раз в n секунд
var transQueue = [];        // Очередь запросов на перевод тикета.
var hiddenText;             // Переменная - TEXTAREA
var a, b;
var transAnsiAjaxSys = [];
var Tabs = {};             // Хранит список табов/закладок в формате id:{name:"", text:"Незапощенный комент"}


var userName;              // Имя залогиненого пользователя Иванов И.И.
var userId = -1;           // Идентификатор залогиненого пользователя
var branchId = 100113;     // Код подразделения пользователя 100113 == "Технический департамент (МегаМакс) (13)" !!!!!!
var resp_id = [];          // Список всех ответственных лиц
var organization_id = [];  // Список всех клиентов
var tt_region = [];        // Список всех регион
var tt_status_id = [];     // Список статусов тикета
var branch_id = [];        // Список подразделений авторов

var mtb;                   // Main Table Body
var refreshTime = -1;      // Сколько секунд осталось до обновления.
var netTimeout = -1;       // Для определения зависания сетевых операций. >0 - идет отсчёт. ==0 - операция провалилась. <0 - отключено
var strTimeout = "";
var filterUser = "";
var filterName = "";
var filterStatus = "";
var filterClient = "";

var delayedData = "";      // Здесь хранится html код страницы свежесозданного тикета (В формате подходящем для callbackGetTicket) с тем, чтобы можно было сразу после актуализации Tickets{}, показать попап с ним пользователю
var newSelectedIndex = 0;  // Переменная для onchange и onmouseup выпадающего списка фильтра по статусу

var forceShow = true;     // Указывает, что список нужно как можно быстрее обновить
var highlightedTT = 0;    // Помнит последний щелкнутый тикет для его подсветки.
var TTOkTransferCount = 0; // Хранит количество успешно переведенных тикетов
var TTErTransferCount = 0; // Хранит количество ошибок при переводе тикетов

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

  prepareToAnsi();                            // Подготавливает таблицу для перекодирования

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
    if (popupStatus > 0) {            // Сразу закроем popup Transfer
      $("#popupTransfer").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // Если Transfer был открыт не поверх другого попапа, а сам по себе, то спрячем и background popup
      $("#backgroundPopup").fadeOut("fast");
    }
  });

  $("#popupPictCloseStatus").click(function() {
    if (popupStatus > 0) {            // Сразу закроем popup Status
      $("#popupStatus").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // Если Status был открыт не поверх другого попапа, а сам по себе, то спрячем и background popup
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

    // Попытка авторизоваться
  $.ajax({url: "https://oss.unitline.ru:995/adm/", data: null, dataType : "html", contentType : "application/x-www-form-urlencoded; charset=windows-1251", error: onLoadError, success: callbackAuthorization});

}
function onLoadError(jqXHR, textStatus){      // callback для соседней авторизации
  if(jqXHR.status == 404 && textStatus == "error") {
    setStatus("Не могу открыть страницу BSS. Возможно она еще не открыта в Chrome");
  }
}

/******************************************************************************/
function oneMoreSecond(){
  if(refreshTime > 0){
    refreshTime --;
    document.getElementById('buttonRenew').innerText = "Обновить (" + refreshTime + ")";
  }
  if(refreshTime == 0 && netTimeout <= 0){
    loadTickets();
    refreshTime = 60;
  }
  if(netTimeout > 0){        // Если netTimeout > 0, значит идет какая-то сетевая операция
    netTimeout --;
  }
  if(netTimeout == 0){      // Если netTimeout = 0, значит сетевая операция не удалась.
    setStatus(strTimeout);
    refreshTime = 60;
    netTimeout = 0;        // остановим отсчет.
  }
}

function showIt() {         // Отображает таблицу тикетов
  var str = "";
  var stat = {begin:0, service:0, resolved:0, investigating:0, hold:0, closed:0};

  document.getElementById('tabsTable').hidden = true;      // Спрячем панель закладок
  for(var key in Tabs) {                                   // Заполним панель закладками
    str = '<td id="' + key + '">' + key + ' ' + Tabs[key].name + '</td>' + str;
  }
  if(str.length > 0) {                                     // Если есть хоть одна закладка, покажем панель
    document.getElementById('tabsTable').hidden = false;
  }
  document.getElementById('tabs').innerHTML = str;

  $("#mainTBody").empty();
  document.getElementById('btResetFilter').hidden = true;
  if(filterUser + filterName + filterClient + filterStatus != "") {
    document.getElementById('btResetFilter').hidden = false;
  }
  for(var key in Tickets) {
    if(filterUser != "" && Tickets[key].otv != filterUser) continue;  // Если filterUser не пуст и этот тикет другого юзера, пропускаем тикет
    if(filterName != "" && Tickets[key].name.toUpperCase().indexOf(filterName.toUpperCase()) === -1) continue;  // Если filterName не пуст и этот тикет не соответствует, пропускаем тикет
    if(filterClient != "" && Tickets[key].client.toUpperCase().indexOf(filterClient.toUpperCase()) === -1) continue;  // Если filterClient не пуст и этот тикет не соответствует, пропускаем тикет
    if(filterStatus != "" && filterStatus.indexOf(Tickets[key].status) === -1) continue;  // Если filterStatus не пуст и этот тикет не соответствует, пропускаем тикет
    var ttr = document.createElement('tr');
    ttr.filial = Tickets[key].filial;
    ttr.iidd = Tickets[key].id;

    str = '<tr><td><input type="checkbox"></td><td>' + '<a href="https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp?id=' + Tickets[key].id + '" target="_blank">' + Tickets[key].id + '</a>' + '</td><td>' + Tickets[key].status;
/*    if(Tickets[key].attention === true){
      str += '(НП)';
    }*/
    str += '</td><td>' + Tickets[key].data_open + '</td><td>' + Tickets[key].region + '</td><td>' + Tickets[key].author + '</td><td>' + Tickets[key].otv + '</td><td>' + Tickets[key].client + '</td><td>' + Tickets[key].name + '</td><td width = "100px">' + Tickets[key].clas + '</td></tr>';
    ttr.innerHTML = str;
    ttr.children[0].children[0].checked = Tickets[key].checked;

    switch(Tickets[key].status) {
      case "Оформление": {stat.begin ++; break;}
      case "Service / Обслуживание": {stat.service ++; break;}
      case "Resolved / Решена": {stat.resolved ++; break;}
      case "Investigating / Расследование": {stat.investigating ++; break;}
      case "Hold / Отложена": {stat.hold ++; break;}
      case "Closed / Закрыта": {stat.closed ++; break;}
    }

    if(key == highlightedTT){
      ttr.style.backgroundColor = "#FFFFCC";
    }
    mtb.insertBefore(ttr, mtb.children[0]);
  }
  document.getElementById('statusFieldRight').innerText = "Оформление:" + stat.begin + " Обслуживание:" + stat.service + " Решено:" + stat.resolved + " Расследование:" + stat.investigating + " Отложено:" + stat.hold + " Закрыто:" + stat.closed + "   Всего:" + (stat.begin + stat.service + stat.resolved + stat.investigating + stat.hold + stat.closed);
}

function renewTickets(data) {
  for(var key in Tickets)               // Пометик каждый тикет в списке как еще не обновленный
    Tickets[key].renewed = false;

  for(var i = 0; i < data.rows.length;  i ++) {
    var tt = {};
    tt.id = data.rows[i].id;                // 52956
    tt.status = data.rows[i].status;        // Service / Обслуживание"
    tt.data_open = data.rows[i].data_open;  // 05.09.2014 21:42
    tt.region = data.rows[i].region;        // RST
    tt.author = data.rows[i].author;        // Сорокин Е. Г.
    tt.otv = data.rows[i].otv;              // Сорокин Е. Г.
    tt.client = data.rows[i].client;        // *M.VIDEO*
    tt.name = data.rows[i].name;            // Wi-Fi SZ №101 г. Ростов-на-Дону, ул. Красноармейская, 157
    tt.clas = data.rows[i].clas;            // 6. Аварии вне зоны ответственности технической службы VC. Проблемы на сети взаимодействующего оператора связи
    tt.filial = data.rows[i].filial;        // Ростовская область
    tt.branch = data.rows[i].branch;        // Технический департамент (МегаМакс).<br>МЕГАМАКС
                                            // 	{ "id":"52956", "status":"Service / Обслуживание", "data_open":"05.09.2014 21:42", "data_res":"", "data_close":"", "region":"RST", "author":"Сорокин Е. Г.", "otv":"Сорокин Е. Г.", "client":"*M.VIDEO*", "name":"Wi-Fi SZ №101 г. Ростов-на-Дону, ул. Красноармейская, 157", "clas":"", "filial":"Ростовская область", "is_group":"-", "branch":"Технический департамент (МегаМакс).<br>МЕГАМАКС" }
    tt.attention = false;                   // Флаг, что у тикета поменялось отв. лицо на нас. Надо проверить подтвердил ли это пользователь.
    tt.permissions = "";                    // Названия всех доступных в тикете кнопок разделенные "***"
    tt.timer = 0;                          // Таймер-напоминалка отключен

    if(Tickets[tt.id] === undefined){       // Если такого тикета в списке еще нет, добавим
      Tickets[tt.id] = tt;
      Tickets[tt.id].checked = false;
      Tickets[tt.id].renewed = true;
    }
    else {
      if(tt.otv === userName && Tickets[tt.id].otv !== userName) {  // Если отв. лицо изменилось на нас
        Tickets[tt.id].attention = true;
        // тут должна быть проверка подтверждения пользователем смен отв. лица
      }
      Tickets[tt.id].status = tt.status;
      Tickets[tt.id].otv = tt.otv;
      Tickets[tt.id].clas = tt.clas;
      Tickets[tt.id].branch = tt.branch;
      Tickets[tt.id].renewed = true;
    }
  }

  for(var key in Tickets)               // Удалим из списка все тикеты, которые не обновились. (они, вероятно, уже закрыты)
    if(Tickets[key].renewed == false)
      delete Tickets[key];

  showIt();
  if(delayedData != "") {                   // Костыль к onBtnSaveTTClick чтобы при отображении свежесозданного тикета в Tickets{} УЖЕ была запись о нём
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

function onThsStatusChange(){   // Т.к. в событии onchange нельзя узнать нажат ли шифт, просто сохраним новый статус в newSelectedIndex
  newSelectedIndex = document.getElementById('thsStatus').selectedIndex;
  if(newSelectedIndex == 0)
    filterStatus = "";
  showIt();
}

function onThsStatusMouseUp(e){  // После onchange будет onmouseup из которого мы узнает статус шифта и создадим соответствующий фильтр
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
  if(e.target.nodeName === "TD" && e.target.cellIndex != 1 && e.ctrlKey == false && e.shiftKey == false){    // Если щелкнули не по галочке, откроем выбранный тикет
    document.getElementById('popupTicket').iidd = e.target.parentNode.iidd; // Сразу передадим в popupTicket id отображаемого тикета
    highlightedTT = e.target.parentNode.iidd;  // Запомним номер тикета для его подсветки в showIt()
    showIt();
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: e.target.parentNode.iidd}, callbackGetTicket, "html");
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 2 && (e.ctrlKey == true || e.shiftKey == true) ){    // Если щелкнули по статусу c ctrl или shift
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
  if(e.target.nodeName === "TD" && e.target.cellIndex === 6 && e.ctrlKey == true){    // Если щелкнули не по галочке c ctrl
    var select = document.getElementById('resp_id_s');
    for( var i = 1; i < select.length; i ++){
      if(select[i].innerText === e.target.innerText){
        select.selectedIndex = i;
        onRespIdChange();
        break;
      }
    }
  }
  if(e.target.nodeName === "TD" && e.target.cellIndex === 7 && e.ctrlKey == true){    // Если щелкнули не по галочке c ctrl
    document.getElementById('searchClient').value = e.target.innerText;
    document.getElementById('searchClient').oninput();
  }
}

/*
  Правила переводов заявок:
  Ориентироваться на названия кнопок из Tickets[id].permissions
*/

function onTPopupClick(e) {
  var tid = document.getElementById('popupTicket').iidd;
  if(tid === undefined){ return;}

  switch(e.target.id){
    case "otv":{     // Клик был по ответственному лицу.
      if(Tickets[tid].permissions.indexOf("Подтвердить") != -1){
        $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html");
        loadTickets();
        return;
      }
      if(Tickets[tid].permissions.indexOf("Ответственное лицо") != -1){
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
    case "stat":{     // Клик был по статусу.
      document.getElementById('popupStatus').iidd = tid; // Сразу передадим в popupStatus id отображаемого тикета
      loadPopupStatus();
      centerPopupStatus();
      break;
    }
    case "toTabs":{     // Клик был по "В закладки".
      if(Tabs[tid] === undefined){
        var tab = {};
        tab.name = Tickets[tid].name;  // Запомним имя для отображения
        tab.text = document.getElementById('comment').value; // Запомним набираемый текст
        Tabs[tid] = tab;
      }else{
        delete Tabs[tid];
      }
      disablePopup();
      showIt();
      break;
    }
    case "plus05":{     // Клик по добавить 0,5 часа.
      break;
    }
    case "plus1":{     // Клик по добавить 1 час.
      break;
    }
  }
}

function onPsActionClick(e) {        // Нажата одна из кнопок смены статуса в попап Status (Обслуживание, решена, закрыта и т.д)
  var tid = document.getElementById('popupTicket').iidd;
  var par = {};
  par.branch_id = "100113";      // Подразделение автора по умолчанию
  par.resp_person_id = "931";    // id пользователя по умолчанию
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
      par.status_id = "2";     // В обслуживании
      break;
    }
    case "ps2Resolved": {
      par.trouble_type_closed = document.getElementById('psClass').value;
      par.trouble_subtype_closed = document.getElementById('psSubClass').value;
      par.trouble_type_name = document.getElementById('psType').value;
      par.trouble_type_resolution = document.getElementById('psResolve').value;
      par.status_id = "5";     // Решена
      break;
    }
    case "ps2Hold": {
      par.status_id = "4";     // Отложена
      break;
    }
    case "ps2Investigating": {
      par.status_id = "3";     // Расследование
      break;
    }
    case "ps2Close": {
      par.status_id = "7";     // Закрыта
      break;
    }
  }

  $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", par, callbackGetTicket, "html");
  loadTickets();
  $("#popupStatus").fadeOut("fast");
  popupStatus--;
  return;

}



function onPs2Confirm() {        // Кнопка "подтвердить"
  var tid = document.getElementById('popupTicket').iidd;
  if(Tickets[tid].permissions.indexOf("Подтвердить") != -1){
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html");
    loadTickets();
    $("#popupStatus").fadeOut("fast");
    popupStatus--;
    return;
  }

}

function onStatusNameClick(e) {   // По клику на имени залогиненого пользователя
  if(e.ctrlKey == true){       // Если кликнули с Ctrl - разлогинимся.
    $.get("https://oss.unitline.ru:995/app/ruser/logoff.asp?refer=/", null, callbackAuthorization, "html");
    return;
  }
  if(userId != -1){
    filterUser = userName;
    showIt();
  }
  for(i = 0; i < resp_id.length; i ++) {     // И выберем его в выпадающем списке
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
  disablePopup();
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

function qSelectClientClick(e){
  if(e.target.id === "qSelectClient"){
    for(var i = 0; i < organization_id.length && organization_id[i].text != e.target.text; i ++);  // Найдем в списке организаций щелкнутоо клиента
    if(i != organization_id.length) {
      document.getElementById('ppClient').selectedIndex = i;       // Веберем его в select
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

function commentOnKey(e){     //$.ajax версия
  if(e.keyCode == 10 && e.ctrlKey == true && document.getElementById('comment').value.length > 0){     // Нужна проверка на максимальную длинну
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

function sPassKeyPress(e){     //Нажатие Ентер в окне ввода пароля
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
function onTTKeyPress(e) {       // Ввод номера тикета
  if(e.keyIdentifier === "Enter"){
    if(!isNaN(parseInt(this.value, 10))){
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: this.value}, callbackGetTicket, "html");
      this.value = "";
    }
  }
}

function onResetFilterClick() {   // Сброс всех фильтров
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
// $.get("https://ru.wikipedia.org/w/index.php", {search:str.substring(adr1 + 7, adr2-1), title:"Служебная:Поиск", go:"Перейти" }, cbWiki, "html");
}

function onLoginClick() {
  setStatus("Авторизация  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Autorization' TITLE='Autorization'>");
  var par = {};
  par.refer = "";
  par.hex = hex_md5(document.getElementById('sPass').value);
  par.tries = "-1";
  par.user = document.getElementById('sLogin').value;
  par.password = document.getElementById('sPass').value;
  mySetTimeout(12, "Ошибка авторизации");
  $.post("https://oss.unitline.ru:995/adm/login.asp", par, callbackAuthorization, "html");
  document.getElementById('sLogin').value = "";           // Сотрем имя пользователя
  document.getElementById('sPass').value = "";            // Сотрем пароль
  disablePopup();

}

function onTabsClick(e){
  if(e.ctrlKey == false){
    document.getElementById('popupTicket').iidd = e.target.id; // Сразу передадим в popupTicket id отображаемого тикета
    highlightedTT = e.target.id;  // Запомним номер тикета для его подсветки в showIt()
    showIt();
    document.getElementById('comment').value = Tabs[e.target.id].text;
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: e.target.id}, callbackGetTicket, "html");
  }else{
    delete Tabs[e.target.id];
    showIt();
  }
}

function prepareToAnsi(){
// Инициализируем таблицу перевода
  for (var i = 0x410; i <= 0x44F; i++) {
    transAnsiAjaxSys[i] = i - 0x350; // А-Яа-я
  }
  transAnsiAjaxSys[0x401] = 0xA8;    // Ё
  transAnsiAjaxSys[0x451] = 0xB8;    // ё
  transAnsiAjaxSys[0x2116] = 0xB9;    // ё

  //var escapeOrig = window.escape;
  // Переопределяем функцию escape()
  window.encodeURIComponent = function(str) {
    var ret = [];
    // Составляем массив кодов символов, попутно переводим кириллицу
    for (var i = 0; i < str.length; i++){
      var n = str.charCodeAt(i);
      if (typeof transAnsiAjaxSys[n] != 'undefined')
        n = transAnsiAjaxSys[n];
      if (n <= 0xFF)
        ret.push(n);
    }
    var s = escape(String.fromCharCode.apply(null, ret));
    var j = s.indexOf("+");                              // Перекодировка "+"
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
  var str = "&nbsp;через&nbsp;";
  if(h < 10) str += "&nbsp";
  str += h + "ч&nbsp;";
  if(m < 10) str += "&nbsp";
  str += m + "м";
  document.getElementById('timeLeft').innerHTML = str;
}