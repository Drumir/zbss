//
//       Файл хранит функции так или иначе связаные с popupZabix
//

function loadPopupZabix() {
  if (popupStatus < 2) {
    var zClient = "";
    var select = document.getElementById('pzClient');
    select.selectedIndex = 0;
    $("#pzFound").empty();                                          // Очистим список найденых хостов
    document.getElementById('pzHostId').value = "";
    document.getElementById('pzLocation').value = "";
    document.getElementById('pzCaption').innerText = "Узел для " + document.getElementById('popupZabix').Caption + " " + document.getElementById('popupZabix').BssClient;


    switch(document.getElementById('popupZabix').BssClient){   // Попытаемся определить zabbix groupid по BSS Client Name
      case "*Adidas*":{ zClient = "Адидас"; break;}
      case "*Alfa group*":{ zClient = "Альфа-банк"; break;}
      case "*ALFA-BANK*":{ zClient = "Альфа-банк"; break;}
      case "*Apteka A5*":{ zClient = "Аптека А5"; break;}
      case "*BestPrice*":{ zClient = "БЭСТ ПРАЙС"; break;}
      case "*BILLA*":{ zClient = "Билла"; break;}
      case "*BIOCAD*":{ zClient = "Биокад"; break;}
      case "*CentrObuv*":{ zClient = "Центр Обувь"; break;}
      case "*CROSSMEDIA*":{ zClient = "Кроссмедиа"; break;}
      case "*DELOVIE LINII*":{ zClient = "Деловые линии"; break;}
      case "*Delovie Linii*":{ zClient = "Деловые линии"; break;}
      case "*Deti*":{ zClient = "Дети"; break;}
      case "*DETMIR*":{ zClient = "Детский Мир"; break;}
      case "*ELDORADO*":{ zClient = "Эльдорадо"; break;}
      case "*ENTER*":{ zClient = "Энтер"; break;}
      case "*ER-Telecom*":{ zClient = "Эр-Телеком Холдинг"; break;}
      case "*EUROPLAST*":{ zClient = "Европласт"; break;}
      case "*EUROSET*":{ zClient = "Евросеть"; break;}
      case "*Fandy*":{ zClient = "Фандей"; break;}
      case "*GarsTelecom*":{ zClient = "Гарстелеком"; break;}
      case "*GAZPROMBANK*":{ zClient = "Газпромбанк"; break;}
      case "*GOLDTELECOM*":{ zClient = "Голд Телеком"; break;}
      case "*HOMECREDIT*":{ zClient = "Хоум-Кредит"; break;}
      case "*ID Logistic Rus*":{ zClient = "ИД Логистикс Рус"; break;}
      case "*IDEA BANK*":{ zClient = "ИДЕА БАНК"; break;}
      case "*INCITY*":{ zClient = "Инсити"; break;}
      case "*INVESTBANK*":{ zClient = "Инвест-банк"; break;}
      case "*KB Transportniy*":{ zClient = "Транспортный"; break;}
      case "*Leroy Merlin*":{ zClient = "Леруа Мерлен"; break;}
      case "*LETOBANK*":{ zClient = "Лето-банк"; break;}
      case "*Lombard Blago*":{ zClient = "Ломбард Благо"; break;}
      case "*M.VIDEO*":{ zClient = "М.видео Менеджмент"; break;}
      case "*MacDonald*":{ zClient = "Макдональдс"; break;}
      case "*MakDak*":{ zClient = "Макдональдс"; break;}
      case "*MChS Russia*":{ zClient = "Специальное управление ФПС № 3 МЧС России"; break;}
      case "*MEGAFON*":{ zClient = "Мегафон"; break;}
      case "*MIRATORG*":{ zClient = "Мираторг"; break;}
      case "*Next Commerce*":{ zClient = "Некст Коммерс"; break;}
      case "*Obrazovanie*":{ zClient = "Образование (банк)"; break;}
      case "*OSTIN*":{ zClient = "Остин"; break;}
      case "*OTP-Bank*":{ zClient = "ОТП-банк"; break;}
      case "*PARIBA*":{ zClient = "БНП Париба"; break;}
      case "*PLANET*":{ zClient = "Планета"; break;}
      case "*Quiclymoney*":{ zClient = "Быстроденьги"; break;}
      case "*RENCAP*":{ zClient = "Ренессанс Капитал"; break;}
      case "*Rivgosh*":{ zClient = "Рив Гош"; break;}
      case "*ROSTELECOM-MSK*":{ zClient = "Ростелеком"; break;}
      case "*ROSTELECOM-SPB*":{ zClient = "Ростелеком"; break;}
      case "*RusTelCompany*":{ zClient = "Русская Телефонная Компания"; break;}
      case "*SAMOTLOR*":{ zClient = "Самотлор"; break;}
      case "*SBERBANK*":{ zClient = "Сбербанк"; break;}
      case "*SPORTMASTER*":{ zClient = "Спортмастер"; break;}
      case "*SrochnoDengi*":{ zClient = "Быстроденьги"; break;}
      case "*STEC.COM*":{ zClient = "Стэк ком"; break;}
      case "*SVYAZNOY*":{ zClient = "Связной"; break;}
      case "*Svyaznoy*":{ zClient = "Синтерра"; break;}
      case "*SYNTERRA*":{ zClient = "Синтерра"; break;}
      case "*TASCOM*":{ zClient = "ТАСКОМ"; break;}
      case "*TechnoSila*":{ zClient = "Техносила"; break;}
      case "*Telsikom*":{ zClient = "Телсиком"; break;}
      case "*Ulibka Radugi*":{ zClient = "Улыбка радуги"; break;}
      case "*UNISTREAM*":{ zClient = "Юнистрим"; break;}
      case "*Vertical*":{ zClient = "Вертикаль"; break;}
      case "*VladPromBank*":{ zClient = "Владпромбанк"; break;}
      case "*VTB24*":{ zClient = "Мультикарта"; break;}
      case "*WHITE WIND*":{ zClient = "Белый Ветер"; break;}
      case "*X5*":{ zClient = "Х-5"; break;}
      default: zClient = "все";
    }

    if(zClient != "все") {     // Если удалось выбрать группу
      var gids = [];          // Массив для хранения ids подходящих zгрупп
      for(var i = 0; i < zGroups.length; i ++) {
        if(zGroups[i].name.indexOf(zClient) == 0){
          gids.push(zGroups[i].groupid);   // Добавим в массив id подходящей группы
        }
      }
      if(gids.length > 0) {  // Если найдена хоть одна подходящая группа
        var method = "host.get";
        var params = {};
        params.output = "extend";
        params.groupids = gids;
        zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // Запросим список узлов, входящих в найденные группы
      }
    }
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupZabix").fadeIn("fast");
    popupStatus++;
  }
}

