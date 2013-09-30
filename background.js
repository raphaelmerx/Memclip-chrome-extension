// Seule la background page peut utiliser les fonctions chrome.*

var pseudo;
var password;

// A l'ouverture de la page popup.js, essayer de récupérer les cookies puis envoyer leur valeur à l'utilisateur
chrome.runtime.onConnect.addListener(function(port) {
	chrome.cookies.get({'url': 'http://memclip.via.ecp.fr/', 'name': 'pseudo'}, function(cookie){
		port.postMessage({'pseudo': cookie.value});
		pseudo = cookie.value;
	});
	chrome.cookies.get({'url': 'http://memclip.via.ecp.fr/', 'name': 'password'}, function(cookie){
		port.postMessage({'password': cookie.value});
		password = cookie.value;
		// Envoi d'une requete au site internet pour recuperer les liens clippés
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "http://memclip.via.ecp.fr/controleur/resultsRequest.php", true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				// JSON.parse does not evaluate the attacker's scripts.
				var resp = JSON.parse(xhr.responseText);
				port.postMessage({'xhrResponse': resp});
			}
		}
		xhr.send('pseudo=' + pseudo + '&password=' + password);
	});
	port.onMessage.addListener(function(message){
		if(message.method == 'authentification') {
			pseudo = message.pseudo;
			password = message.password;

			// Envoi d'une requete au site internet pour voir si bon pseudo/mdp
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "http://memclip.via.ecp.fr/controleur/resultsRequest.php", true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					// JSON.parse does not evaluate the attacker's scripts.
					var resp = JSON.parse(xhr.responseText);
					port.postMessage({'xhrResponse': resp});
					
				}
			}
			xhr.send('pseudo=' + pseudo + '&password=' + password);
		}
	});

});

// Crée les cookies quand on envoie le formulaire, les supprime quand on appuie sur le bouton correspondant
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.method == 'Create cookies') {
		chrome.cookies.set({'url': 'http://memclip.via.ecp.fr/', 'name': 'pseudo', 'value': message.pseudo}, function() {
		});
		chrome.cookies.set({'url': 'http://memclip.via.ecp.fr/', 'name': 'password', 'value': message.password}, function() {
		});
	} else if (message == 'Delete cookies') {
		chrome.cookies.remove({'url': 'http://memclip.via.ecp.fr/', 'name': 'pseudo'});
		chrome.cookies.remove({'url': 'http://memclip.via.ecp.fr/', 'name': 'password'});
	} else if (message.method == 'authentification') {

	};
});