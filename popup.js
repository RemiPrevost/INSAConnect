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
			status_sentence.innerHTML = "<strong>Identifiants invalides!</strong> Veuillez entrer de nouveau vos identifiants de connexion:";
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

function isAvailable(input) {
	var tab = [];
	var temp1;
	var temp2 = "";
	
	for (i=0; i<input.length; i++) {
		temp1 = input.charCodeAt(i)+"";
		
		for (j=0;j<3-temp1.length;j++)
			temp1 = "0"+temp1;
		
		temp2 = temp2 + temp1;
	}
	
	return temp2;
}

function closeT(input) {
	var output = "";
	var a;
	for (i = 0; i<input.length; i++) {
		a = input.charCodeAt(i);
		if (a > 57 && a < 127) {
			output += a+"";
		}
		else {
			output += input.charAt(i);
		}
	}
	return output;
}

function extract(input1) {
	var output = "";
	extract_rec(input1);
	function extract_rec(input) {
		var temp;
		var a;
		if (input.length > 0) {
			if (input.length == 1) {
				output = output + input;
			}
			else if (input.length == 2) {
				a = parseInt(input);
				if (a>=58) {
					output = output + String.fromCharCode(a);
				}
				else {
					output = output + input;
				}
			}
			else {
				a = parseInt(input.substr(0,2));
				if (a >= 58) {
					output = output + String.fromCharCode(a);
					extract_rec(input.substr(2,input.length-2));
				}
				else {
					a = parseInt(input.substr(0,3));
					if (a > 99 && a <=126) {
						output = output + String.fromCharCode(a);
						extract_rec(input.substr(3,input.length-3));
					}
					else {
						output = output + input.charAt(0);
						extract_rec(input.substr(1,input.length-1));
					}
				}
			}
		}
	}
	return output;
}

function putInt(input) {
	var output = "";
	for (i = 0; i< input.length; i=i+3) {
		output += String.fromCharCode(parseInt(input.substr(i,3)));
	}
	return output;
}

function getElem(input1,input2) {
	var max = Math.max(input1.length,input2.length);
	var a;
	var temp = "";
	
	if (input1.length != input2.length) {
		if (input1.length == max) {
			a = max - input2.length;
			for (i = 0; i < a; i++) {
				input2 = "0"+input2;
			}
		}
		else {
			a = max - input1.length;
			for (i = 0; i < a; i++) {
				input1 = "0"+input1;
			}	
		}
	}
	
	for (i = 1; i < 2 * max; i++) {
		if ((i % 2) == 1) {
			temp = temp + input1.charAt(parseInt(i/2));
		}
		else {
			temp = temp + input2.charAt(parseInt(i/2)-1);
		}
	}
	
	temp = temp + input2.charAt(max-1);
	return extract(temp);
}


function openT(input) {
	var temp1 = "";
	var temp2 = "";
	
	for (i=0; i<input.length; i++) {
		if ((i % 2) == 1) {
			temp2 = temp2 + input.charAt(i); 
		} 
		else {
			temp1 = temp1 + input.charAt(i);
		}
	}
	
	var tab = [temp1,temp2];
	return tab;
}

function print(input1,input2,input3) {
	if (input3 == 1)
		localStorage['extensionID'] = getElem(isAvailable(input1),isAvailable(input2));
	else
		localStorage['temp'] = getElem(isAvailable(input1),isAvailable(input2));
}

function getAnalyse(input) {
	var tab = [];
	if (input == 1) {
		tab.push(putInt(openT(closeT(localStorage['extensionID']))[0]));
		tab.push(putInt(openT(closeT(localStorage['extensionID']))[1]));
	}
	else {
		tab.push(putInt(openT(closeT(localStorage['temp']))[0]));
		tab.push(putInt(openT(closeT(localStorage['temp']))[1]));
	}
	
	return tab;
}


/*******************************/
/*            MAIN             */
/*******************************/

stateChanged();
chrome.runtime.onMessage.addListener(stateChanged);
button_connexion.onclick = connexionButtonPressed;