function centerPopupZabix() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupZabix").height();
  var popupWidth = $("#popupZabix").width();

  $("#popupZabix").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function onPtFindHostIdClick() {      // Вызов из popupTicket (данные берем из Tickets)
  document.getElementById('popupZabix').BssClient = Tickets[document.getElementById('popupTicket').iidd].client;
  document.getElementById('popupZabix').Caption = Tickets[document.getElementById('popupTicket').iidd].name;
  loadPopupZabix();
}
/*
function onPnFindHostIdClick() {        // Вызов из popupNewTT (данные берем из popupNewTT)
  document.getElementById('popupZabix').BssClient = document.getElementById('ppClient')[document.getElementById('ppClient').selectedIndex].text;
  document.getElementById('popupZabix').Caption = document.getElementById('shortTTDescr').value;
  loadPopupZabix();
}
*/
function zGetGroups() {   // Вызывается однократно после авторизации для получения списка групп в zabbix
    // method
  var method = "hostgroup.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.sortfield = "name";
  zserver.sendAjaxRequest(method, params, cbzGetGroups, null); // Запросим список групп (читай клиентов)
}

function cbzGetGroups(response, status) {         // Получим список всех групп
  if(typeof(response.result) === 'object') {
    zEnabled = true;
    zGroups = response.result;
    $("#pzClient").empty();          // Заполним список клиентов в popupZabix
    $("#pzClient").append("<option value='0'>Выбрать группу</option>")
    for(var i = 0; i < zGroups.length; i ++) {
      $("#pzClient").append("<option value='" + zGroups[i].groupid + "'>" + zGroups[i].name + "</option>")
      zGroupsObj[zGroups[i].groupid] = zGroups[i].name;     // Заодно сформируем объект-список груп в формате groupid:groupname
    }
  }
}

