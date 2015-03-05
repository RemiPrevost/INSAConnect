var __DEBBUG__ = false; 

/* EXIT WITH FATAL ERROR + INPUT MESSAGE */
function fatalError(message) {
	throw new Error("FATAL ERROR: "+message);
}

function ObjModel() {
	/* ATTRIBUTES : */
	var STATE_undefined;
	var STATE_desactivated;
	var STATE_running;
	var STATE_connected;
	var STATE_location;
	var STATE_registered;
	var STATE_ask_register;
	var STATE_constant_register;
	var STATE_login_failure;
	var mutex;
	
	/* GETTERS */
	
	this.getStateUndefined = function() {
		return this.STATE_undefined;
	}
	
	this.getStateDesactivated = function() {
		return this.STATE_desactivated;
	}
	
	this.getStateRunning = function() {
		return this.STATE_running;
	}
	this.getStateConnected = function() {
		return this.STATE_connected;
	}
	
	this.getStateLocation = function() {
		return this.STATE_location;
	}
	
	this.getStateRegistered = function() {
		return this.STATE_registered;
	}
	
	this.getStateAskRegister = function() {
		return this.STATE_ask_register;
	}
	
	this.getStateConstantRegister = function() {
		return this.STATE_constant_register;
	}
	
	this.getStateLoginFailure = function() {
		return this.STATE_login_failure;
	}
	
	/* SETTERS */
	
	this.setStateUndefined = function(value) {
		if (this.STATE_undefined != value) {
			this.STATE_undefined = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateDesactivated = function(value) {
		if (this.STATE_desactivated != value) {
			this.STATE_desactivated = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateRunning = function(value) {
		if (this.STATE_running != value && !this.STATE_desactivated) {
			this.STATE_running = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateConnected = function(value) {
		if (this.STATE_connected != value && !this.STATE_desactivated) {
			this.STATE_running = false;
			this.STATE_connected = value;
			if (!value)
				console.log("CONNECTION STATE HAS JUST BEEN SET TO FALSE");
			this.fireStateChanged();
		}
	}
	
	this.setStateLocation = function(value) {
		if (this.STATE_location != value) {
			this.STATE_location = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateRegistered = function(value) {
		if (this.STATE_registered != value) {
			this.STATE_registered = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateAskRegister = function(value) {
		if (this.STATE_ask_register != value) {
			this.STATE_ask_register = value;
			this.fireStateChanged();
		}
	}
	
	this.setStateConstantRegister = function(value) {
		if (this.STATE_constant_register != value) {
			this.STATE_constant_register = value;
		}
	}
	
	this.setStateLoginFailure = function(value) {
		if (this.STATE_login_failure != value) {
			this.STATE_login_failure = value;
		}
	}
	
	/* METHODS */
	
	
	this.updateStateRegistered = function() {
		if (typeof localStorage['extensionID'] != "undefined" && localStorage['extensionID'] != "") {
			if (this.STATE_registered != true) {
				this.STATE_registered = true;
				this.fireStateChanged();
			}
			if (this.STATE_constant_register != true) {
				this.STATE_constant_register = true;
				this.fireStateChanged();
			}
		}
		else {
			if (this.STATE_registered != false) {
				this.STATE_registered = false;
				this.fireStateChanged();
			}
			if (this.STATE_constant_register != false) {
				this.STATE_constant_register = false;
				this.fireStateChanged();
			}
		}
	}
	
	/* DESCRIPTION: try to lock the mutex */
	/* PARAMETERS: none                   */
	/* RETURN: true/false    			  */
	this.mutexLock = function() {
		if (__DEBBUG__)
			console.log("***MUTEX*** Lock mutex requested");
		
		if (this.mutex == 0) {
			if (__DEBBUG__)
				console.log("***MUTEX*** locked");
			
			this.mutex = 1;
			
			return true;
		}
		else {
			if (__DEBBUG__)
				console.log("***MUTEX*** Lock mutex rejected");
				
			return false;
			
		}
	}
	
	/* DESCRIPTION: Indicates whether the mutex is free or not */
	/* PARAMETERS: none      					  			   */
	/* RETURN: true/false    					  			   */
	this.isMutexFree = function() {
		if (this.mutex == 0)
			return true;
		else
			return false;
	}
	
	/* DESCRIPTION: Indicates whether the mutex is free or not */
	/* PARAMETERS: none      					  			   */
	/* RETURN: none    					  			           */
	this.mutexLevelUp = function() {
		if (this.mutex <= 0)
			fatalError("***MUTEX*** trying to level up a free mutex");
		
		this.mutex++;
		
		if (__DEBBUG__)
			console.log("***MUTEX*** Mutex leveled up");
	}
	
	/* DESCRIPTION: Free the mutex */
	/* PARAMETERS: none      					  			   */
	/* RETURN: none    					  			           */
	this.mutexFree = function() {
		if (this.mutex > 0) {
			this.mutex--;
			
			if (__DEBBUG__)
				console.log("***MUTEX*** Mutex leveled down");
		}
	}
	
	/* DESCRIPTION: DEBBUG PURPOSE: print the content of the mutex*/
	/* PARAMETERS: none      					  			      */
	/* RETURN: none    					  			              */
	this.printMutexLevel = function() {
		console.log("***MUTEX*** level: "+this.mutex);
	}
	
	
	this.fireStateChanged = function() {
		var temp = this.STATE_desactivated;
		
		localStorage['model'] = JSON.stringify(model);
		chrome.runtime.sendMessage({greeting: "hello"});
		this.STATE_desactivated = temp;
		printIcon();
	}
	
	/* CONSTRUCTOR */
	
	this.STATE_undefined = true;
	this.STATE_desactivated = false;
	this.STATE_running = true;
	this.STATE_ask_register = false;
	this.STATE_login_failure = false;
	this.mutex = 0;
}

localStorage['temp'] = "";

var model = new ObjModel();
model.updateStateRegistered();
localStorage['model'] = JSON.stringify(model);

var tab_connect_id = -1;

function connect() {
	if (__DEBBUG__)
		console.log("Starting function connect");
	
	if (model.getStateLocation() == 0)
		return -1;

	
	chrome.tabs.create({url:"connect.html",active:false}, function(tab){
		tab_connect_id = tab.id;
	});
	
	if (__DEBBUG__)
		console.log("Ending function connect");
}



var location_done = false;
var connected_done = false;

function launchAnalyse() {
	var callBack = checkConnectionAttempt;
	
	if (__DEBBUG__)
		console.log("Starting function launchAnalyse");
	
	if (location_done && connected_done) {
		location_done = false;
		connected_done = false;
		if (!model.getStateConnected() && model.getStateLocation() != 0) {
			if (!model.getStateRegistered()) {
				model.setStateAskRegister(true);
			
			} else {
				model.setStateAskRegister(false);
				model.setStateRunning(true);
				connect();
				setTimeout(function() {
					updateConnectionState(checkConnectionAttempt);
				},1000);
			}
		}
		else
			model.mutexFree();
		
		model.updateStateRegistered();
	}
	
	if (__DEBBUG__)
		console.log("Ending function launchAnalyse");
}

function checkConnectionAttempt() {
	if (model.getStateConnected() == false) {
		model.setStateRunning(false);
		setTimeout(function() {
			model.mutexFree();
		},5000);
	}
	else
		model.mutexFree();
}

/* DESCRIPTION: Checks the internet connectivity and changes the STATE_connected */
/*              consequently. Call fireStateChanged when necessary.              */
/* PARAMETERS: none      					  			                         */
/* RETURN: none    					  			                                 */
function updateConnectionState(callBack) {
	var callback_function;
	
	if (__DEBBUG__)
		console.log("Starting function updateConnectionState");
	
	if (typeof callBack == "undefined")
		callback_function = launchAnalyse;
	else
		callback_function = callBack;

	var xhr = new XMLHttpRequest();
	var file = "https://www.facebook.com";
		
	xhr.ontimeout = function() {
		if (model.getStateConnected || model.getStateUndefined) {
			model.setStateConnected(false);
			
			if (__DEBBUG__)
				console.log("ENTERED IN TIMEOUT");
		}
		connected_done = true;
		callback_function();
	}
	
	xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
			
		if (__DEBBUG__)
			console.log("Starting analysing Connection attempt");

		if (xhr.status >= 200 && xhr.status < 304) {
			if (!model.getStateConnected  || model.getStateUndefined) {
				model.setStateConnected(true);
				if (__DEBBUG__)
					console.log("ENTERED IN CONNECTED");
			}

			} else {
				if (model.getStateConnected() || model.getStateUndefined()) {
					model.setStateConnected(false);
					if (__DEBBUG__)
						console.log("ENTERED IN NOT CONNECTED");
				}
			}
			
			connected_done = true;
			callback_function();
				
			if (__DEBBUG__)
				console.log("Ending connection attempt analysis");
		}
	}
		 
	xhr.open('HEAD', file, true);
	xhr.timeout = 4000;
		
	try {
		xhr.send();
			
		if (__DEBBUG__)
			console.log("Ending function updateConnectionState");
			
	} catch(e) {
		if (__DEBBUG__)
			console.log("ENTERED IN CATCH");
			
		if (model.getStateConnected() || model.getStateUndefined()) {
			model.setStateConnected(false);
		}
		
		connected_done = true;
		callback_function();
			
		if (__DEBBUG__)
			console.log("Ending function updateConnectionState");
			
	}
}

var is_at_insa = -1;
var is_at_promolo= -1;

/* DESCRIPTION: Determines the location of the connection and change     */
/*              the STATE_connected consequently. Call fireStateChanged  */
/*              when necessary.										     */
/* PARAMETERS: none      					  			                 */
/* RETURN: none  														 */
function updateLocationState() {
	if (__DEBBUG__)
		console.log("Starting function updateLocationState");
	
	checkLocationAt(0);
	checkLocationAt(1);
	
	if (__DEBBUG__)
		console.log("Ending function updateLocationState");
}

/* DESCRIPTION: Called when the location of INSA or Promolo has been      */
/*              determined. Changes STATE_LOCATION when the two positions */
/*				have been determined									  */
/* PARAMETERS: none      					  			                  */
/* RETURN: none  														  */
function receivedLocation() {
	if (__DEBBUG__)
		console.log("Starting function receivedLocation");
	
	if (is_at_insa != -1 && is_at_promolo != -1) {
		if (is_at_insa == 1)
			model.setStateLocation(-1);
		else if (is_at_promolo == 1)
			model.setStateLocation(1);
		else
			model.setStateLocation(0);
		
		location_done = true;
		launchAnalyse();
		is_at_insa = -1;
		is_at_promolo= -1;
	}
	
	if (__DEBBUG__)
		console.log("Ending function receivedLocation");
}

/* DESCRIPTION: Called to check whether the position is at INSA or not     */
/*              OR whether the position is at PROMOLO or not. Once it's    */
/*				been determined, the receivedLocation() function is called */
/*				to summarise the location                                  */
/* PARAMETERS: location (0: Promolo, else: INSA)      					   */
/* RETURN: none  														   */
function checkLocationAt(location) {
	var xhr = new XMLHttpRequest();
	var url_insa = "https://portail-invites-lan.insa-toulouse.fr:8001/";
	var url_promolo = "https://portail-promologis-lan.insa-toulouse.fr:8001/";
	
	if (__DEBBUG__)
		console.log("Starting function checkLocationAt");
	
	if (location == 0) 
		xhr.url = url_promolo;
	else 
		xhr.url = url_insa;
	
	xhr.ontimeout = function() {	
		if (__DEBBUG__)
			console.log("ENTERED IN TIMEOUT");
		
		if (xhr.url == url_insa) {
			is_at_insa = 0;
			receivedLocation();
		}
		else if (xhr.url == url_promolo) {
			is_at_promolo = 0;
			receivedLocation();
		}
	};
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
				
			if (__DEBBUG__)
				console.log("Starting analysing Location attempt");

			if (xhr.status >= 200 && xhr.status < 304) {
				if (xhr.url == url_insa) {
					is_at_insa = 1;
					receivedLocation();
				}
				else if (xhr.url == url_promolo) {
					is_at_promolo = 1;
					receivedLocation();	
				}
			}
			else {
				if (xhr.url == url_insa) {
					is_at_insa = 0;
					receivedLocation();
				}
				else if (xhr.url == url_promolo) {
					is_at_promolo = 0;
					receivedLocation();
				}
			}
		}
	};
	
	xhr.open('HEAD', xhr.url, true);
	xhr.timeout = 4000;
	
	try {
        xhr.send();
		
	if (__DEBBUG__)
		console.log("Ending function checkLocationAt");
		
	} catch (e) {
		if (xhr.url == url_insa) {
			is_at_insa = 0;
			receivedLocation();
		}
		else if (xhr.url == url_promolo) {
			is_at_promolo = 0;
			receivedLocation();
		}
	
		if (__DEBBUG__)
			console.log("Ending function checkLocationAt");
	}
}

function printIcon() {
	if (model.getStateDesactivated())
		chrome.browserAction.setIcon({path:"img/icon_desactivated19.png"});
	else if (model.getStateAskRegister())
		chrome.browserAction.setIcon({path:"img/icon_ask_register19.png"});
	else if (model.getStateRunning())
		chrome.browserAction.setIcon({path:"img/icon_running19.png"});
	else if (model.getStateConnected())
		chrome.browserAction.setIcon({path:"img/icon_approved19.png"});
	else
		chrome.browserAction.setIcon({path:"img/icon_denied19.png"});
}

function blockController() {
	if(__DEBBUG__)
		console.log("Starting function blockController");
	
	if (model.getStateDesactivated()) {
		if (model.mutexLock()) {
			if(__DEBBUG__)
				console.log("Controller blocked by starving");
			
			model.setStateDesactivated(true);
			model.setStateRunning(true);
		} else {
			if (__DEBBUG__)
				console.log("Controller working, will try blocking again the controller in a few milliseconds");
			setTimeout(blockController,1000);
		}
	}
}

function stateChanged(request, sender, sendResponse) {
	
	if (sender.url.indexOf("popup") > -1) {	
		if (request.greeting == "switch_desactivated_state") {
			if (!model.getStateDesactivated()) {
				model.setStateDesactivated(true);
				blockController();
			}
			else {
				model.setStateDesactivated(false);
				model.mutexFree();
			}
		}
		else if (request.greeting == "temp_registered") {
			if (model.getStateAskRegister) {
				model.mutexFree();
				model.setStateAskRegister(false);
				model.setStateRegistered(true);
				model.setStateConstantRegister(false);
			}
		}
		else if (request.greeting == "registered") {
			if (model.getStateAskRegister && model.getStateRegistered) {
				model.mutexFree();
				model.setStateAskRegister(false);
				model.setStateRegistered(true);
				model.setStateConstantRegister(true);
			}
		}
	}
	else {
		if (request.greeting == "login_success") {
			//if (__DEBBUG__)
				console.log("message login_success received");
			
			chrome.tabs.remove(tab_connect_id,function(tab){});
			tab_connect_id = -1;
			model.setStateLoginFailure(false);
		}
		else if (request.greeting == "login_failure") {
			//if (__DEBBUG__)
				console.log("message login_failure received");
			
			chrome.tabs.remove(tab_connect_id,function(tab){});
			tab_connect_id = -1;
			localStorage['extensionID'] = "";
			model.updateStateRegistered();
			model.setStateLoginFailure(true);
		}
	}
}

function controller () {
	if (__DEBBUG__)
		console.log("Starting function controller");
	
	if (!model.getStateDesactivated()) {
		if (model.mutexLock()) {
			updateConnectionState();
			updateLocationState();
		}
	}
	
	if (__DEBBUG__)
		console.log("Ending function controller");
}

/*******************************/
/*            MAIN             */
/*******************************/

printIcon();
chrome.runtime.onMessage.addListener(stateChanged);
setInterval(controller,2000);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab_connect_id != -1 && tabId == tab_connect_id) {
		
		if(changeInfo.status == "complete" && !(tab.url.indexOf("chrome-extension") > -1) && !(tab.title.indexOf("edirecting") > -1)) {
			
			if (__DEBBUG__)
				console.log("chrome.tabs.onUpdated.addListener : connect.html finished loading, will inject javascript");
			
			details = {
				file:"checkInvalidIds.js",
				runAt:"document_end"
			};
			
			chrome.tabs.executeScript(tab.id,details);
		}
	}
});