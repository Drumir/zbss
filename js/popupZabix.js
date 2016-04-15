//
//       Файл хранит функции так или иначе связаные с popupZabix
//
var highlightedZH;          // HostId щелкнутого узла
var resolvedHostIds = {};   // {hostid:{hostid, name, available, groups[], invent, uptime},... }    Набор объектов с данными о уже опрошенных узлах
var hostToResearch = {};    // {hostid, name, available, groups[{groupid,hosts[],internal,name},..], invent, uptime}  // Исследуемый в данный момент хост. Если undefined, значит ничего не исслкдуется

function loadPopupZabix() {
  var zClient = "";
  var select = document.getElementById('pzClient');
  var tid = document.getElementById('popupTicket').iidd;
  select.selectedIndex = 0;
  $("#pzFound").empty();
  document.getElementById('pzHostId').innerText = "";
  document.getElementById('pzLocation').value = "";
//    var expr = new RegExp('&quot;', 'gm');
  document.getElementById('pzCaption').innerText = "Поиск узла для: " + Tickets[tid].name.replace(new RegExp('&quot;', 'gm'), '"') + ".  Клиент: " + Tickets[tid].client;
  ShowHostStat();   // Очистим таблицу с описанием "найденного" хоста   
  document.getElementById('pzLostGrath').style.color = "#000000";     // Почерним график потерь и пинга
  document.getElementById('pzLostGrath').href = "https://zabbix.msk.unitline.ru/zabbix/";  // обнулим ссылку
  document.getElementById('pzLostGrath').text = "Потери ?%";


  zClient = bssClient2zGroup(Tickets[tid].client);  // Попытаемся определить zabbix groupid по BSS Client Name
  document.getElementById('popupZabix').zClient = zClient;

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
  winManager.showMe("popupZabix");
  document.getElementById('pzLocation').focus();
}

function centerPopupZabix() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupZabix").height();
  var popupWidth = $("#popupZabix").width();

  $("#popupZabix").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2 - 60,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

function onPtFindHostIdClick() {      // Вызов из popupTicket (данные берем из Tickets)
  loadPopupZabix();
  centerPopupZabix();
}

function zGetGroups() {   // Вызывается однократно после авторизации для получения списка групп в zabbix
    // method
  $("#char0").css({"color":"green"});
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
    ttr.id = "hostid=" + zResponse[key].hostid;

    str = '<td><a href="https://zabbix.msk.unitline.ru/zabbix/latest.php?open=1&apps[0]=7374&hostid=' + zResponse[key].hostid + '&fullscreen=0" target="_blank">' +  zResponse[key].hostid + '</a></td>';
    str += '<td>' + zResponse[key].host + '</td>';
    str += '<td></td>';
    str += '<td>' + zResponse[key].name + '</td>';
    str += '<td>';
    for(var gr in zResponse[key].groups){
      var grid = zResponse[key].groups[gr].groupid;
      str += zGroupsObj[grid] + " ";
    }
    str += '</td>';
    ttr.innerHTML = str;
//    ttr.id = "hostid=" +
    if(ttr.hostid == highlightedZH){
      ttr.style.backgroundColor = "#FFFFCC"; // Выделеный тикет
    }
    document.getElementById('pzFound').insertBefore(ttr, document.getElementById('pzFound').children[0]);
  }
  var a = document.getElementById('pzClient');
  if(str.length == 0 && document.getElementById('popupZabix').zClient != "GA"){  // Если ничего не найдено, и искали не в GA
    document.getElementById('pzFound').innerHTML = "<tr width=100% align='center'><td></td><td></td><td></td><td>Ничего не найдено. Нажмите Enter чтобы искать в группе GA</td></tr>";
  }
  centerPopupZabix();
          // Если щелкнули не по "найти", а по "изменить", то нужно сразу отобразить инфу об известном хосте
  var tid = document.getElementById('popupTicket').iidd;
  if(Tickets[tid].zhostid != undefined && Tickets[tid].zhostid != 0){           // Если к текущему тикету уже привязан hostid
    if(document.getElementById('pzHostId').innerText != Tickets[tid].zhostid){  // Если параметры нужного узла еще не отображены
      var e = {target:{parentNode:{hostid:Tickets[tid].zhostid},nodeName:"TD"}};// Подделаем  e.target.parentNode.hostid
      onPzFoundTBodyClick(e);                                                   // Симитируем клик по строке в найденых хостах
    }
  }
}

