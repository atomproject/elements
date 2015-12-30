var path = require('path');
var fs = require('fs');
var bower = require('bower');
var slug = require('slug');
var exec = require('child_process').exec;
var metadata = fs.readFileSync('metadata.json');
var locationParser = require('./parse-location');

metadata = JSON.parse(metadata);

metadata.elements.forEach(el => {
  var dn = slug(el.displayName).toLowerCase();
  var loc = locationParser(el.location);
  var dep;

  if (!loc.githubUser || !loc.githubRepo) {
    return;
  }

  dep = `${loc.githubUser}/${loc.githubRepo}#master`;

  console.log(`${dn}:${dep}`)
});