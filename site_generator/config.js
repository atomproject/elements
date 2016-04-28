'use strict';

let fs = require('fs');
let cheerio = require('cheerio');
let locationParser = require('./parse-location');
let promisify = require('promisify-node');
let readFile = promisify(fs.readFile);
let hydrolysis = require('hydrolysis');

let defaultConfig = {
  includesDir: 'includes',
  layoutsDir: 'layouts',
  pagesDir: 'pages',
  baseurl: '',
  showDemoTester: true,
  travisBaseUrl: 'https://travis-ci.org',
  markdownExtensions: ['.md']
};

function slug(str) {
  return str.toLowerCase().replace(/[ _]+/, '-');
}

function tryReadFile(filePath) {
  return readFile(filePath, 'utf-8')
    .catch(() => '');
}

function extractInnerHtml(name, fpath) {
  return readFile(fpath, 'utf-8')
    .then(text => {
      let $ = cheerio.load(text);
      let innerHTML = $(name).html() || '';

      innerHTML = innerHTML.split('\r\n')
        .map(line => line.replace(/^\s+/, '').replace(/\s+$/, ''))
        .filter(line => Boolean(line))
        .join('');

      return innerHTML;
    })
    .catch(() => '');
}

function extractDeps(baseDir, elName) {
  let bowerDepsPromise = readFile(`${baseDir}/bower.json`).then(bower => {
    bower = JSON.parse(bower || '{}');

    return Object.assign({}, bower.dependencies, bower.devDependencies);
  });

  baseDir = baseDir.replace(new RegExp(`/${elName}$`), '');
  let demoFilePath = `${baseDir}/${elName}/demo/index.html`;
  let hydroPromise = hydrolysis.Analyzer.analyze(demoFilePath);

  return Promise
    .all([hydroPromise, bowerDepsPromise])
    .then(values => {
      let hydro = values.shift();
      let bowerDeps = values.shift();

      function parse(type, relPath) {
        relPath = relPath.replace(`${baseDir}/`, '');
        let pkg = relPath.match(/^[^\/]+/);
        let install = bowerDeps[pkg];

        if (install && !/[/#]/.test(install)) {
          install = `${pkg}#${install}`;
        }

        if (!pkg) {
          return Promise.reject(`Bad path in demo file: ${relPath}`);
        }

        return {
          pkg: pkg[0],
          relPath: relPath,
          install: install,
          type: type
        };
      }

      function filter(dep) {
        return !(new RegExp(`(${elName}.html)|(index.html)`).test(dep.relPath));
      }

      let docs = hydro.parsedDocuments || {};
      let scripts = hydro.parsedScripts || {};

      docs = Object.keys(docs)
        .map(parse.bind(null, 'link'))
        .filter(filter);

      scripts = Object.keys(scripts)
        .map(parse.bind(null, 'script'))
        .filter(filter);

      return [].concat(scripts, docs);
    })
    .catch(() => []);
}

function getElementContext(el, config) {
  let travisBaseUrl = config.travisBaseUrl;
  let elContext = {};
  let loc, elDir, elDirUrl, elTravisUrl, dir;

  elContext.name = el.name;
  elContext.category = el.category;
  elContext.icon = el.icon;
  elContext.displayName = el.displayName;
  elContext.location = loc = locationParser(el.location);

  if (loc.githubUser && loc.githubRepo) {
    elTravisUrl = `${travisBaseUrl}/${loc.githubUser}/${loc.githubRepo}`;
    elContext.linkToTravis = `${elTravisUrl}/`;
    elContext.buildStatusUrl = `${elTravisUrl}.svg?branch=master`;
  }

  elContext.pageDirName = slug(el.displayName);
  dir = loc.localPath || `${elContext.pageDirName}/bower_components/${el.name}`;
  elContext.dir = elDir = `_site/${dir}`;
  elContext.dirUrl = elDirUrl = `${config.baseurl}/${dir}`;

  elContext.pageUrl = `${config.baseurl}/${elContext.pageDirName}/`;
  elContext.documentationFileUrl = `${elDirUrl}/`;
  elContext.demoFileUrl = `${elDirUrl}/demo/index.html`;
  elContext.propertiesFileUrl = `${elDirUrl}/property.json`;

  elContext.propertyFile = `${elDir}/property.json`;

  // TODO: This was not thought properly. Think it through.
  // default value overrides
  if (el.propertyFile) {
    elContext.propertyFile = `_site/${el.propertyFile}`;
    elContext.propertiesFileUrl = `${config.baseurl}/${el.propertyFile}`;
  }

  // this will be set later in `getConfig`
  elContext.indexInCategory = 0;

  return elContext;
}

function getConfig() {
  if (process.argv[2] === '--prod') {
    defaultConfig.baseurl = '/elements';
  }

  let filePath = 'bower_components/config/metadata.json';

  return readFile(filePath, 'utf-8').then(config => {
    config = JSON.parse(config);
    config = Object.assign({}, defaultConfig, config);

    let elements = config.elements.map(el => getElementContext(el, config));

    config.elements = elements;
    config.categories = config.categories.map(cat => {
      let catElements = elements.filter(el => el.category === cat.name);
      catElements.forEach((el, index) => el.indexInCategory = index);
      cat.elements = catElements;

      return cat;
    });

    return config;
  });
}

function getFullConfig() {
  return getConfig()
    .then(config => {
      return Promise
        .all(config.elements.map(el => {
          let doc = tryReadFile(`${el.dir}/design-doc.md`);
          let html = extractInnerHtml(el.name, `${el.dir}/demo/index.html`);
          let deps = extractDeps(el.dir, el.name);

          return Promise
            .all([doc, html, deps])
            .then(values => {
              el.designDoc = '\n' + values.shift();
              el.innerHTML = values.shift();
              el.dependencies = JSON.stringify(values.shift());

              return el;
            });
        }))
        .then(elements => {
          config.elements = elements;

          return config;
        });
    });
}

exports.getConfig = getConfig;
exports.getFullConfig = getFullConfig;
