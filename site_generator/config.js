var fs = require('fs');
var slug = require('slug');
var cheerio = require('cheerio');
var locationParser = require('./parse-location');
var promisify = require('promisify-node');
var readFile = promisify(fs.readFile);
var hydrolysis = require('hydrolysis');

var defaultConfig = {
  includesDir: 'includes',
  layoutsDir: 'layouts',
  pagesDir: 'pages',
  baseurl: '',
  showDemoTester: true,
  travisBaseUrl: 'https://travis-ci.org',
  markdownExtensions: ['.md']
};

function tryReadFile(filePath) {
  return readFile(filePath, 'utf-8')
    .catch(() => '');
}

function extractInnerHtml(name, fpath) {
  return readFile(fpath, 'utf-8')
    .then(text => {
      var $, innerHTML;
      $ = cheerio.load(text);
      innerHTML = $(name).html() || '';

      innerHTML = innerHTML.split('\r\n').map(function(line) {
        return line.replace(/^\s+/, '').replace(/\s+$/, '');
      }).filter(function(line) {
        return Boolean(line);
      }).join('');

      return innerHTML;
    })
    .catch(() => '');
}

function extractDeps(baseDir, elName) {
  var hydroPromise, bowerDepsPromise, demoFilePath;

  bowerDepsPromise = readFile(`${baseDir}/bower.json`).then(bower => {
    bower = JSON.parse(bower || '{}');

    return Object.assign({}, bower.dependencies, bower.devDependencies);
  });

  baseDir = baseDir.replace(new RegExp(`/${elName}$`), '');
  demoFilePath = `${baseDir}/${elName}/demo/index.html`;
  hydroPromise = hydrolysis.Analyzer.analyze(demoFilePath);

  return Promise
    .all([hydroPromise, bowerDepsPromise])
    .then(values => {
      var hydro = values.shift();
      var bowerDeps = values.shift();
      var docs = hydro.parsedDocuments || {};
      var scripts = hydro.parsedScripts || {};

      function parse(type, relPath) {
        var package, install;

        relPath = relPath.replace(`${baseDir}/`, '');
        package = relPath.match(/^[^\/]+/);
        install = bowerDeps[package];

        if (install && !/[/#]/.test(install)) {
          install = `${package}#${install}`;
        }

        if (!package) {
          return Promise.reject(`Bad path in demo file: ${relPath}`);
        }

        return {
          package: package[0],
          relPath: relPath,
          install: install,
          type: type
        };
      }

      function filter(dep) {
        return !(new RegExp(`(${elName}.html)|(index.html)`).test(dep.relPath));
      }

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
  var loc, travisBaseUrl = config.travisBaseUrl;
  var elTravisUrl, dir, elDir, elDirUrl, elContext = {};

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

  elContext.pageDirName = slug(el.displayName).toLowerCase();
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
  var filePath = 'bower_components/config/metadata.json';

  if (process.argv[2] === '--prod') {
    defaultConfig.baseurl = '/elements';
  }

  return readFile(filePath, 'utf-8').then(config => {
    var elements;

    config = JSON.parse(config);
    config = Object.assign({}, defaultConfig, config);

    elements = config.elements.map(el => getElementContext(el, config));

    config.elements = elements;
    config.categories = config.categories.map(cat => {
      var catElements = elements.filter(el => el.category === cat.name);
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
          var doc = tryReadFile(`${el.dir}/design-doc.md`);
          var html = extractInnerHtml(el.name, `${el.dir}/demo/index.html`);
          var deps = extractDeps(el.dir, el.name);

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
