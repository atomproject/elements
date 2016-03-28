var fs = require('fs');
var slug = require('slug');
var cheerio = require('cheerio');
var locationParser = require('./parse-location');
var promisify = require('promisify-node');
var readFile = promisify(fs.readFile);
var analyze = require('hydrolysis').Analyzer.analyze;

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
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch(err) {
    return '';
  }
}

function extractInnerHtml(name, fpath) {
  var text, $, innerHTML;

  text = fs.readFileSync(fpath, 'utf-8');
  $ = cheerio.load(text);
  innerHTML = $(name).html() || '';

  innerHTML = innerHTML.split('\r\n').map(function(line) {
    return line.replace(/^\s+/, '').replace(/\s+$/, '');
  }).filter(function(line) {
    return Boolean(line);
  }).join('');

  return innerHTML;
}

function extractDeps(baseDir, elName) {
  var hydroPromise, bower, bowerDeps;

  bower = tryReadFile(`${baseDir}/bower.json`);
  bower = JSON.parse(bower || '{}');
  bowerDeps = Object.assign({}, bower.dependencies, bower.devDependencies);
  baseDir = baseDir.replace(new RegExp(`/${elName}$`), '');
  hydroPromise = analyze(`${baseDir}/${elName}/demo/index.html`);

  return hydroPromise.then(res => {
    var docs = res.parsedDocuments || {};
    var scripts = res.parsedScripts || {};

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
  });
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
  elDir = `_site/${dir}`;
  elDirUrl = `${config.baseurl}/${dir}`;

  elContext.pageUrl = `${config.baseurl}/${elContext.pageDirName}/`;
  elContext.documentationFileUrl = `${elDirUrl}/`;
  elContext.demoFileUrl = `${elDirUrl}/demo/index.html`;
  elContext.propertiesFileUrl = `${elDirUrl}/property.json`;

  elContext.propertyFile = `${elDir}/property.json`;
  elContext.designDoc = '\n' + tryReadFile(`${elDir}/design-doc.md`);
  elContext.innerHtml = extractInnerHtml(el.name, `${elDir}/demo/index.html`);

  // TODO: This was not thought properly. Think it through.
  // default value overrides
  if (el.propertyFile) {
    elContext.propertyFile = `_site/${el.propertyFile}`;
    elContext.propertiesFileUrl = `${config.baseurl}/${el.propertyFile}`;
  }

  // this will be set later in `getConfig`
  elContext.indexInCategory = 0;

  return extractDeps(elDir, el.name)
    .then(dependencies => {
      elContext.dependencies = JSON.stringify(dependencies);

      return elContext;
    });
}

function getConfig() {
  var filePath = 'bower_components/config/metadata.json';

  if (process.argv[2] === '--prod') {
    defaultConfig.baseurl = '/elements';
  }

  return readFile(filePath, 'utf-8').then(config => {
    var elPromises;

    config = JSON.parse(config);
    config = Object.assign({}, defaultConfig, config);
    elPromises = config.elements.map(el => getElementContext(el, config));

    return Promise.all(elPromises)
      .then(elements => {
        config.elements = elements;

        config.categories = config.categories.map(cat => {
          var catElements = elements.filter(el => el.category === cat.name);
          catElements.forEach((el, index) => el.indexInCategory = index);
          cat.elements = catElements;

          return cat;
        });

        return config;
      });
  });
}

module.exports = getConfig;
