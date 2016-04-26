'use strict';

let getConfig = require('./config').getConfig;

getConfig().then(config => {
  config.elements.forEach(el => {
    let loc = el.location;

    if (!loc.githubUser || !loc.githubRepo) {
      return;
    }

    let dep = `${loc.githubUser}/${loc.githubRepo}`;

    console.log(`${el.name}:${el.pageDirName}:${dep}`);
  });
});
