/*-----------------------------------------------------------------------------+
|  Project: ZBSS Chrome App
|  Copyright (c) 2014-2016 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/

function WinManager(){
  this.winStack = [];
                                                 // z-index первого попапа = 3. Под ним будет  backgroundPopup с z-index = 2
  this.showMe = function(popupId) {
    this.winStack.push("backgroundPopup");
    $("#backgroundPopup").css({"opacity": "0.7", "z-index": this.winStack.length+1});
    $("#backgroundPopup").fadeIn("fast");

    this.winStack.push(popupId);
    $("#" + popupId).css({"z-index": this.winStack.length+1});
    $("#" + popupId).fadeIn("fast");
  };

  this.hideUper = function() {
    if(this.winStack.length > 1) {
      $("#"+this.winStack.pop()).fadeOut("fast");     // Закроем верхний попап
      this.winStack.pop();                            // Удалим из стека backgroundPopup - подложку закрытого попапа
      //$("#backgroundPopup").css({"opacity": "0.7", "z-index": this.winStack.length});
      if(this.winStack.length == 0)                   // Если больше открытых попапов нет,
        $("#backgroundPopup").fadeOut("fast");        // Спрячем backgroundPopup
      else                                            // Если закрыли еще не все попапы, передвинем backgroundPopup под верхний popup
        $("#backgroundPopup").css({"opacity": "0.7", "z-index": this.winStack.length});
    }
  };
}

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

function loadPopupStatus() {
  var tid = document.getElementById('popupStatus').iidd;
  var actionCount = 0;
  document.getElementById('psCopyTr').hidden = true;
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
  document.getElementById('ps2Edit').hidden = true;
  if(Tickets[tid].permissions.indexOf("Редактировать") != -1){
    document.getElementById('ps2Edit').hidden = false;
    actionCount++;
  }

  document.getElementById('psLabel').hidden = true;
  if(actionCount == 0){                                   // Если нет ни одной доступной операции
    document.getElementById('psLabel').hidden = false;    // Отобразим соответствующую надпись
  }

  document.getElementById('psClass').selectedIndex = 0;
//    document.getElementById('psSubClass').selectedIndex = 0;
  document.getElementById('psType').selectedIndex = 0;
  document.getElementById('psResolve').selectedIndex = 0;
  document.getElementById('psComment').value = "";

  winManager.showMe("popupStatus");
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



function loadPopupRunScripts() {
  winManager.showMe("popupRunScripts");
  document.getElementById('popupInRunScripts').innerHTML = "Ожидание ответа сервера <IMG SRC='/images/wait.gif' alignment='vertical' alt='Renew'>";
  document.getElementById('prsCaption').innerText = "";
}

function centerPopupRunScripts() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupRunScripts").height();
  var popupWidth = $("#popupRunScripts").width();

  $("#popupRunScripts").css({
    "position": "absolute",
//    "height": popupHeight,
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2,
  });
}


function loadPopupOptions() {
  document.getElementById('poCheckResolved').checked = checkResolved;
  document.getElementById('poSqlServerAdress').value = sqlServerAdress;
  winManager.showMe("popupOptions");
}

function centerPopupOptions() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupOptions").height();
  var popupWidth = $("#popupOptions").width();

  $("#popupOptions").css({
    "position": "absolute",
//    "height": popupHeight,
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2,
  });
}


function loadPopupLogin() {
  winManager.showMe("popupLogin");
  chrome.storage.local.get(null, cbRememberPass);
}

function cbRememberPass(pairs) {
  var a = pairs["user"];
  var b = pairs["password"];
  if(a != undefined) document.getElementById('sLogin').value = a;
  if(b != undefined) document.getElementById('sPass').value = b;
  if (b === undefined || b === "")  document.getElementById('savePass').checked = false;
  else document.getElementById('savePass').checked = true;

                // Заодно прочитаем и настройки
  checkResolved = false;  // Настройка "слежение за решенными"
  if(pairs["checkResolved"] != undefined && pairs["checkResolved"] == "yes")
    checkResolved = true;
  
  sqlServerAdress = "http://drumir.zz.vc/ajax.php"; // Прочитаем адрес сервера привязок TT-HostId
  if(pairs["sqlServerAdress"] != undefined && pairs["sqlServerAdress"].length > 10)
    sqlServerAdress = pairs["sqlServerAdress"];
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
  $.post("https://bss.vconnect.ru/adm/login.asp", par, callbackAuthorization, "html");
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
  winManager.hideUper();
}

function onPrsCloseBtnClick() {
  winManager.hideUper();
 }

function onPsSubClassChange(){
  document.getElementById('psCopyTr').hidden = true;
  var clas = document.getElementById('psClass').value;
  var sClas = document.getElementById('psSubClass').value;
  var type = document.getElementById('psType');
  if(this.value == "80" && clas == "30"){
    type.value = "1";
    document.getElementById('psCopyTr').hidden = false;
    document.getElementById('psCopyText').innerText = "TT " + document.getElementById('popupStatus').iidd + ". Проблема в сети взаимодействующего оператора связи. ТТ закрыт.";
    document.getElementById('psComment').placeholder = "Укажите название ВОС";
  }
}

function onPsCopyImgClick(){
  var ht = document.getElementById('hiddenText');
  ht.textContent = document.getElementById('psCopyText').innerText;
  ht.hidden = false;
  ht.selectionStart = 0;                                              // Копируем список в буфер обмена
  ht.selectionEnd = ht.textLength;
  document.execCommand('copy');
  ht.hidden = true;
}

function onVersionClick(){
  loadPopupOptions();
  centerPopupOptions();
}

function onPoSaveClick(){
  var pairs = {};
  pairs["checkResolved"] = "no";
  checkResolved = document.getElementById('poCheckResolved').checked;
  if(checkResolved)
    pairs["checkResolved"] = "yes";

  sqlServerAdress = document.getElementById('poSqlServerAdress').value;
  pairs["sqlServerAdress"] = sqlServerAdress;
  chrome.storage.local.set(pairs);
  winManager.hideUper();
}