var status_sentence = document.getElementById("status_sentence");
var HRs = document.getElementsByTagName('hr');
var section_formulaire = document.getElementById("section_formulaire");
var button_connexion = document.getElementById("btn_cnx");
var desactivation_field = document.getElementById("desactivation_field");
var erase_data_field = document.getElementById("erase_data");
var read_charte_field =  document.getElementById("read_charte");
var link_charte = document.getElementById("link_charte");

var color_orange = "#ed7d31";
var color_green = "#00b050";
var color_red = "#fa0000";
var color_grey = "#8c8c8c";
var color_black = "#000000";
var color_blue = "#5c9edb";

desactivation_field.onclick = onclickDesactivateField;
erase_data_field.onclick = onclickEraseData;
read_charte_field.onclick = onclickReadChart;
link_charte.onclick = onclickReadChart;



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
	
	var running = JSON.parse(localStorage['model']).STATE_running;
	var connected = JSON.parse(localStorage['model']).STATE_connected;
	var location = JSON.parse(localStorage['model']).STATE_location;
	var desactivated = JSON.parse(localStorage['model']).STATE_desactivated;
	var ask_register = JSON.parse(localStorage['model']).STATE_ask_register;
	var registered = JSON.parse(localStorage['model']).STATE_registered;
	var login_failure = JSON.parse(localStorage['model']).STATE_login_failure;
	
	var color_code;
	
	if (desactivated == 1) {
		status_sentence.innerHTML = "La connexion automatique est <strong>désactivée</strong>";
		color_code = color_grey;
		section_formulaire.style.display = "none";
	}
	else if (ask_register) {
		section_formulaire.style.display = "";
		if (login_failure) {
			status_sentence.innerHTML = "<strong>Identifiants invalides</strong>! Veuillez entrer de nouveau vos identifiants de connexion:";
			color_code = color_red;
		} else {
			status_sentence.innerHTML = "Veuillez entrer vos identifiants de connexion :";
			color_code = color_black;
		}
	}
	else if (running == 1) {
		status_sentence.innerHTML = "Attendons que la connexion soit établie, cela ne devait pas être long.";
		color_code = color_orange;
		section_formulaire.style.display = "none";
	}
	else if (connected == 1) {
		color_code = color_green;
		if (location == 1)
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via le réseau Promologis de l'INSA";
		else if (location == -1)
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via le réseau WIFI InviteINSA";
		else
			status_sentence.innerHTML = "Yes! <strong>Connexion internet établie</strong> via un réseau hors INSA";
	
		section_formulaire.style.display = "none";
	}
	else {
		status_sentence.innerHTML = "Oups... Maleureux <strong>échec</strong> de la tentative de connection à internet...";
		color_code = color_red;
		section_formulaire.style.display = "none";
	}
	
	if (registered && !running) {
		erase_data_field.style.display = "";
	}else {
		erase_data_field.style.display = "none";
	}	

	changeColor(color_code);
}

function onclickEraseData() {
	localStorage['extensionID'] = "";
}

var desactivated = false;

function onclickDesactivateField() {
	if (!desactivated) {
		desactivated = 1;
		chrome.browserAction.setIcon({path:"img/icon_desactivated19.png"});
		desactivation_field.innerHTML = "Tu peux reprendre les choses en main";
		chrome.runtime.sendMessage({greeting: "switch_desactivated_state"});
	}
	else {
		desactivated = 0;
		desactivation_field.innerHTML = "Laissez moi gérer ma connexion";
		chrome.runtime.sendMessage({greeting: "switch_desactivated_state"});
	}
	stateChanged();
}

function onclickReadChart() {
	chrome.tabs.create({url:"charte.html"},function(tab){
		tab.active = true;
	});
}

function connexionButtonPressed() {
	var field_id = document.getElementById("pseudo");
	var field_pass = document.getElementById("pass");
	var message_error = document.getElementById("wanning_error");
	var checkBox = document.getElementById("memorize");
	
	console.log("Button pressed");
	if (field_id.value == "") {
		message_error.innerHTML = "Veuillez renseigner le champ Identifiant";
	}
	else if (field_pass.value == "") {
		message_error.innerHTML = "Veuillez renseigner le champ Mot de passe";
	}
	else {
		message_error.innerHTML = "";
		if (checkBox.checked == true) {
			print(field_id.value,field_pass.value,1);
			chrome.runtime.sendMessage({greeting: "registered"});
		} else {
			print(field_id.value,field_pass.value,0);
			chrome.runtime.sendMessage({greeting: "temp_registered"});
		}
	}
}


/*******************************/
/*            MAIN             */
/*******************************/

stateChanged();
chrome.runtime.onMessage.addListener(stateChanged);
button_connexion.onclick = connexionButtonPressed;