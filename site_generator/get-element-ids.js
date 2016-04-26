'use strict';

let fs = require('fs');
let nodeFetch = require('node-fetch');
let baseApiEndPoint = 'https://api.travis-ci.org/repos';
let getConfig = require('./config').getConfig;
let idFilePath = '_site/element-ids.json';

function handleError(err) {
  console.log(err.stack || err);
  process.exit(1);
}

function getJson(url) {
  return nodeFetch(url).then(resp => {
    //TODO: will other response status codes do for our task?
    return resp.status === 200 ? resp.json() : Promise.reject();
  });
}

getConfig()
  .then(config => {
    let elementUrls = config.elements
      .filter(el => el.name !== 'demo-tester')
      .map(el => {
        return baseApiEndPoint +
          '/' + el.location.githubUser +
          '/' + el.location.githubRepo;
      });

    let getJsonPromises = elementUrls.map(entityApi => {
      return entityApi ? getJson(entityApi) : Promise.resolve({});
    });

    Promise.all(getJsonPromises)
      .then(results => results.map(result => result.id))
      // we need to retain the number of elements to show it on UI
      .catch(() => elementUrls.map(() => {}))
      .then(elementIds => {
        elementIds = JSON.stringify(elementIds);
        fs.writeFileSync(idFilePath, elementIds);
      })
      .then(function() {
        console.log('Done : creating element ids');
      });
  })
  .catch(handleError);
