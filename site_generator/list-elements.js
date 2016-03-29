var getConfig = require('./config').getConfig;

getConfig().then(config => {
  config.elements.forEach(el => {
    var loc = el.location, dep;

    if (!loc.githubUser || !loc.githubRepo) {
      return;
    }

    dep = `${loc.githubUser}/${loc.githubRepo}`;

    console.log(`${el.name}:${el.pageDirName}:${dep}`);
  });
});
