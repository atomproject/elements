var path = require('path');
var fs = require('fs');
var slug = require('slug');
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

  dep = `${loc.githubUser}/${loc.githubRepo}`;

  console.log(`${el.name}:${dn}:${dep}`)
});