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
