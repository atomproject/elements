var fs = require('fs');
var fetch = require('node-fetch');
var urlRegex = /^https:.*?github.*?\/(\w+)\/(\w+)/;
var baseApiEndPoint = 'https://api.travis-ci.org/repos';
var categories = fs.readFileSync('_data/categories.json', 'utf-8');
var idFilePath = 'element-ids.json'
var elementUrls = [];
var originalLength;

function getJson(url) {
	return fetch(url).then(function(resp) {
		//TODO: will other response status codes do for our task?
		if (resp.status === 200) {
			return resp.json();
		}

		return Promise.reject();
	});
}

categories = JSON.parse(categories);

//flatten element urls
categories.map(function(item) {
	elementUrls = elementUrls.concat(item.elements);
});

originalLength = elementUrls.length;

//check if all the elements are present on github
elementUrls = elementUrls.map(function(el) {
	return el.replace(urlRegex, function(match, owner, name) {
		return baseApiEndPoint + '/' + owner + '/' + name;
	});
}).filter(function(el) {
	return el !== undefined;
});

//if all the elements aren't on github then don't show status
if (elementUrls.length !== originalLength) {
	fs.writeFileSync(idFilePath, '[]');
}

Promise.all(elementUrls.map(function(entityApi) {
	return getJson(entityApi);
})).then(function(results) {
	results = results.map(function(result) {
		return result.id;
	});

	return results;
}).then(function(elementIds) {
	elementIds = JSON.stringify(elementIds);

	fs.writeFileSync(idFilePath, elementIds);
}).catch(function() {
	fs.writeFileSync(idFilePath, '[]');
}).then(function() {
	console.log('Done creating element ids');
});

