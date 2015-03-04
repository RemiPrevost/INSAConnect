var status_sentence = document.getElementById("status_sentence");
var HRs = document.getElementsByTagName('hr');

var desactivated = false;

var color_orange = "#ed7d31";
var color_green = "#00b050";
var color_red = "#fa0000";
var color_grey = "#8c8c8c";


function changeColor(color_code) {
	var strongs = document.getElementsByTagName("strong");
	
	for (var i = 0; i < HRs.length; i++) {
		HRs[i].style.color = color_code;
		HRs[i].style.backgroundColor = color_code;
	}
	
	for (var i = 0; i < strongs.length; i++) {
		strongs[i].style.color = color_code;
	}
}

function stateChanged(request, sender, sendResponse) {
	var status_sentence = document.getElementById("status_sentence");
	
	console.log("TEST!!!!!!!!!!");
	
	var running = JSON.parse(localStorage['model']).STATE_running;
	var connected = JSON.parse(localStorage['model']).STATE_connected;
	var location = JSON.parse(localStorage['model']).STATE_location;
	var desactivated = JSON.parse(localStorage['model']).STATE_desactivated;
	var color_code;
	
	if (desactivated == 1) {
		status_sentence.innerHTML = "La connexion automatique est <strong>désactivée</strong>";
		color_code = color_grey;
	}
	else if (running == 1) {
		status_sentence.innerHTML = "Attendons que la connexion soit établie, cela ne devait pas être long.";
		color_code = color_orange;
	}
	else if (connected == 1) {
		color_code = color_green;
		if (location == 1)
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via le réseau Promologis de l'INSA";
		else if (location == -1)
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via le réseau WIFI InviteINSA";
		else
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via un réseau hors INSA";
	}
	else {
		status_sentence.innerHTML = "Oups... Maleureux <strong>échec</strong> de la tentative de connection à internet...";
		color_code = color_red;
	}
		
	changeColor(color_code);
}

var desactivation_field = document.getElementById("desactivation_field");
desactivation_field.onclick = onclickDesactivateField;

function onclickDesactivateField() {
	
	if (!desactivated) {
		desactivated = 1;
		chrome.browserAction.setIcon({path:"img/icon_desactivated19.png"});
		desactivation_field.innerHTML = "Tu peux reprendre les choses en main";
		chrome.runtime.sendMessage({greeting: "desactivated"});
	}
	else {
		desactivated = 0;
		desactivation_field.innerHTML = "Laissez moi gérer ma connexion";
		chrome.runtime.sendMessage({greeting: "activated"});
	}
	stateChanged();
}

/*******************************/
/*            MAIN             */
/*******************************/

stateChanged();
chrome.runtime.onMessage.addListener(stateChanged);