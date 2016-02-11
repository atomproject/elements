var url = require('url');

function parseHttp(location) {
  var parts, origLoc;

  location = url.parse(origLoc = location);

  if (!location.path) {
    throw new Error(`Path undefined for location: ${origLoc}`);
  }

  if (location.hostname && location.hostname.indexOf('github') === -1) {
    throw new Error(`Only local and github components supported: ${origLoc}`);
  }

  if (!location.hostname) {
    return {
      localPath: location.path
    };
  }

  parts = location.path.split('/');

  return {
    githubUser: parts[1],
    githubRepo: parts[2]
  };
}

function parseGit(location) {
  throw new Error('Not implemented');
}

module.exports = function (location) {
  if (!location) {
    throw new Error('Location is undefined');
  }

  if (location.indexOf('@') === -1) {
    return parseHttp(location);
  } else {
    return parseGit(location);
  }
};
