var __DEBBUG__ = false;

var model = new ObjModel();

function ObjModel() {
	/* ATTRIBUTES : */
	var STATE_desactivated = false;
	var STATE_retry = false;
	var STATE_running = true;
	var STATE_connected;
	var STATE_location;
	var mutex = 0;
	
	if (!mutexLock())
		die("FATAL ERROR: intialization of ObjModel failed due to unavailable mutex");
	
	fireStateChanged();
	
	/* METHODS */
	
	/* DESCRIPTION: try to lock the mutex */
	/* PARAMETERS: none                   */
	/* RETURN: true/false    			  */
	this.mutexLock = function() {
		if (mutex == 0) {
			mutex = 1;
			return true;
		}
		else
			return false;
	}
	
	/* DESCRIPTION: Indicates whether the mutex is free or not */
	/* PARAMETERS: none      					  			   */
	/* RETURN: true/false    					  			   */
	this.isMutexFree = function() {
		if (mutex == 0)
			return true;
		else
			return false;
	}
	
	/* DESCRIPTION: Indicates whether the mutex is free or not */
	/* PARAMETERS: none      					  			   */
	/* RETURN: true/false    					  			   */
	this.mutexLevelUp = function() {
		if (mutex <= 0)
			die("FATAL ERROR: trying to level up a free mutex")
	
		mutex++;
	}
	
	/* DESCRIPTION: Indicates whether the mutex is free or not */
	/* PARAMETERS: none      					  			   */
	/* RETURN: true/false    					  			   */
	this.mutexLevelDown = function() {
		if (mutex > 0)
			mutex--;
	}
}

function initVar() {
	localStorage['connected'] = -1;
	localStorage['location'] = 0;
	localStorage['running'] = 0;
	localStorage['desactivated'] = 0;
}

function fireStateChanged() {
	chrome.runtime.sendMessage({greeting: "hello"});
}

function connect() {
	var html;
	
	if (__DEBBUG__)
		console.log("Starting function connect");
	
	if (localStorage['location'] == 0)
		return -1;
	
	chrome.tabs.create({url:"connect.html",active:false},function(tab){
		setTimeout(function(){
			if (tab != null)
				chrome.tabs.remove(tab.id);
		},1000);
	});
	
	if (__DEBBUG__)
		console.log("Ending function connect");
}

var waiting_for_result = false;

function isAt(location) {
	var xhr = new XMLHttpRequest();
	var file = "https://portail-invites-lan.insa-toulouse.fr:8001/";
	
	if (__DEBBUG__)
		console.log("Starting function isAt");
	
	if (location == 0)
		file = "https://portail-invites-lan.insa-toulouse.fr:8001/";
	else
		file = "https://portail-promologis-lan.insa-toulouse.fr:8001/";
	
	xhr.open('HEAD', file, false);
	
	try {
        xhr.send();
		
		if (xhr.status >= 200 && xhr.status < 304) {
			if (__DEBBUG__) {
				if (location == 0)
					console.log("location is INSA");
				else
					console.log("location is Promolo");
				
				console.log("Ending function isAt");
			}
			
			return true;
		}
		else {
			if (__DEBBUG__) {
				if (location == 0)
					console.log("location is NOT INSA");
				else
					console.log("location is NOT Promolo");
				
				console.log("Ending function isAt");
			}
			
			return false;
		}
	} catch (e) {	
		if (__DEBBUG__) {
			if (location == 0)
				console.log("location is NOT INSA");
			else
				console.log("location is NOT Promolo");
				
			console.log("Ending function isAt");
		}
		
		return false;
	}
}


function getLocation() {
	if (__DEBBUG__)
		console.log("Starting function getLocation");
	
	if (isAt(1)) {
		if (localStorage['location'] != 1) {
			if (__DEBBUG__)
				console.log("LOCATION IS PROMOLOGIS");
			
			localStorage['location'] = 1;
			fireStateChanged();
		}
			
		if (__DEBBUG__)
			console.log("Ending function getLocation");
			
		return 1;	
	} 
	else if (isAt(0)) {
		if (localStorage['location'] != -1) {
			if (__DEBBUG__)
				console.log("LOCATION IS INSA");
			
			localStorage['location'] = -1;
			fireStateChanged();
		}
			
		if (__DEBBUG__)
			console.log("Ending function getLocation");
			
		return -1;
	}
    else {
		if (localStorage['location'] != 0) {
			if (__DEBBUG__)
				console.log("LOCATION IS UNKNOWN");
			
			localStorage['location'] = 0;
			fireStateChanged();
		}
		
		if (__DEBBUG__)
			console.log("Ending function getLocation");
		
		return 0;
	}
}

