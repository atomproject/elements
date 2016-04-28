'use strict';

let getConfig = require('./config').getConfig;
let shell = require('shelljs');
let Q = require('q');
let request = require('request');
let tar = require('tar-fs');
let gunzip = require('gunzip-maybe');
let bower = require('bower');

Q.spawn(function* () {
  let config = yield getConfig();
  let elements = config.elements
    .filter(el => el.location.githubUser && el.location.githubRepo)
    .map(el => {
      let loc = el.location;
      let dep = `${loc.githubUser}/${loc.githubRepo}`;

      return {
        name: el.name,
        dir: `_site/${el.pageDirName}`,
        dep: dep,
        archiveUrl: `https://github.com/${dep}/archive/master.tar.gz`
      };
    });

  for (let el of elements) {
    shell.mkdir('-p', el.dir);

    yield new Promise((resolve, reject) => {
      let extractStream = tar.extract(el.dir);

      extractStream.on('finish', resolve);
      extractStream.on('error', reject);
      request(el.archiveUrl)
        .pipe(gunzip())
        .pipe(extractStream);
    });

    shell.cp(`${el.dir}/${el.name}-master/bower.json`, el.dir);

    shell.pushd(el.dir);
    yield new Promise((resolve, reject) => {
      bower.commands
        .install()
        .on('end', resolve)
        .on('error', reject);
    });
    yield new Promise((resolve, reject) => {
      bower.commands
        .install(['atomproject/dynamic-data-source'])
        .on('end', resolve)
        .on('error', reject);
    });
    shell.cp('-r', `${el.name}-master`, `bower_components/${el.name}`);
    shell.pushd();
  }
});
