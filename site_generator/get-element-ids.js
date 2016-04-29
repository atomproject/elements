'use strict';

let fs = require('q-io/fs');
let nodeFetch = require('node-fetch');
let baseApiEndPoint = 'https://api.travis-ci.org/repos';
let getConfig = require('./config').getConfig;
let idFilePath = '_site/element-ids.json';
let Q = require('q');

function getJson(url) {
  return nodeFetch(url).then(resp => {
    //TODO: will other response status codes do for our task?
    return resp.status === 200 ? resp.json() : Promise.reject();
  });
}

Q.spawn(function* () {
  let config = yield getConfig();
  let elementUrls = config.elements
    .filter(el => el.name !== 'demo-tester')
    .map(el => {
      return baseApiEndPoint +
        '/' + el.location.githubUser +
        '/' + el.location.githubRepo;
    });
  let results, elementIds;

  try {
    results = yield Promise.all(elementUrls.map(entityApi => {
        return entityApi ? getJson(entityApi) : Promise.resolve({});
    }));
    elementIds = results.map(result => result.id);
  }
  catch (ex) {
    elementIds = elementUrls.map(() => {});
  }
  finally {
    elementIds = JSON.stringify(elementIds);
    fs.write(idFilePath, elementIds);
  }
});