function onzLocationEdit() {
  ShowZList();
}

function onzLocationKey(e){
  if(e.keyIdentifier == "Enter"){     // Если в строке поиска хоста нажали Ентер
    var select = document.getElementById('pzClient');
    for(var key in select){
      if(select[key].text == "GA"){
        select.selectedIndex = select[key].index; // Выберем группу GA
        onPzClientChange();
        return;
      }
    }

  }
}

function onPzFoundTBodyClick(e) {
  document.getElementById('pzLocation').focus(); // Вернем фокус строке ввода
  if(e.target.nodeName == "A") return;            // Кликнули по ссылке, обрабатывать не нужно
  document.getElementById('pzHostId').innerText = e.target.parentNode.hostid;
  highlightedZH = e.target.parentNode.hostid;
  if(hostToResearch.hostid == undefined){                // Если в данный момент никакой хост не исследуется,
    ShowHostStat();                                     // Сотрем инфу о предудцщем найденном хосте
    zResearchHost(e.target.parentNode.hostid);          // Запросим всю инфу о щелкнутом хосте
  }
//  ShowZList();
}

function zResearchHost(hostid) {
  hostToResearch.hostid = hostid;
  var method = "hostgroup.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch0, null); // Запросим список групп в которые входит щелкнутый hostid
}



function cbzResearch0(response, status){
  if(typeof(response.result) != 'object') {   // Исследование закончено неудачей
    delete hostToResearch;
    return;
  }
  hostToResearch.groups = response.result;
  var method = "host.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch1, null); // Запросим статус хоста
}

function cbzResearch1(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // Исследование закончено неудачей

  hostToResearch.name = response.result[0].name;
  /*if(response.result[0].snmp_disable_until == 0)
    hostToResearch.available = response.result[0].snmp_available; */ // Закоментим потому что врет
  hostToResearch.ip = response.result[0].host;
  var method = "application.get";
  // parameter
  var params = {};
  params.output = "extend";
  params.hostids = hostToResearch.hostid;
  zserver.sendAjaxRequest(method, params, cbzResearch2, null); // Запросим список application's для хоста
}

function cbzResearch2(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // Исследование закончено неудачей

  for(var key in response.result) {
    if(response.result[key].name == "General"){   // Найдем в полученом списке строку с name General
      var method = "item.get";
      var params = {};
      params.output = "extend";
      params.applicationids = response.result[key].applicationid;  // Запросим items для applicationid строки с именем General
      zserver.sendAjaxRequest(method, params, cbzResearch3, null); // Запросим items
      break;
    }
  }
}

function cbzResearch3(response, status){
  if(typeof(response.result) != 'object'){ShowHostStat(); return;}    // Исследование закончено неудачей

  for(var key in response.result) {
    if(response.result[key].name == "Device uptime"){   // Найдем в полученом списке строку с name General
      hostToResearch.upTime = response.result[key].lastvalue;
      hostToResearch.upTimeLc = response.result[key].lastclock;
      break;
    }
  }           // Когда-нибудь я узнаю у Левченко как эти данные получает hostinventories.php и наступит благодать
  $.get("https://zabbix.msk.unitline.ru/zabbix/hostinventories.php?hostid=" + hostToResearch.hostid, null, cbzResearch4, "html");
}

function cbzResearch4(data, textStatus){
  hostToResearch.mac = "-:-:-:-:-:-";
  var adr0 = data.indexOf('MAC&nbsp;адрес&nbsp;A');
  if(adr0 != -1){
    data = data.substring(adr0);
    adr0 = data.indexOf('<span class="pre">');
    var adr1 = data.indexOf('</span>');
    if(adr0 != -1 && adr1 != -1) hostToResearch.mac = data.substring(adr0+18, adr1);
  }

  hostToResearch.invent = "Данные не найдены";
  var adr0 = data.indexOf('>Примечания</td>');
  if(adr0 != -1){
    data = data.substring(adr0);
    adr0 = data.indexOf('<span class=');
    var adr1 = data.indexOf('</span>');
    if(adr0 != -1 && adr1 != -1) hostToResearch.invent = data.substring(adr0+18, adr1);
  }
  var params = {};

  var method = "item.get";
  params.hostids = hostToResearch.hostid;
  params.output = "extend";
  zserver.sendAjaxRequest(method, params, cbzResearch5, null); // Запросим доступность, имя, IP узла

}