function cbSuccessZgetHostsOfGroups(response, status) {  // Получим список хостов, входящих в заданные группы
  if (typeof(response.result) === 'object') {
    zResponse = response.result;
    ShowZList();
  }
  centerPopupZabix();
}

function ShowZList() {
  $("#pzFound").empty();                                          // Очистим список найденых хостов
  var str = "";
  var filterFlag;
  var filterZLocation = [];                                      // Массив слов для поиска
  filterZLocation = document.getElementById('pzLocation').value.toLowerCase().split(' ');
  for(var key in zResponse) {      // Цикл по всем найденым хостам
    filterFlag = false;
    for(var i in filterZLocation)  // Проверка наличия в имени хоста всех слов из массива_слов_для_поиска
      if(zResponse[key].name.toLowerCase().indexOf(filterZLocation[i]) == -1){
        filterFlag = true;
        continue;
      }
    if(filterFlag) continue;       // Если в имени хоста не оказалось хотя бы 1 слова из массива_слов_для_поиска, пропускаем этот хост
    var ttr = document.createElement('tr');
    ttr.hostid = zResponse[key].hostid;

    str = '<tr><td><a style="color:#1133AA">Выбрать</a></td>';
    str += '<td><a href="https://zabbix.msk.unitline.ru/zabbix/latest.php?open=1&apps[0]=7374&hostid=' + zResponse[key].hostid + '&fullscreen=0" target="_blank">' +  zResponse[key].hostid + '</a></td>';
    str += '<td>' + zResponse[key].host + '</td>';
    str += '<td>' + zResponse[key].available + '</td>';
    str += '<td>' + zResponse[key].name + '</td>';
    str += '<td>';
    for(var gr in zResponse[key].groups){
      var grid = zResponse[key].groups[gr].groupid;
      str += zGroupsObj[grid] + " ";
    }
    str += '</td></tr>';
    ttr.innerHTML = str;
    document.getElementById('pzFound').insertBefore(ttr, document.getElementById('pzFound').children[0]);
  }
  centerPopupZabix();
}

function onPzBtnCancelClick(){
  if (popupStatus > 0) {            // Сразу закроем popup Zabix
    $("#popupZabix").fadeOut("fast");
    popupStatus--;
  }
  if (popupStatus === 0) {          // Если popup Zabix был открыт не поверх другого попапа, а сам по себе, то спрячем и background popup
    $("#backgroundPopup").fadeOut("fast");
  }
}
function onPzBtnOkClick(){
  if(!isNaN(parseInt(document.getElementById('pzHostId').value, 10))){

    if(popupStatus > 0) {            // Сразу закроем popup Zabix
      $("#popupZabix").fadeOut("fast");
      popupStatus--;
    }
    if (popupStatus === 0) {          // Если popup Zabix был открыт не поверх другого попапа, а сам по себе, то спрячем и background popup
      $("#backgroundPopup").fadeOut("fast");
    }
    var iidd = document.getElementById('popupTicket').iidd;               // Получим id открытого тикета
    if(Tickets[iidd] != undefined){
      Tickets[iidd].zhostid = document.getElementById('pzHostId').value;  // Запомним zhostid тикета
      disablePopups();                                                    // Переоткроем попап с тикетом
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");
    }
  }
}

function onzLocationEdit() {
  ShowZList();
}

function onPzFoundTBodyClick(e) {
  if(e.target.tagName == "A" && e.target.parentNode.cellIndex == 0) {
    document.getElementById('pzHostId').value = e.target.parentNode.parentNode.hostid;
  }
}

function onPzClientChange() {
  var select = document.getElementById('pzClient');
  if(select.selectedIndex == 0) return;
  var method = "host.get";
  var params = {};
  params.output = "extend";
  params.groupids = select[select.selectedIndex].value;
  zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // Запросим список узлов, входящих в найденные группы
}