// Connection avec la background page
var port = chrome.runtime.connect();

port.onMessage.addListener(function(message){
	// Si on a une reponse xhr, c'est que l'authentification a marché
	if (message.xhrResponse) {
		window.location = "popup.html";
	}
})

// Sinon, demander à la b. page de créer les cookies quand on appuie sur le bouton
document.addEventListener('DOMContentLoaded', function() {
	var saveIDButton = document.getElementById('saveIDButton');
	// Quand on clique sur le bouton "Envoyer", dire à la page background.js de créer les cookies
	saveIDButton.addEventListener('click', function() {
		var pseudo = document.getElementById('pseudo').value;
		var password = document.getElementById('password').value;
		// demander à la background page si pseudo et mot de passe sont bons
		port.postMessage({'method': 'authentification', 'pseudo': pseudo, 'password': password});
		// Lui demander de fixer les cookies, même si les identifiants sont mauvais
		chrome.runtime.sendMessage({'method': 'Create cookies', 'pseudo': pseudo, 'password': password});
		window.setTimeout (function () {
			var errorPara = document.getElementById('wrongPass')
			errorPara.innerHTML = "Mauvaise combinaison pseudo / mot de passe"
		}, 500);
	});
});