function cbzResearch5(response, status){
  if (typeof(response.result) === 'object') {
    var i;
    for(i = 0; i < response.result.length && response.result[i].name != "Потери %"; i ++); // Найдем в массиве нужный объект c именем "Потери %"
    if(i != response.result.length && response.result[i].lastclock != 0){  // Если строка с потерями найдена
      document.getElementById('pzLostGrath').href = "https://zabbix.msk.unitline.ru/zabbix/history.php?action=showgraph&itemid=" + response.result[i].itemid;  // создадим ссылку
      document.getElementById('pzLostGrath').text = "Потери " + response.result[i].lastvalue + "%";
      
      document.getElementById('pzLostGrath').style.color = "#FF2222";     // потери
      if(response.result[i].lastvalue < 5 || response.result[i].prevvalue < 5)
        document.getElementById('pzLostGrath').style.color = "#86AC00";    // потери только начались или только закончились
      if(response.result[i].lastvalue < 5 && response.result[i].prevvalue < 5)
        document.getElementById('pzLostGrath').style.color = "#116611";    // потерь нет
    }
  }

  ShowHostStat();
}

function ShowHostStat() {
  var str = "";
  str = "Группы: ";
  if(hostToResearch.groups != undefined)
    for(var key in hostToResearch.groups) str += hostToResearch.groups[key].name + "; ";
  document.getElementById('pzGroups').innerText = str;

  str = "Device Uptime ---";
  if(hostToResearch.upTime != undefined){
    str = "Device Uptime&nbsp;&nbsp;<b>";
    if(hostToResearch.upTime > 3600*24) {
      str += Math.floor(hostToResearch.upTime / (3600*24)) + " дня, ";
      hostToResearch.upTime %= 3600*24;
    }
    str += Math.floor(hostToResearch.upTime / 3600) + ":";
    hostToResearch.upTime %= 3600;
    str += Math.floor(hostToResearch.upTime / 60) + ":";
    hostToResearch.upTime %= 60;
    str += hostToResearch.upTime;
  }
  if(hostToResearch.upTimeLc != undefined){
    var d = new Date(1000*hostToResearch.upTimeLc);
    str += "</b>&nbsp;&nbsp;&nbsp;&nbsp;(Обновлено&nbsp;&nbsp;<b>" + d.toLocaleString() + "</b>&nbsp;&nbsp;)";
  }
  document.getElementById('pzUpTime').innerHTML = str;

  document.getElementById('pzIp').innerText = "";
  if(hostToResearch.ip != undefined)
    document.getElementById('pzIp').innerText = hostToResearch.ip;

  document.getElementById('pzMAC').innerText = "";
  if(hostToResearch.mac != undefined)
    document.getElementById('pzMAC').innerText = hostToResearch.mac;

  var expr = new RegExp('&quot;', 'gm');
  document.getElementById('pzHostName').innerText = "";
  if(hostToResearch.name != undefined)
    document.getElementById('pzHostName').innerText = hostToResearch.name.replace(expr, '"');

  document.getElementById('pzHostInfo').innerText = "";
  if(hostToResearch.invent != undefined)
    document.getElementById('pzHostInfo').innerText = hostToResearch.invent.replace(expr, '"');

  for(var key in hostToResearch) delete hostToResearch[key];  // Удалим собранные данные о хосте, чтобы они не подменили результат следующего исследования
}


// ARP:         https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=5&sid=e99e99bd382fd777
// Des of Inter https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=6&sid=e99e99bd382fd777
// ping         https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=1&sid=e99e99bd382fd777
// Traceroute   https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=12914&scriptid=2&sid=e99e99bd382fd777


