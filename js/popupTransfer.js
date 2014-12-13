//
//       Файл хранит функции так или иначе связаные с popup Transfer
//

function loadPopupTransfer() {
  if (popupStatus < 2) {   // Этот попап может располагаться над уже открытым
      // Если вдруг список подразделений еще не заполнен, нужно открыть первый тикет из очереди с тем, чтобы спереть оттуда этот список
    if(branch_id.length == 0){
      for (var key in Tickets) {
        if(Tickets[key].checked === true){   // Найдем первый отмеченный тикет
          break;
        }
      }
      mySetTimeout(12, "Ошибка загрузки списка подразделений");
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: key}, callbackLoadEnvironment2, "html");
    }
    GetCPList();                  // Загрузим между делом список ответственных лиц
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupTransfer").fadeIn("fast");
    document.getElementById('buttonTransfer').hidden = false;
    document.getElementById('btTransfNote').innerText = "";
//    document.getElementById('popupTransfer').TTCount = 0;     // Количество переводимых тикетов
//    document.getElementById('popupTransfer').TTOk = 0;        // Количество успешно переведенных тикетов
//    document.getElementById('popupTransfer').TTError = 0;     // Количество ошибок
    popupStatus++;
  }
}

function centerPopupTransfer() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupTransfer").height();
  var popupWidth = $("#popupTransfer").width();

  $("#popupTransfer").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function onBtnMoveClick(e) {
  loadPopupTransfer();
  centerPopupTransfer();
}

function onHeadChBoxClick(){
  var flag = document.getElementById('headChBox').checked;
  for (var i = 0; i < mtb.childElementCount; i ++) {
    Tickets[mtb.children[i].iidd].checked = flag;
  }
  showIt();
}

function onButtonTransferClick(e) {        // Функция только формирует очередь transQueue из выбраных тикетов
  transQueue.length = 0;
  for (var key in Tickets) {
    if(Tickets[key].checked === true){
      var par = {};
      par.branch_id = $("#branchLiist").val();           // Подразделение нового отв. лица
      par.resp_person_id = $("#resp_person_id").val();  // id нового отв. лица
      par.trouble_type_closed = "0";
      par.trouble_subtype_closed = "0";
      par.trouble_type_name = "0";
      par.trouble_type_resolution = "1";
      par.trouble_root_tt = "0";
      par.status_id = "-1";
      par.comment = "_";
      par.id = Tickets[key].id;   //52458 id тикета
      par.region_id = filialToRegionId(Tickets[key].filial);
      transQueue.push(par);
      Tickets[key].checked = false;
    }
  }
  document.getElementById('buttonTransfer').hidden = true;
  TTOkTransferCount = 0;
  TTErTransferCount = 0;
  checkAndTransfer();
}

function checkAndTransfer() {
  if(transQueue.length != 0){   // Если очередь не пустая, открыть первый тикет из очереди.
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: transQueue[0].id}, cbCheckAndTransfer, "html");
  }
  else {
    loadTickets();
    setTimeout(disablePopups, 1000);
    setStatus("ТТ переведено " + TTOkTransferCount + "; Отказано " + TTErTransferCount);
  }
}

function cbCheckAndTransfer(data, textStatus){
  if(data != null) {  // null ли?!
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
    var buttons = document.getElementsByClassName('inpButton');  // Получим список доступных кнопок
    var permissions = "";
    for(var i = 0; i < buttons.length; i ++) {           // Перепишем все их названия в permissions Через ***
      permissions += buttons[i].value + "***";
    }
    document.getElementById('tempDiv').innerHTML = "";

//    if(1){ // Не выполнять проверку на правомерность перевода
    if( dontCheckTransferPermissions === true) { permissions += "***Ответственное лицо***"; dontCheckTransferPermissions = false;}

    if(permissions.indexOf("Ответственное лицо") != -1){ // Если среди кнопок есть "Ответственное лицо", можно переводить
      $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", transQueue[0], checkAndTransfer, "html"); //Перевод
      TTOkTransferCount ++;
      document.getElementById('btTransfNote').text = "ТТ осталось " + transQueue.length + "; Переведено " + TTOkTransferCount + "; Отказано " + TTErTransferCount;
      transQueue.splice(0, 1);    // Удалить из очереди первый тикет
    }
    else {
      TTErTransferCount ++;
      window.setTimeout(checkAndTransfer, 300);
      transQueue.splice(0, 1);    // Удалить из очереди первый тикет
      document.getElementById('btTransfNote').innerText = "ТТ осталось " + transQueue.length + "; Переведено " + TTOkTransferCount + "; Отказано " + TTErTransferCount;
    }
  }
}

