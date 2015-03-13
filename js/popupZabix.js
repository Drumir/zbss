//
//       Файл хранит функции так или иначе связаные с popupZabix
//

function loadPopupZabix() {
  if (popupStatus < 2) {
    $("#pzFound").empty();                                          // Очистим список найденых хостов
    var tid = document.getElementById('popupTicket').iidd;
    var zClient = "";
    var select = document.getElementById('pzClient');
    select.selectedIndex = 0;
    switch(Tickets[tid].client){   // Попытаемся определить zabbix groupid по BSS Client Name
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
          if(select.selectedIndex == 0) select.selectedIndex = i;  // Выберем в селекте pzClient первую подходящую группу
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

function onPtFindHostIdClick() {
  loadPopupZabix();
}

function zGetGroups() {
    // method
  var method = "hostgroup.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.sortfield = "name";
  zserver.sendAjaxRequest(method, params, cbSuccessZgg, null); // Запросим список групп (читай клиентов)
}

function cbSuccessZgg(response, status) {         // Получим список всех групп
  if (typeof(response.result) === 'object') {
    zGroups = response.result;
    $("#pzClient").empty();          // Заполним список клиентов в popupZabix
    for(var i = 0; i < zGroups.length; i ++) {
      $("#pzClient").append("<option value='" + zGroups[i].groupid + "'>" + zGroups[i].name + "</option>")
      zGroupsObj[zGroups[i].groupid] = zGroups[i].name;     // Заодно сформируем объект-список груп в формате groupid:groupname
    }
  }
}

function cbSuccessZgetHostsOfGroups(response, status) {  // Получим список хостов, входящих в заданные группы
  if (typeof(response.result) === 'object') {
    var str = "";
    for(var key in response.result) {
      var ttr = document.createElement('tr');
      ttr.hostid = response.result[key].hostid;

      str = '<tr><td><a style="color:#1133AA">Выбрать</a></td>';
      str += '<td><a href="https://zabbix.msk.unitline.ru/zabbix/latest.php?open=1&apps[0]=7374&hostid=' + response.result[key].hostid + '&fullscreen=0" target="_blank">' +  response.result[key].hostid + '</a></td>';
      str += '<td>' + response.result[key].host + '</td>';
      str += '<td>' + response.result[key].available + '</td>';
      str += '<td>' + response.result[key].name + '</td>';
      str += '<td>';
      for(var gr in response.result[key].groups){
        var grid = response.result[key].groups[gr].groupid;
        str += zGroupsObj[grid] + " ";
      }
      str += '</td></tr>';
      ttr.innerHTML = str;
      document.getElementById('pzFound').insertBefore(ttr, document.getElementById('pzFound').children[0]);
    }

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