function onPzRunScriptsClick(e){
  var tid = document.getElementById('popupTicket').iidd;
  var scriptId = 1;
  if(document.getElementById('pzHostId').innerText != ""){           // Если hostid уже выбран
    switch(e.target.id){
      case "pzARP":       {scriptId = 5; break;}
      case "pzDesOfInt":  {scriptId = 6; break;}
      case "pzRunPing":   {scriptId = 1; break;}
      case "pzTracert":   {scriptId = 2; break;}
      default: return;
    }
  $.get("https://zabbix.msk.unitline.ru/zabbix/scripts_exec.php?execute=1&hostid=" + document.getElementById('pzHostId').innerText + "&scriptid=" + scriptId + "&sid=" + zSessionId, null, cbRunScripts, "html");
  loadPopupRunScripts();
  centerPopupRunScripts();
  }
}

function cbRunScripts(data, status){
  document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
  if(document.getElementsByClassName("pre fixedfont") == undefined) {    // Если загрузилось не то
    document.getElementById('popupInRunScripts').innerText = "Не удалось получить информацию";
    return;
  }
  document.getElementById('prsCaption').innerText = document.getElementById("tab_scriptTab").innerText;
  document.getElementById('popupInRunScripts').innerText = document.getElementsByClassName("pre fixedfont")[0].innerText;
  document.getElementById('tempDiv').innerHTML = "";
  centerPopupRunScripts();
}

function onPzClientChange() {         // Вызывается при выборе группы в <select>
  document.getElementById('pzLocation').focus(); // Вернем фокус строке ввода
  var select = document.getElementById('pzClient');
  if(select.selectedIndex == 0) return;
  document.getElementById('popupZabix').zClient = select[select.selectedIndex].text; // Запомним кто сейчас выбран
  var method = "host.get";
  var params = {};
  params.output = "extend";
  params.groupids = select[select.selectedIndex].value;
  zserver.sendAjaxRequest(method, params, cbSuccessZgetHostsOfGroups, null); // Запросим список узлов, входящих в найденные группы
}

function onPzBtnCancelClick(){
  winManager.hideUper();
}

function onPzBtnOkClick(){
  if(!isNaN(parseInt(document.getElementById('pzHostId').innerText, 10))){
    winManager.hideUper();       // Сразу закроем окно забикса
    var iidd = document.getElementById('popupTicket').iidd;               // Получим id открытого тикета
    if(Tickets[iidd] != undefined){
      Tickets[iidd].zhostid = document.getElementById('pzHostId').innerText;  // Запомним zhostid тикета
      winManager.hideUper();  // Закроем так же и окно тикета, чтобы оно переоткрылось с новыми данными
      $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");

      params = {action:"write", ttid:iidd, hostid:Tickets[iidd].zhostid};   // Запишем свежую привязку в базу
      $.ajax({
        url: sqlServerAdress,
        type: 'post',
        dataType: 'json',
        data: params,
        success: cbSqlWriteSuccess
      });
    }
  }
}

function onPzNotInZbxClick(){                  // Клик по строчке "Считать, что для этого ТТ нет узла в Zabbix"
  var iidd = document.getElementById('popupTicket').iidd;               // Получим id открытого тикета
  if(Tickets[iidd] != undefined){
    Tickets[iidd].zhostid = "0";  // Запомним zhostid тикета
    winManager.hideUper();  // Закроем так же и окно тикета, чтобы оно переоткрылось с новыми данными
    $.get("https://bss.vconnect.ru/adm/tt/trouble_ticket_edt.asp", {id: iidd}, callbackGetTicket, "html");

    params = {action:"write", ttid:iidd, hostid:Tickets[iidd].zhostid};   // Запишем свежую привязку в базу
    $.ajax({
      url: sqlServerAdress,
      type: 'post',
      dataType: 'json',
      data: params,
      success: cbSqlWriteSuccess
    });
    }

}

function bssClient2zGroup(client) {
  var zClient;
  switch(client){   // Попытаемся определить zabbix groupid по BSS Client Name
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
    default: zClient = "GA";
  }
  return zClient;
}