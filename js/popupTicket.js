//
//       Файл хранит функции так или иначе связаные с popup Ticket
//

function loadPopupTicket() {
  if (popupStatus == 0) {
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupTicket").fadeIn("fast");
    popupStatus++;
  }
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
    "max-height": popupHeight-92,
  });

  document.getElementById('comment').focus();
}

function callbackGetTicket(data, textStatus) {
  var tid, permissions, t, h, m, str;
  if(data != null) {  // null ли?!
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
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
    ltb.children[1].children[1].innerText = tb.children[1].children[1].innerText;   // Создан
    ltb.children[2].children[1].innerText = tb.children[2].children[1].innerText;   // Заголовок
    ltb.children[3].children[1].innerText = tb.children[4].children[1].innerText;   // Автор
    ltb.children[4].children[1].innerText = tb.children[5].children[1].innerText;   // Отв. лицо
    ltb.children[5].children[1].innerText = tb.children[6].children[1].innerText;   // Приоритет
    ltb.children[6].children[1].innerText = tb.children[7].children[1].innerText;   // Статус
    ltb.children[7].children[1].innerText = tb.children[8].children[1].innerText;   // Регион
    ltb.children[8].children[1].innerHTML = tb.children[9].children[1].innerHTML;   // Клиент
    ltb.children[9].children[1].children[0].innerText = tb.children[10].children[1].innerText;   // Текст. Замени на innerText и появится перенос строк!

    document.getElementById('toTabs').innerText = "В закладки"; if(Tabs[tid] != undefined) document.getElementById('toTabs').innerText = "Из закладок";

    ltb.children[4].children[1].style.backgroundColor = "#FFFFFF";
    if(permissions.indexOf("Подтвердить") != -1){ // Если принятие заявки не подтверждено - выделим цветом
      ltb.children[4].children[1].style.backgroundColor = "#FFA500";
    }

    ltb.children[6].children[1].style.color = statusToColor(ltb.children[6].children[1].innerText);  // Расскрасим статус
    ltb.children[6].children[1].style.fontWeight = "bold";

    document.getElementById('hTable').innerHTML = "";
    delete tb;
    document.getElementById('tempDiv').innerHTML = "";

    if(Tickets[tid] == undefined){
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
      tt.filial = ltb.children[7].children[1].innerText;      // Ростовская область
      tt.branch = "";                                         // Технический департамент (МегаМакс).<br>МЕГАМАКС
      tt.attention = false;                                   // Флаг, что у тикета поменялось отв. лицо на нас. Надо проверить подтвердил ли это пользователь.
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

    if(Tickets[tid].attention === true) Tickets[tid].attention = false; //При открытии требующего внимания тикета, отметка сбрасывается
    showIt();

    document.getElementById('comment').value = "";

    loadPopupTicket();
    centerPopupTicket();
    $.post("https://oss.unitline.ru:995/inc/jquery.asp", {type: "10", id: "1", tt_id: tid, page: "1", rows: "200", hide: "0"}, callbackGetHistory, "json");
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
        Tabs[tid] = tab;
      }else{
        delete Tabs[tid];
      }
      disablePopups();
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
      document.getElementById('comment').value = "";       // Clear text field for not dublicate comments
      if(Tickets[iidd].unpostedComm != undefined) Tickets[iidd].unpostedComm = ""; // Сотрем запомненный в тикете текст
      var converted_str = encodeURIComponent(str);
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
  if((userId == 1347 || userId == 1317) && document.getElementById('comment').value == "Я феечка и хочу озорничать") {
    document.getElementById('comment').value = "";
    Tickets[document.getElementById('popupTicket').iidd].permissions = "Ответственное лицо***Service / Обслуживание***Resolved / Решена***Hold / Отложена***Investigating / Расследование***Closed / Закрыта";
    dontCheckTransferPermissions = true;   // Разрешить однократный перевод тикета без проверки
  }
}
function commentOnBlur(e){     // При потере окном воода коментария фокуса ввода, запомним набраный текст
  var iidd = document.getElementById('popupTicket').iidd;
  Tickets[iidd].unpostedComm = document.getElementById('comment').value;
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
      Tickets[tid].attention = false;
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
		url: "https://oss.unitline.ru:995/adm/tt/ajax.asp",
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