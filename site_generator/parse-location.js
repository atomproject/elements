'use strict';

let url = require('url');

function parseHttp(loc) {
  let origLoc;
  loc = url.parse(origLoc = loc);

  if (!loc.path) {
    throw new Error(`Path undefined for location: ${origLoc}`);
  }

  if (loc.hostname && loc.hostname.indexOf('github') === -1) {
    throw new Error(`Only local and github components supported: ${origLoc}`);
  }

  if (!loc.hostname) {
    return {
      localPath: loc.path
    };
  }

  let parts = loc.path.split('/');

  return {
    githubUser: parts[1],
    githubRepo: parts[2]
  };
}

function parseGit() {
  throw new Error('Not implemented');
}

module.exports = function(loc) {
  if (!loc) {
    throw new Error('Location is undefined');
  }

  return loc.indexOf('@') === -1 ? parseHttp(loc) : parseGit(loc);
};