function analyseConnectionAttempt(xhr) {
	if (__DEBBUG__)
		console.log("Starting function analyseConnectionAttempt");
	
	if (xhr.status >= 200 && xhr.status < 304) {
		if (localStorage['connected'] != 1) {
			chrome.browserAction.setIcon({path:"img/icon_approved19.png"});
			localStorage['running'] = 0;
			if (__DEBBUG__)
				console.log("ENTERED IN CONNECTED");
			localStorage['connected'] = 1;
			fireStateChanged();
		}
		if (__DEBBUG__)
			console.log("Ending function analyseConnectionAttempt");
			
		return true;
    } else {
		if (localStorage['connected'] != 0) {
			chrome.browserAction.setIcon({path:"img/icon_denied19.png"});
			localStorage['running'] = 0;
			if (__DEBBUG__)
				console.log("ENTERED IN NOT CONNECTED");
			localStorage['connected'] = 0;
			fireStateChanged();
		}
		if (__DEBBUG__)
			console.log("Ending function analyseConnectionAttempt");
			
		return false;
    }
}

function updateConnectionState() {
	
	if (__DEBBUG__)
		console.log("Starting function updateConnectionState");
	
	var xhr = new XMLHttpRequest();
    var file = "https://www.facebook.com";
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			returned_value = analyseConnectionAttempt(xhr);
			waiting_for_result = false;
		}
	}
     
    xhr.open('HEAD', file, true);
	xhr.timeout = 3000;
	xhr.ontimeout = function() {waiting_for_result = false;};
	
	try {
		waiting_for_result = true;
		xhr.send();
		
		if (__DEBBUG__)
			console.log("Ending function updateConnectionState");
		
	} catch(e) {
		if (__DEBBUG__)
			console.log("ENTERED IN CATCH");
		
		if (localStorage['connected'] != 0) {
			chrome.browserAction.setIcon({path:"img/icon_denied19.png"});
			localStorage['connected'] = 0;
			fireStateChanged();
		}
		
		waiting_for_result = false;
		
		if (__DEBBUG__)
			console.log("Ending function updateConnectionState");
		
	}
}

var delay_after_failure = false;
var already_desactivated = false;

function updater() {
	if (__DEBBUG__)
		console.log("Starting function updater");
	
	if (localStorage['desactivated'] == 1) {
		localStorage['connected'] = -1;
		if (!already_desactivated) {
			already_desactivated = true;
			chrome.browserAction.setIcon({path:"img/icon_desactivated19.png"});
			localStorage['location'] = 0;
			localStorage['running'] = 0;
		}
	} 
	else if(!waiting_for_result && !delay_after_failure) {
		getLocation();
		updateConnectionState();
		if(localStorage["connected"] == 0 && localStorage["location"] != 0) {
			chrome.browserAction.setIcon({path:"img/icon_running19.png"});
			localStorage['running'] = 1;
			fireStateChanged();
			
			if (localStorage["location"] == 1 && __DEBBUG__)
				console.log("Not Connected and at Promolo detected");
			else if (__DEBBUG__)
				console.log("Not Connected and at Insa detected");


			connect();
			if (localStorage["connected"] == 0) {
				if (__DEBBUG__)
					console.log("Failed to connect");
					
				delay_after_failure = true;
				setTimeout(function(){
					delay_after_failure = false;
					
					if (__DEBBUG__)
						console.log("finished waiting, will retry");
					
					},10000);
			}
		}
	}
}

function simpleCheckUp() {
	console.log("is at insa? ");
	console.log(isAt(0));
	console.log("is at promolo? ");
	console.log(isAt(1));
	updateConnectionState();
	console.log("Wait few seconds");
	setTimeout(function(){
		console.log("is connected? ");
		console.log(localStorage['connected']);
	},2000)
}

/*******************************/
/*            MAIN             */
/*******************************/

initVar();
setInterval(updater,2000);
