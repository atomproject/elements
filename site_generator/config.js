var fs = require('fs');
var path = require('path');
var slug = require('slug');
var cheerio = require('cheerio');
var locationParser = require('./parse-location');
var promisify = require('promisify-node');
var readFile = promisify(fs.readFile);

var defaultConfig = {
  includesDir: 'includes',
  layoutsDir: 'layouts',
  pagesDir: 'pages',
  baseurl: '',
  showDemoTester: true,
  travisBaseUrl: "https://travis-ci.org",
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
  text = tryReadFile(fpath);

  $ = cheerio.load(text);
  innerHTML = $(name).html() || '';

  innerHTML = innerHTML.split('\r\n').map(function(line) {
    return line.replace(/^\s+/, '').replace(/\s+$/, '');
  }).filter(function(line) {
    return Boolean(line);
  }).join('');

  return innerHTML;
};

function ElementContext(el, config) {
  var loc, travisBaseUrl = config.travisBaseUrl;
  var elTravisUrl, dir, elDir, elDirUrl;

  this.name = el.name;
  this.category = el.category;
  this.icon = el.icon;
  this.displayName = el.displayName;
  this.location = loc = locationParser(el.location);

  if (loc.githubUser && loc.githubRepo) {
    elTravisUrl = `${travisBaseUrl}/${loc.githubUser}/${loc.githubRepo}`;
    this.linkToTravis = `${elTravisUrl}/`;
    this.buildStatusUrl = `${elTravisUrl}.svg?branch=master`;
  }

  this.pageDirName = slug(el.displayName).toLowerCase();
  dir = loc.localPath || `${this.pageDirName}/bower_components/${el.name}`;
  elDir = `_site/${dir}`;
  elDirUrl = `${config.baseurl}/${dir}`;

  this.pageUrl = `${config.baseurl}/${this.pageDirName}/`;
  this.documentationFileUrl = `${elDirUrl}/`;
  this.demoFileUrl = `${elDirUrl}/demo/index.html`;
  this.propertiesFileUrl = `${elDirUrl}/property.json`;

  this.propertyFile = `${elDir}/property.json`;
  this.designDoc = '\n' + tryReadFile(`${elDir}/design-doc.md`);
  this.innerHtml = extractInnerHtml(this.name, `${elDir}/demo/index.html`);
};

function getConfig() {
  var filePath = 'bower_components/config/metadata.json';

  if (process.argv[2] === '--prod') {
    defaultConfig.baseurl = '/elements';
  }

  return readFile(filePath, 'utf-8').then(config => {
    config = JSON.parse(config);
    config = Object.assign({}, defaultConfig, config);
    config.elements = config.elements.map(el => new ElementContext(el, config));
    config.categories = config.categories.map(cat => {
      var elements = config.elements.filter(el => el.category === cat.name);
      cat.elements = elements;
      return cat;
    });

    return Promise.resolve(config);
  });
}

module.exports = getConfig;
