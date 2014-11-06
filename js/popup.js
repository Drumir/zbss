/*-----------------------------------------------------------------------------+
|  Project: Polyonex Chrome App
|  Copyright (c) 2013 Polyonex LLC.
|  All rights reserved.
+-----------------------------------------------------------------------------*/

var popupStatus = 0;

function onButtonTransferClick(e) {
  transQueue.length = 0;
  for (var key in Tickets) {
    if(Tickets[key].checked === true){
      var par = {};
      par.branch_id = $("#branchList").val();           // ������������� ������ ���. ����
      par.resp_person_id = $("#resp_person_id").val();  // id ������ ���. ����
      par.trouble_type_closed = "0";
      par.trouble_subtype_closed = "0";
      par.trouble_type_name = "0";
      par.trouble_type_resolution = "1";
      par.trouble_root_tt = "0";
      par.status_id = "-1";
      par.comment = "_";
      par.id = Tickets[key].id;   //52458 id ������
      par.region_id = filialToRegionId(Tickets[key].filial);
      transQueue.push(par);
      Tickets[key].checked = false;    
    }
  } 
  checkAndTransfer();
}

function checkAndTransfer() {
  if(transQueue.length != 0){   // ���� ������� �� ������, ������� ������ ����� �� �������.
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: transQueue[0].id}, cbCheckAndTransfer, "html");
  }
  else {
    loadTickets();
    disablePopup();
  }
}

function cbCheckAndTransfer(data, textStatus){
  if(data != null) {  // null ��?! 
    document.getElementById('tempDiv').insertAdjacentHTML( 'beforeend', data );
    var buttons = document.getElementsByClassName('inpButton');  // ������� ������ ��������� ������
    var permissions = "";
    for(var i = 0; i < buttons.length; i ++) {           // ��������� ��� �� �������� � permissions ����� ***
      permissions += buttons[i].value + "***";  
    }
    document.getElementById('tempDiv').innerHTML = ""; 

    if(1){ // �� ��������� �������� �� ������������� ��������
//    if(permissions.indexOf("������������� ����") != -1){ // ���� ����� ������ ���� "������������� ����", ����� ����������
      $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", transQueue[0], checkAndTransfer, "html"); //�������
    }
    else {
      // �����-������ ������������ �� ���������� ����� ���������� ���� �����
    }
  transQueue.splice(0, 1);    // ������� �� ������� ������ �����
  }
}

function transferTickets() {
  if(transQueue.length != 0){   // ���� ������� �� ������, ��������� ������ ����� �� �������.
    // ����� ������� ��������� ���� �����, �������� ����� �� ��� ������ "������������� ����" � ������ ����� ����������.
    $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: transQueue[0].id}, cbCheckBeforeTransfer, "html");
    $.post("https://oss.unitline.ru:995/adm/tt/trouble_ticket_status_process.asp", transQueue[0], transferTickets, "html");
    transQueue.splice(0, 1);    // ������� �� ������� ������ �����
  }
  else {
    loadTickets();
    disablePopup();
  }
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

function GetCPList() {
	var branchID = $("#branchList").val();
	$.post("https://oss.unitline.ru:995/adm/tt/ajax.asp", { type: "2", id: branchID}, function(data, textStatus) { 
			$("#resp_person_id").empty();
			if (data.list) { 
				for (var i in data.list) {
					$("#resp_person_id").append("<option value='" + data.list[i].id + "'>" + data.list[i].name + "</option>")
				}
			}
		}, "json");
}

function getSubClass() {
	var sVal = $("#psClass").val();
	$.ajax({
		url: "https://oss.unitline.ru:995/adm/tt/ajax.asp",
		type: "POST",
		data: "type=3&id=" + sVal,
		dataType : "json",
		error: function() { console.log("��������� ������ ��� ���������� � ��������!") },
		success: function(data, textStatus) { 
			$("#psSubClass").empty();
			if (data.list) { 
				for (var i in data.list) {
					$("#psSubClass").append("<option value='" + data.list[i].id + "'>" + data.list[i].name + "</option>")
				}
			}
		}
	})
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

function loadPopupTransfer() {
  if (popupStatus < 2) {   // ���� ����� ����� ������������� ��� ��� ��������
      // ���� ����� ������ ������������� ��� �� ��������, ����� ������� ������ ����� �� ������� � ���, ����� ������� ������ ���� ������
    if(branch_id.length == 0){
      for (var key in Tickets) {
        if(Tickets[key].checked === true){   // ������ ������ ���������� ����� 
          break;
        }
      } 
      setTimeout(6, "������ �������� ������ �������������");
      $.get("https://oss.unitline.ru:995/adm/tt/trouble_ticket_edt.asp", {id: key}, callbackLoadEnvironment2, "html");
    }
    GetCPList();                  // �������� ����� ����� ������ ������������� ���
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupTransfer").fadeIn("fast");
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

function loadPopupStatus() {
  if (popupStatus < 2) {   // ���� ����� ����� ���� ������� ������ ������� ������! ������, �� �� ������� "������"
    //GetCPList();                  // �������� ����� ����� ������ ������������� ��� 
    var tid = document.getElementById('popupStatus').iidd;
    var actionCount = 0;
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
    
    document.getElementById('psLabel').hidden = true;
    if(actionCount == 0){
      document.getElementById('psLabel').hidden = false;
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

function loadPopupNewTT() {
  if (popupStatus == 0) {
    $("#shortTTDescr")[0].value = "";
    $("#TTDescr")[0].value = "";
    $("#ppClient")[0].selectedIndex = 0;
    $("#ppRegion")[0].selectedIndex = 0;
    $("#wikiLink")[0].text = "";     

    var reg =  $("#ppRegion");
    if(reg != undefined && reg[0].length === 0) {
      for(var i = 0; i < tt_region.length; i ++){
        reg.append("<option value='" + tt_region[i].value + "'>" + tt_region[i].text + "</option>");
      }
    } 
    reg =  $("#ppClient");
    if(reg != undefined && reg[0].length === 0) {
      for(i = 0; i < organization_id.length; i ++){
        reg.append("<option value='" + organization_id[i].value + "'>" + organization_id[i].text + "</option>");
      }
    }
    $("#backgroundPopup").css({
      "opacity": "0.7"
    });
    $("#backgroundPopup").fadeIn("fast");
    $("#popupNewTT").fadeIn("fast");
    popupStatus++;
  }
}

function centerPopupNewTT() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popupNewTT").height();
  var popupWidth = $("#popupNewTT").width();
  
  $("#popupNewTT").css({
    "position": "absolute",
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2
  });
}

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
  var popupHeight = $("#leftPopupTicket").height() + 8;;
  var popupWidth = $("#popupTicket").width();
  
  $("#popupTicket").css({
    "position": "absolute",
    "height": popupHeight,
    "top": windowHeight / 2 - popupHeight / 2,
    "left": windowWidth / 2 - popupWidth / 2, 
    "max-height": windowHeight-20
  });
  
  $("#historyDiv").css({
    "max-height": popupHeight-70,
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
