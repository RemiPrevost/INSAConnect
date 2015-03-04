var balises_center = document.getElementsByTagName("center");
var i = 0;
var found = false;

while (i < balises_center.length && !found) {
	if (balises_center[i].innerText.indexOf("erreur") > 1) {
		found = true;
	} else {
		i++;
	}
}
if (found) {
	chrome.runtime.sendMessage({greeting: "login_failure"});
}
else {
	chrome.runtime.sendMessage({greeting: "login_success"});
}
	

