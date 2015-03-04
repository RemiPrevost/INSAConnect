var form = document.getElementById("form");
var auth_user = document.getElementById("auth_user");
var auth_pass = document.getElementById("auth_pass");
	
auth_user.value = "rprevost";
auth_pass.value = "??REmi05";
if (localStorage['location'] == 1)
	form.action ="https://portail-promologis-lan.insa-toulouse.fr:8001/";
else if (localStorage['location'] == -1)
	form.action="https://portail-invites-lan.insa-toulouse.fr:8001/";
else
	self.close;

var evt = document.createEvent("MouseEvents");
evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
document.getElementById("btn_cnx").dispatchEvent(evt);