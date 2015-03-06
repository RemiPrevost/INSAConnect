var form = document.getElementById("form");
var auth_user = document.getElementById("auth_user");
var auth_pass = document.getElementById("auth_pass");

if (typeof localStorage['model'] != "undefined") {
	if (JSON.parse(localStorage['model']).STATE_location == 1)
		form.action ="https://portail-promologis-lan.insa-toulouse.fr:8001/";
	else if (JSON.parse(localStorage['model']).STATE_location == -1)
		form.action="https://portail-invites-lan.insa-toulouse.fr:8001/";
	else
		self.close();
}
else
	self.close();

if (JSON.parse(localStorage['model']).STATE_constant_register) {
	if (localStorage['extensionID'] != "") {
		auth_user.value = getAnalyse(1)[0];
		auth_pass.value = getAnalyse(1)[1];
	} else
		self.close();
} else {
	if (localStorage['temp'] != "") {
		auth_user.value = getAnalyse(0)[0];
		auth_pass.value = getAnalyse(0)[1];
	} else
		self.close();
}

localStorage['temp'] = "";

var evt = document.createEvent("MouseEvents");
evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
document.getElementById("btn_cnx").dispatchEvent(evt);

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