function transferTickets() {
  if(transQueue.length != 0){   // Если очередь не пустая, перевести первый тикет из очереди.
    // Нужно сначала открывать этот тикет, смотреть еслть ли там кнопка "ответственное лицо" и только потом переводить.
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: transQueue[0].id}, cbCheckBeforeTransfer, "html");
    $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", transQueue[0], transferTickets, "html");
    transQueue.splice(0, 1);    // Удалить из очереди первый тикет
  }
  else {
    loadTickets();
    disablePopups();
  }
}

function onPopupTransferClick(e){
  branchSelect = 0;
  switch(e.target.id){
    case "branchNN": {branchSelect = 100184; break;}
    case "branchMSK": {branchSelect = 119; break;}
    case "branchSPB": {branchSelect = 79; break;}
    case "branchRnD": {branchSelect = 99; break;}
    case "branchSMR": {branchSelect = 103; break;}
    case "branchEKB": {branchSelect = 83; break;}
    case "branchYAR": {branchSelect = 111; break;}
    case "branchVLG": {branchSelect = 96; break;}
    default: {return;}
  }
  document.getElementById('branchLiist').value = branchSelect;
  GetCPList();
}


function onBtnTransOnSelfClick(e) {   // Функция только формирует очередь transQueue из выбраных тикетов
}

function GetCPList() {
	var branchID = $("#branchLiist").val();
	$.post("https://oss.unitline.ru:995/adm/tt/ajax.asp", { type: "2", id: branchID}, function(data, textStatus) {
			$("#resp_person_id").empty();
			if (data.list) {
				for (var i in data.list) {
					$("#resp_person_id").append("<option value='" + data.list[i].id + "'>" + data.list[i].name + "</option>")
				}
			}
		}, "json");
}

function callbackLoadEnvironment2(data, textStatus) {    // Этот каллбэк используется для получения списка подразделений авторов. Вызывается при первой загрузуки попапа трансфер
  resetTimeout();
  if(data != null) {  // null ли?!
    var div1 = document.createElement('div');
    div1.insertAdjacentHTML( 'beforeend', data );                 // Создадим из data DOM дерево
    div1.hidden = true;
    document.body.appendChild(div1);
                                      // Загрузим списки
    if(document.getElementById('branchlist') != undefined){
      branch_id = document.getElementById('branchlist').children;          // Ответственные лица
//      document.getElementById('branchLiist').children = branch_id; // Загрузим список срузу в попап трансфер - список подразделений
      $("#branchLiist").empty();                             // Загрузим список срузу в попап трансфер - список подразделений
      for(var i = 0; i < branch_id.length; i ++) {
        if(branch_id[i].value === "100184")
          $("#branchLiist").append("<option value='" + branch_id[i].value + "' selected = 'true'>" + branch_id[i].text + "</option>");
        else
          $("#branchLiist").append("<option value='" + branch_id[i].value + "'>" + branch_id[i].text + "</option>");
      }
    }
    else {
      document.getElementById('buttonTransfer').hidden = true;
      document.getElementById('btTransfNote').innerText = "Невозможно получить список подразделений";
    }
    document.body.removeChild(div1)    // Очистим временный div
    div1.innerText = "";
  }
}
