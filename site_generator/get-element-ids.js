var fs = require('fs');
var nodeFetch = require('node-fetch');
var baseApiEndPoint = 'https://api.travis-ci.org/repos';
var getConfig = require('./config').getConfig;
var idFilePath = '_site/element-ids.json';


function handleError(err) {
  console.log(err.stack || err);
  process.exit(1);
}

function getJson(url) {
	return nodeFetch(url).then(function(resp) {
		//TODO: will other response status codes do for our task?
		if (resp.status === 200) {
			return resp.json();
		}

		return Promise.reject();
	});
}

getConfig().then(config => {
	var elementUrls;

	elementUrls = config.elements
		.filter(el => el.name !== 'demo-tester')
		.map(el => {
			return baseApiEndPoint +
				'/' + el.location.githubUser +
				'/' + el.location.githubRepo;
		});

	Promise.all(elementUrls.map(function(entityApi) {
		if (entityApi) {
			return getJson(entityApi);
		}

		return Promise.resolve({});
	})).then(function(results) {
		results = results.map(function(result) {
			return result.id;
		});

		return results;
	}).catch(function() {
		//we only need the length of the array
		return elementUrls.map(function() {
			return undefined;
		});
	}).then(function(elementIds) {
		elementIds = JSON.stringify(elementIds);

		fs.writeFileSync(idFilePath, elementIds);
	}).then(function() {
		console.log('Done : creating element ids');
	});
}).catch(handleError);
