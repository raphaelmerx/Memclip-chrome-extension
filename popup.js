// On remplit le champ 'url' par l'url de l'onglet actif
chrome.tabs.getSelected(null, function(tab) {
	document.getElementById('url').value = tab.url;
	document.getElementById('title').value = tab.title;
});

// Connection avec la background page
var port = chrome.runtime.connect();

//Si le contenu de la page a été chargé
document.addEventListener('DOMContentLoaded', function() {
	var sendButton = document.getElementById('send');
	// Quand on clique sur le bouton "Envoyer", dire à la page background.js de créer les cookies
	sendButton.addEventListener('click', function() {
		var pseudo = document.getElementById('pseudo').value;
		var password = document.getElementById('password').value;
		chrome.runtime.sendMessage({'method': 'Create cookies', 'pseudo': pseudo, 'password': password});
		// Puis ouvrir la page des résultats dans un nouvel onglet
		chrome.tabs.create({'url': 'http://memclip.via.ecp.fr/controleur/results.php?pseudo=' + pseudo});
	});
	// Bouton de suppression des cookies
	var cookieButton = document.getElementById('cookieButton');
	cookieButton.addEventListener('click', function() {
		// Demander à la background page de supprimer les cookies
		chrome.runtime.sendMessage('Delete cookies');
		// Puis rétablir les champs pseudo et password
		document.getElementById('pseudoParagraphe').innerHTML = "<input type='text' name='pseudo' id='pseudo' placeholder='Votre pseudo' maxlength='30' required/>";
		document.getElementById('passwordParagraphe').innerHTML = "<input type='password' name='password' id='password' placeholder='Password' maxlength='30' required/>";
	});
});

// A la réception des infos qui proviennent de la background page
port.onMessage.addListener(function(message){
	// Si on reçoit le pseudo, cacher le champ pseudo et marquer que l'utilisateur est connecté
	if (message.pseudo) {
		var pseudo = document.getElementById('pseudo');
		pseudo.value = message.pseudo;
		pseudo.setAttribute('type','hidden');
		document.getElementById('pseudoParagraphe').innerHTML += "Pass & username for <b>" + message.pseudo + "</b> saved";
	};
	// Idem pour le password
	if (message.password) {
		var password = document.getElementById('password')
		password.value = message.password;
		password.setAttribute('type','hidden');
	};
	if (message.xhrResponse) {
		// Si on a reçu la liste des liens clippés, on appelle la fonction CreateList
		var resp = message.xhrResponse;
		createList(resp);
	};
})

// Fonction appelée quand on reçoit la liste des liens clippés, qui crée la liste des liens
function createList(results) {
	var linkPara = document.createElement('p');
	linkPara.id='link';
	linkPara.innerHTML += '<label for="link">Lier avec quels autres liens ?</label><br />';
	// On crée le champ select
	var select = document.createElement('select');
	select.setAttribute("name", "link_0");
	select.setAttribute("id", "link_0");
	select.setAttribute("style", "max-width: 200px;")
	// On lui ajoute la première option (vide)
	var option = document.createElement('option');
	option.setAttribute('value','');
	option.innerHTML = 'Choisir un de mes clips';
	select.appendChild(option);
		for (var i = 0; i < results.length; i++) {
			// Puis les autres options qui corresondent à des liens clippés
			var option = document.createElement('option');
			option.setAttribute('value',results[i]._id);
			option.innerHTML = results[i].title;
			select.appendChild(option);
		};
	linkPara.appendChild(select);
	// On insère ce paragraphe dans le formulaire, avant le bouton Envoyer
	var form = document.getElementById('addEntry');
	form.insertBefore(linkPara, document.getElementById('send'));
}
