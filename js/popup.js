/*-----------------------------------------------------------------------------+
|  Project: BSS Chrome App
|  Copyright (c) 2014 drumir@mail.ru
|  All rights reserved.
+-----------------------------------------------------------------------------*/

var popupStatus = 0;

function WinManager(){
  this.winStack = [];
                                            // z-index ������� ������ = 3. ��� ��� �����  backgroundPopup � z-index = 2
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
      $("#"+this.winStack.pop()).fadeOut("fast");     // ������� ������� �����
      this.winStack.pop();                            // ������ �� ����� backgroundPopup - �������� ��������� ������
      //$("#backgroundPopup").css({"opacity": "0.7", "z-index": this.winStack.length});
      if(this.winStack.length == 0)                   // ���� ������ �������� ������� ���,
        $("#backgroundPopup").fadeOut("fast");        // ������� backgroundPopup
      else                                            // ���� ������� ��� �� ��� ������, ���������� backgroundPopup ��� ������� popup
        $("#backgroundPopup").css({"opacity": "0.7", "z-index": this.winStack.length});
    }
  };
}

function disablePopups() {
  winManager.hideUper(); /*
  if (popupStatus > 0) {
    $("#backgroundPopup").fadeOut("fast");
    $("#popupTransfer").fadeOut("fast");
    $("#popupStatus").fadeOut("fast");
    $("#popupTicket").fadeOut("fast");
    $("#popupNewTT").fadeOut("fast");
    $("#popupZabix").fadeOut("fast");
    $("#popupEditTT").fadeOut("fast");
    $("#popupLogin").fadeOut("fast");
    $("#popupRunScripts").fadeOut("fast");
    popupStatus = 0;
  }  */
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
  if(Tickets[tid].permissions.indexOf("�����������") != -1){
    document.getElementById('ps2Confirm').hidden = false;
    actionCount++;
    }
  document.getElementById('ps2Servis').hidden = true;
  if(Tickets[tid].permissions.indexOf("Service / ������������") != -1){
    document.getElementById('ps2Servis').hidden = false;
    actionCount++;
  }
  document.getElementById('ps2Resolved').hidden = true;
  if(Tickets[tid].permissions.indexOf("Resolved / ������") != -1){
    document.getElementById('ps2Resolved').hidden = false;
    actionCount++;
  }
  document.getElementById('ps2Hold').hidden = true;
  if(Tickets[tid].permissions.indexOf("Hold / ��������") != -1){
    document.getElementById('ps2Hold').hidden = false;
    actionCount++;
  }
  document.getElementById('ps2Investigating').hidden = true;
  if(Tickets[tid].permissions.indexOf("Investigating / �������������") != -1){
    document.getElementById('ps2Investigating').hidden = false;
    actionCount++;
  }
  document.getElementById('ps2Close').hidden = true;
  if(Tickets[tid].permissions.indexOf("Closed / �������") != -1){
    document.getElementById('ps2Close').hidden = false;
    actionCount++;
  }
  document.getElementById('ps2Edit').hidden = true;
  if(Tickets[tid].permissions.indexOf("�������������") != -1){
    document.getElementById('ps2Edit').hidden = false;
    actionCount++;
  }

  document.getElementById('psLabel').hidden = true;
  if(actionCount == 0){                                   // ���� ��� �� ����� ��������� ��������
    document.getElementById('psLabel').hidden = false;    // ��������� ��������������� �������
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
  document.getElementById('popupInRunScripts').innerHTML = "";
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


function sPassKeyPress(e){     //������� ����� � ���� ����� ������
  if(e.keyIdentifier === "Enter" && document.getElementById('sPass').value.length > 0){     //
    onLoginClick();
  }
}

function onLoginClick() {
  setStatus("�����������  <IMG SRC='/images/wait.gif' alignment='vertical' ALT='Autorization' TITLE='Autorization'>");
  var par = {};
  par.refer = "";
  par.hex = hex_md5(document.getElementById('sPass').value);
  par.tries = "-1";
  par.user = document.getElementById('sLogin').value;
  par.password = document.getElementById('sPass').value;
  mySetTimeout(12, "������ �����������");
  $.post("https://oss.unitline.ru:995/adm/login.asp", par, callbackAuthorization, "html");
  document.getElementById('sLogin').value = "";           // ������ ��� ������������
  document.getElementById('sPass').value = "";            // ������ ������
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
    document.getElementById('psCopyText').innerText = "TT " + document.getElementById('popupStatus').iidd + ". �������� � ���� ������������������ ��������� �����. �� ������.";
    document.getElementById('psComment').placeholder = "������� �������� ���";
  }
}

function onPsCopyImgClick(){
  var ht = document.getElementById('hiddenText');
  ht.textContent = document.getElementById('psCopyText').innerText;
  ht.hidden = false;
  ht.selectionStart = 0;                                              // �������� ������ � ����� ������
  ht.selectionEnd = ht.textLength;
  document.execCommand('copy');
  ht.hidden = true;

}