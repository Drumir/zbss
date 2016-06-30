/*-----------------------------------------------------------------------------+
|  Project: ZBSS Chrome App
|  Copyright (c) 2014-2016 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/

//
//       Файл хранит функции так или иначе связаные с popup Ticket
//

function loadPopupTicket() {
  winManager.showMe("popupTicket");
}

function centerPopupTicket() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#leftPopupTicket").height() + 28;
  var popupWidth = $("#popupTicket").width();

  $("#popupTicket").css({
    "position": "absolute",
    "height": popupHeight,
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2,
    "max-height": windowHeight-20
  });

  $("#historyDiv").css({
    "max-height": popupHeight-117,
  });

  document.getElementById('comment').focus();
}

function callbackGetTicket(data, textStatus) {
  var tid, permissions, t, h, m, str;
  if(data != null) {  // null ли?!
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
    if(document.getElementById('PrintArea') == undefined) {    // Если загрузилось не то
      setStatus("Сбой получения тикета"); // Возможно bss про нас забыл за давностью лет.Попробуем переавторизоваться
      $.ajax({url: "https://bss.vconnect.ru/adm/", type: "GET", data:null, dataType:"html", contentType:"application/x-www-form-urlencoded; charset=windows-1251", error: onLoadError, success: callbackAuthorization});
      return;
    }
    var tb = document.getElementById('PrintArea').children[1].children[0];    // исходная таблица
    var ltb = document.getElementById('leftPTtBody');                         // Моя таблица
    var buttons = document.getElementsByClassName('inpButton');  // Получим список доступных кнопок
    permissions = "";
    for(var i = 0; i < buttons.length; i ++) {                          // Перепишем все их названия в permissions Через ***
      permissions += buttons[i].value + "***";
    }

    tid = tb.children[0].children[1].innerText;
    document.getElementById('popupTicket').iidd = tid

    ltb.children[0].children[1].innerText = tid;
    if(Tickets[tid] != undefined) ltb.children[1].children[1].innerText = Tickets[tid].data_open;   // Создан
    else ltb.children[1].children[1].innerText = tb.children[1].children[1].innerText;   // Создан
    ltb.children[2].children[1].innerText = tb.children[2].children[1].innerText;   // Заголовок
    ltb.children[3].children[1].innerText = tb.children[4].children[1].innerText;   // Автор
    ltb.children[4].children[1].innerText = tb.children[5].children[1].innerText;   // Отв. лицо
    ltb.children[5].children[1].innerText = tb.children[6].children[1].innerText;   // Приоритет
    ltb.children[6].children[1].innerText = tb.children[7].children[1].innerText;   // Статус
    ltb.children[7].children[1].innerText = tb.children[8].children[1].innerText;   // Регион
    ltb.children[8].children[1].innerHTML = tb.children[9].children[1].innerHTML;   // Клиент
    ltb.children[10].children[1].children[0].innerText = tb.children[10].children[1].innerText;   // Текст. Замени на innerText и появится перенос строк!

    document.getElementById('toTabs').innerText = "В закладки"; if(Tabs[tid] != undefined) document.getElementById('toTabs').innerText = "Из закладок";

    ltb.children[4].children[1].style.backgroundColor = "#FFFFFF";
    if(permissions.indexOf("Подтвердить") != -1){ // Если принятие заявки не подтверждено - выделим цветом
      ltb.children[4].children[1].style.backgroundColor = "#FFA500";
    }

    ltb.children[6].children[1].style.color = statusToColor(ltb.children[6].children[1].innerText);  // Расскрасим статус
    ltb.children[6].children[1].style.fontWeight = "bold";

    document.getElementById('hTable').innerHTML = "";
    delete tb;                  // Нельзя удалить объект! Можно только его свойства. Объекту можно присвоить undefined
    document.getElementById('tempDiv').innerHTML = "";

    if(Tickets[tid] == undefined){                            // Создает запись в Tickets если пользователь рткрыл тикет, которого там нет
      var tt = {};
      tt.id = tid;                // 52956
      tt.status = ltb.children[6].children[1].innerText;      // Service / Обслуживание"
      tt.data_open = ltb.children[1].children[1].innerText;   // 05.09.2014 21:42
      tt.region = ltb.children[7].children[1].innerText;      // RST
      tt.author = ltb.children[3].children[1].innerText;      // Сорокин Е. Г.
      tt.otv = ltb.children[4].children[1].innerText;         // Сорокин Е. Г.
      tt.client = ltb.children[8].children[1].innerHTML;      // *M.VIDEO*
      tt.name = ltb.children[2].children[1].innerText;        // Wi-Fi SZ №101 г. Ростов-на-Дону, ул. Красноармейская, 157
      tt.clas = "Закрыт";                                     // 6. Аварии вне зоны ответственности технической службы VC. Проблемы на сети взаимодействующего оператора связи
      tt.filial = ltb.children[7].children[1].innerText;      // RST (А должно быть "Ростовская область")
      tt.branch = "";                                         // Технический департамент (МегаМакс).<br>МЕГАМАКС
      tt.redAttention = false;                                   // Флаг, что у тикета поменялось отв. лицо на нас. Надо проверить подтвердил ли это пользователь.
      tt.permissions = "";                                    // Названия всех доступных в тикете кнопок разделенные "***"
      tt.timer = 0;                                           // Таймер-напоминалка отключен
      Tickets[tt.id] = tt;
      Tickets[tt.id].checked = false;
      Tickets[tt.id].renewed = true;
    }

    if(ltb.children[6].children[1].innerText == "Closed / Закрыта") Tickets[tid].status = "Closed / Закрыта"; // На случай если тикет закрылся коряво, обновим его статус в Tickets
    Tickets[tid].permissions = permissions;                                 // Выставим permissions для текущего тикета
    if(Tickets[tid].timer === 0){
      document.getElementById('timeLeft').style.fontWeight = "normal";
      document.getElementById('timeLeft').innerHTML = "&nbsp;&nbsp;&nbsp;отключен&nbsp;&nbsp;&nbsp;";
      document.getElementById('timeLeft').style.color = "#666666";
    }
    var now = new Date();
    now = now.getTime();
    if(Tickets[tid].timer > now){
      t = Math.floor((Tickets[tid].timer - now) / 60000);
      h = Math.floor(t/60);
      m = t - h*60;
      str = "осталось";
      if(h < 10) str += "&nbsp";
      str += h + "ч&nbsp;";
      if(m < 10) str += "&nbsp";
      str += m + "м";
      if(t === 0) str = "осталось < 1 м";
      document.getElementById('timeLeft').style.fontWeight = "bold";
      document.getElementById('timeLeft').style.color = "#113311";
      document.getElementById('timeLeft').innerHTML = str;
    }

    if(Tickets[tid].redAttention === true) Tickets[tid].redAttention = false; //При открытии требующего внимания тикета, отметка сбрасывается
    if(Tickets[tid].orangeAttention === true) Tickets[tid].orangeAttention = false; //При открытии требующего внимания тикета, отметка сбрасывается
    if(Tickets[tid].greenAttention === true) {
      Tickets[tid].greenAttention = false; // При открытии зеленого тикета, отметка сбрасывается
      Tickets[tid].watchPing = false;      // Слежение прекращается.
    }
    showIt();

    document.getElementById('comment').value = "";

    document.getElementById('ptZping').hidden = true;       // Спрячем элементы пинг
    document.getElementById('ptPingCBox').hidden = true;    // Спрячем элементы пинг
    document.getElementById('ptPingCBox').checked = false;    // Спрячем элементы пинг
    if(Tickets[tid].watchPing != undefined)
      document.getElementById('ptPingCBox').checked = Tickets[tid].watchPing;
    document.getElementById('ptHostidText').innerText = "hostid:";
    document.getElementById('ptHostId').value = "";
    document.getElementById('ptFindHostId').innerText = "найти";

    if(Tickets[tid].zhostid != undefined && Tickets[tid].zhostid != ""){   // Если этому тикету сопоставлен hostid
      document.getElementById('ptZping').style.color = "#666666";     // пока потери не известны, покрасим серым
      document.getElementById('ptZping').style.backgroundColor = "#FFFFFF";
      document.getElementById('ptZping').href = ""; 
      document.getElementById('ptZping').text = "запрос...";          // пока потери неизвестны
      document.getElementById('ptHostidText').innerText = "hostid:";  // Отобразим hostid
      document.getElementById('ptFindHostId').innerText = "изм";
      if(Tickets[tid].zhostid === "0")
        document.getElementById('ptHostId').value = "нет в zbx";
      else {
        document.getElementById('ptZping').hidden = false;              // покажем строку пинг
        document.getElementById('ptPingCBox').hidden = false;              // покажем  чекбокс пинг
        document.getElementById('ptPingCBox').disabled = true;              // покажем элементы строку пинг
        document.getElementById('ptHostId').value = Tickets[tid].zhostid;
        askZabbix(Tickets[tid].zhostid);
      }
    }

    loadPopupTicket();
    centerPopupTicket();
    $.post("https://bss.vconnect.ru/inc/jquery.asp", {type: "10", id: "1", tt_id: tid, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
    
    if(addTicketToHistory && TicketsViewHistory[TicketsViewHistory.length-1] != tid){  // Если разрешено добавление тикетов в историю, и этот тикет не равен последнему добавленому
      TicketsViewHistory.push(tid);
      if(TicketsViewHistory.length > 500)TicketsViewHistory.shift(); // Если длинна истории больше 500, выкинем первый (самый старый) элемент                                                  
    }
  }
}

function callbackGetHistory(data, textStatus) {
  if(data != null) {  // null ли?!
    var tid = document.getElementById('popupTicket').iidd;
    var innerHTML = "";
    var ht = document.getElementById('hTable');
    ht.hidden = true;
    ht.innerHTML = "";
    if(Tickets[tid].unpostedComm != undefined) document.getElementById('comment').value = Tickets[tid].unpostedComm; // Восстановим текст в поле воода.
    commentOnInput(); // Обновим счетчик набранных символов

    for(var i = 0; i < data.rows.length;  i ++) {
      var ttr = document.createElement('tr');
      arrFio = data.rows[i].fio.split(" ", 3);
      fio = arrFio[0] + " " + arrFio[1].substring(0,1) + ". " + arrFio[2].substring(0,1) + ".";

      innerHTML = '<td style="color:#1111bb"><b>' + ' ' + fio + '('+ data.rows[i].date +') ';
      if(data.rows[i].action.indexOf("Назначено ответственное лицо") != -1){
        innerHTML += "<IMG SRC='/images/arrow.png'> " + fullName2FIO(data.rows[i].action.substring(29));
      }
      else if(data.rows[i].action.indexOf("Оставлен комментарий") != -1){
        innerHTML += ':';
      }
      else if(data.rows[i].action.indexOf("Переведено в статус ") != -1){
        innerHTML += '<span style="color:' + statusToColor(data.rows[i].action.substring(20)) + '">'
        innerHTML += data.rows[i].action.substring(20) + '</span>';
      }
      else {
        innerHTML += data.rows[i].action;
      }
      innerHTML += '</b></td>';
      ttr.innerHTML = innerHTML;
      ht.appendChild(ttr);
      if(data.rows[i].comment.length > 1){
        ttr = document.createElement('tr');
        ttr.innerHTML = '<td>&nbsp;' + data.rows[i].comment + '</td>';
        ht.appendChild(ttr);
      }
    }
    ht.hidden = false;
  }

}

function onTPopupClick(e) {
  var tid = document.getElementById('popupTicket').iidd;
  if(tid === undefined){ return;}

  switch(e.target.id){
    case "otv":{     // Клик был по ответственному лицу.
      if(Tickets[tid].permissions.indexOf("Подтвердить") != -1){
        winManager.hideUper();    // Закроем попап Тикет
        $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_confirm.asp", {id: tid}, callbackGetTicket, "html");
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
        Tabs[tid] = tab;
      }else{
        delete Tabs[tid];
      }
      winManager.hideUper();
      showIt();
      break;
    }
  }
}

function commentOnKey(e){     //$.ajax версия
  if((e.keyCode == 10 && e.ctrlKey == true) || e.target.id === "ptPost"){     // Если Это Ctrl + Enter или клик по "комментарий"
    if(document.getElementById('comment').value.length > 0 && document.getElementById('comment').value.length < 501){
      var iidd = document.getElementById('popupTicket').iidd;
      var str = document.getElementById('comment').value;
      var a; 
      while((a = str.indexOf('\n')) != -1)      // Переделаем все \п в пробелы
        str = str.substring(0, a) + " " + str.substring(a+1); 
      document.getElementById('comment').value = "";       // Clear text field for not dublicate comments
      if(Tickets[iidd].unpostedComm != undefined) Tickets[iidd].unpostedComm = ""; // Сотрем запомненный в тикете текст
      var converted_str = encodeURIComponent(str);
      var param = "id=" + iidd + "&status_id=0&comment=" + converted_str;
      $.ajax({
        url: "https://bss.vconnect.ru/adm/tt/trouble_ticket_status_process.asp",
        type: "POST",
        data: param,
        dataType : "html",
        contentType : "application/x-www-form-urlencoded; charset=windows-1251",
      })
      $.post("https://bss.vconnect.ru/inc/jquery.asp", {type: "10", id: "1", tt_id: iidd, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
    }
  }
  if((userId == 1347 || userId == 1335) && document.getElementById('comment').value == "Я феечка и хочу озорничать") {
    document.getElementById('comment').value = "";
    Tickets[document.getElementById('popupTicket').iidd].permissions = "Ответственное лицо***Service / Обслуживание***Resolved / Решена***Hold / Отложена***Investigating / Расследование***Closed / Закрыта***Редактировать";
    dontCheckTransferPermissions = true;   // Разрешить однократный перевод тикета без проверки
  }  
}

function commentOnBlur(e){     // При потере окном воода коментария фокуса ввода, запомним набраный текст
  var iidd = document.getElementById('popupTicket').iidd;
  Tickets[iidd].unpostedComm = document.getElementById('comment').value;
}

function commentOnInput(e){     // При изменении набраного текста, посчитаем символы
  var textLength = document.getElementById('comment').textLength;
  document.getElementById('ptPostTextCounter').style.color = "#000000";  // Сначала очерним, а потом расскрасим счетчик введенных символов в зависимости от длинны текста
  if(textLength > 500) {
    document.getElementById('ptPostTextCounter').style.color = "#FF0000";
  }  
  document.getElementById('ptPostTextCounter').innerHTML = textLength + "&nbsp;&nbsp;"
}

function setTimer(e){
  var tid = document.getElementById('popupTicket').iidd;
  var now = new Date();
  now = now.getTime();
  if(Tickets[tid].timer < now)
    Tickets[tid].timer = now;

  switch(e.target.id){
    case "plus5m": {
      Tickets[tid].timer += 5*60000;
      break;
    }
    case "plus15m": {
      Tickets[tid].timer += 15*60000;
      break;
    }
    case "plus1h": {
      Tickets[tid].timer += 60*60000;
      break;
    }
    case "plus3h": {
      Tickets[tid].timer += 180*60000;
      break;
    }
    case "plus6h": {
      Tickets[tid].timer += 360*60000;
      break;
    }
    case "plus0": {
      Tickets[tid].timer = 0;
      Tickets[tid].redAttention = false;
      showIt();
      break;
    }
  }
  if(Tickets[tid] != undefined && Tickets[tid].timer === 0){
    document.getElementById('timeLeft').style.fontWeight = "normal";
    document.getElementById('timeLeft').innerHTML = "&nbsp;&nbsp;&nbsp;отключен&nbsp;&nbsp;&nbsp;";
    document.getElementById('timeLeft').style.color = "#666666";
  }
  if(Tickets[tid] != undefined && Tickets[tid].timer != 0){
    var t = Math.floor((Tickets[tid].timer - now)/60000);
    var h = Math.floor(t/60);
    var m = t - h*60;
    str = "&nbsp;&nbsp;через&nbsp;&nbsp;";
    if(h < 10) str += "&nbsp";
    str += h + "ч&nbsp;";
    if(m < 10) str += "&nbsp";
    str += m + "м";
    if(t === 0) str = "осталось < 1 м";
    document.getElementById('timeLeft').style.fontWeight = "bold";
    document.getElementById('timeLeft').style.color = "#113311";
    document.getElementById('timeLeft').innerHTML = str;
  }
}

function getSubClass() {
	var sVal = $("#psClass").val();
	$.ajax({
		url: "https://bss.vconnect.ru/adm/tt/ajax.asp",
		type: "POST",
		data: "type=3&id=" + sVal,
		dataType : "json",
		//error: function() { console.log("Произошла ошибка при соединении с сервером!") },
		success: onGetSubClassSuccess
	})
}

function onGetSubClassSuccess(data, textStatus) {   // Callback для соседней функции getSubClass()
  $("#psSubClass").empty();
  if (data.list) {
    for (var i in data.list) {
      $("#psSubClass").append("<option value='" + data.list[i].id + "'>" + data.list[i].name + "</option>")
    }
  }
}

function askZabbix(zhostid) {
    // method
  var method;
  // parameter
  var params = {};

  method = "item.get";
  params.hostids = zhostid;
  params.output = "extend";
  zserver.sendAjaxRequest(method, params, cbSuccessZ2, cbZabbixApiError); // Запросим доступность, имя, IP узла
}

function cbZabbixApiError(){
zabbixApiAuth();                 // Если запрос доступности не удался, попробуем переавторизоваться в заббикс API
}

function cbSuccessZ2(response, status) {
  if (typeof(response.result) === 'object') {
    var i;
    for(i = 0; i < response.result.length && response.result[i].name != "Потери %"; i ++); // Найдем в массиве нужный объект (type которого = 3)
    if(i != response.result.length){  // Если строка с потерями найдена
      document.getElementById('ptZping').href = "https://zabbix.msk.unitline.ru/zabbix/history.php?action=showgraph&itemids[]=" + response.result[i].itemid;  // создадим ссылку
      document.getElementById('ptZping').text = "Потери " + response.result[i].lastvalue + "%";
      
      document.getElementById('ptZping').style.color = "#FF2222";     // потери
      document.getElementById('ptPingCBox').disabled = false;         // Разрешим ставить галку следить за хостом
      if(response.result[i].lastvalue < 5 || response.result[i].prevvalue < 5){
        document.getElementById('ptZping').style.color = "#86AC00";    // потери только начались или только закончились
        //document.getElementById('ptPingCBox').disabled = true;         // Запретим следить за хостом (он непонятный)
      }
      if(response.result[i].lastvalue == 0){
        document.getElementById('ptZping').style.color = "#116611";    // потерь нет
        document.getElementById('ptPingCBox').disabled = true;         // Запретим следить за хостом (он и так в порядке)
      }
      var delay = new Date();
      delay = delay.getTime()/1000 - response.result[i].lastclock;     // Вычислим как давно было последнее обновление пинга
      document.getElementById('ptZping').title = "Последнее обновление было " + Math.floor(delay) + " секунд назад";
      if(delay > 60){                                                  // пинг подзалежался
        document.getElementById('ptZping').style.backgroundColor = "#FFEEEE";
        document.getElementById('ptZping').title = "Последнее обновление было " + Math.floor(delay/6)/10 + " минут назад";
      }
      if(delay > 300){                                                 // пинг протух
        document.getElementById('ptZping').style.backgroundColor = "#FFCCCC";
        document.getElementById('ptZping').title = "Последнее обновление было " + Math.floor(delay/6)/10 + " минут назад";
      }
      if(delay > 3600){                                                 // пинг протух
        document.getElementById('ptZping').style.backgroundColor = "#FFAAAA";
        document.getElementById('ptZping').title = "Последнее обновление было " + Math.floor(delay/360)/10 + " часов назад";
      }
      if(delay > 3600*24){                                                 // пинг протух
        document.getElementById('ptZping').style.backgroundColor = "#FF7777";
        document.getElementById('ptZping').title = "Последнее обновление было " + Math.floor(delay/8640)/10 + " суток назад";
      }
    }
  }
}

function onHostidEnter(e) {       // Ввод hostid
  if(e.keyIdentifier === "Enter"){
    if(!isNaN(parseInt(this.value, 10)))       // Если ввели число
    {
      var iidd = document.getElementById('popupTicket').iidd;       // Получим id открытого тикета
      if(Tickets[iidd] != undefined){
        Tickets[iidd].zhostid = this.value;                         // Запомним zhostid тикета
        winManager.hideUper();                                      // Переоткроем попап с тикетом
        $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");

        params = {action:"write", ttid:iidd, hostid:this.value};    // Запишем свежую привязку в базу
        $.ajax({
          url: sqlServerAdress,
          type: 'post',
          dataType: 'json',
          data: params,
          success: cbSqlWriteSuccess
        });

      }
    }
    else this.value = "";
  }
}

function onPingCBoxClick() {
  var iidd = document.getElementById('popupTicket').iidd;       // Получим id открытого тикета
  Tickets[iidd].watchPing = document.getElementById('ptPingCBox').checked;
}