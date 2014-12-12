/*-----------------------------------------------------------------------------+
|  Project: BSS Chrome App
|  Copyright (c) 2014 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/

var popupStatus = 0;


function filialToRegionId(filial){
  var region = -1;
  for(var i = 0; i < tt_region.length; i ++) {
    if(tt_region[i].innerText === filial){
      region = tt_region[i].value;
      break;
    }
  }
  return region;
}



function disablePopup() {
  if (popupStatus > 0) {
    $("#backgroundPopup").fadeOut("fast");
    $("#popupTransfer").fadeOut("fast");
    $("#popupStatus").fadeOut("fast");
    $("#popupTicket").fadeOut("fast");
    $("#popupNewTT").fadeOut("fast");
    $("#popupLogin").fadeOut("fast");
    popupStatus = 0;
  }
}


function loadPopupStatus() {
  if (popupStatus < 2) {   // Этот попап может быть показан поверх другого попапа! Вторым, но не третьим "этажом"
    //GetCPList();                  // Загрузим между делом список ответственных лиц
    var tid = document.getElementById('popupStatus').iidd;
    var actionCount = 0;
    document.getElementById('ps2Confirm').hidden = true;
    if(Tickets[tid].permissions.indexOf("Подтвердить") != -1){
      document.getElementById('ps2Confirm').hidden = false;
      actionCount++;
      }
    document.getElementById('ps2Servis').hidden = true;
    if(Tickets[tid].permissions.indexOf("Service / Обслуживание") != -1){
      document.getElementById('ps2Servis').hidden = false;
      actionCount++;
    }
    document.getElementById('ps2Resolved').hidden = true;
    if(Tickets[tid].permissions.indexOf("Resolved / Решена") != -1){
      document.getElementById('ps2Resolved').hidden = false;
      actionCount++;
    }
    document.getElementById('ps2Hold').hidden = true;
    if(Tickets[tid].permissions.indexOf("Hold / Отложена") != -1){
      document.getElementById('ps2Hold').hidden = false;
      actionCount++;
    }
    document.getElementById('ps2Investigating').hidden = true;
    if(Tickets[tid].permissions.indexOf("Investigating / Расследование") != -1){
      document.getElementById('ps2Investigating').hidden = false;
      actionCount++;
    }
    document.getElementById('ps2Close').hidden = true;
    if(Tickets[tid].permissions.indexOf("Closed / Закрыта") != -1){
      document.getElementById('ps2Close').hidden = false;
      actionCount++;
    }

    document.getElementById('psLabel').hidden = true;
    if(actionCount == 0){                                   // Если нет ни одной доступной операции
      document.getElementById('psLabel').hidden = false;    // Отобразим сообветствующую надпись
    }

    document.getElementById('psClass').selectedIndex = 0;
//    document.getElementById('psSubClass').selectedIndex = 0;
    document.getElementById('psType').selectedIndex = 0;
    document.getElementById('psResolve').selectedIndex = 0;
    document.getElementById('psComment').value = "";

    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupStatus").fadeIn("fast");
    popupStatus++;
  }
}

function centerPopupStatus() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupStatus").height();
  var popupWidth = $("#popupStatus").width();

  $("#popupStatus").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}



function loadPopupLogin() {
  if (popupStatus == 0) {
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupLogin").fadeIn("fast");
    popupStatus++;
  }
  chrome.storage.local.get(null, cbRememberPass);
}

function cbRememberPass(pairs) {
  var a = pairs["user"];
  var b = pairs["password"];
  if(a != undefined) document.getElementById('sLogin').value = a;
  if(b != undefined) document.getElementById('sPass').value = b;
  if (b === undefined || b === "")  document.getElementById('savePass').checked = false;
  else document.getElementById('savePass').checked = true;
}

function centerPopupLogin() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupLogin").height();
  var popupWidth = $("#popupLogin").width();

  $("#popupLogin").css({
    "position": "absolute",
    "height": popupHeight,
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2,
    "max-height": windowHeight-20
  });
}


function sPassKeyPress(e){     //Нажатие Ентер в окне ввода пароля
  if(e.keyIdentifier === "Enter" && document.getElementById('sPass').value.length > 0){     //
    onLoginClick();
  }
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
  var pairs = {};
  if(document.getElementById('savePass').checked == true){
    pairs["user"] = par.user;
    pairs["password"] = par.password;
  }else{
    pairs["user"] = "";
    pairs["password"] = "";
  }
  chrome.storage.local.set(pairs);
  disablePopup();
}
