var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var Liquid = require('liquid-node');
var slug = require('slug');
var cheerio = require('cheerio');
var mkdirp = require('mkdirp');
var marked = require('marked');
var promisify = require('promisify-node');
var glob = promisify(require('glob'));
var locationParser = require('./parse-location');

var engine = new Liquid.Engine();
var defaultConfig = {
  includesDir: 'includes',
  layoutsDir: 'layouts',
  pagesDir: 'pages',
  outDir: '_site',
  baseurl: '',
  showDemoTester: true,
  travisBaseUrl: "https://travis-ci.org",
  markdownExtensions: ['.md']
};
var config = fs.readFileSync('metadata.json', 'utf-8');

if (process.argv[2] === '--prod') {
  defaultConfig.baseurl = '/elements';
}

config = JSON.parse(config);
config = Object.assign({}, defaultConfig, config);
config.elements = config.elements.map(el => new Context(el));
config.categories = config.categories.map(cat => {
  var elements = config.elements.filter(el => el.category === cat.name);
  cat.elements = elements;
  return cat;
});

engine.fileSystem = new Liquid.LocalFileSystem;
engine.fileSystem.root = config.includesDir;

function Context(el) {
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

  this.designDoc = '\n' + tryReadFile(`${elDir}/design-doc.md`);
  this.innerHtml = extractInnerHtml(this.name, `${elDir}/demo/index.html`);
};

function tryReadFile(filePath) {
  console.log(filePath);
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

function resolveLayout(filePath, queue) {
  var file = fs.readFileSync(path.resolve(filePath), 'utf-8');
  var layout;

  file = fm(file);
  queue = queue || [];
  queue.push(file);

  if (file.attributes && (layout = file.attributes.layout)) {
    filePath = `layouts/${layout}.html`;
    resolveLayout(filePath, queue);
  }

  return queue;
}

function renderLayout(queue, context) {
  var p = Promise.resolve('');

  queue.forEach(item => {
    Object.assign(context.page, item.attributes);

    p = p.then(content => {
      context.content = content;

      return engine.parseAndRender(item.body, context);
    });
  });

  return p;
}

mkdirp.sync(config.outDir);

config.elements.forEach(elContext => {
  var file = fs.readFileSync('templates/github.html', 'utf-8');
  var fullContext = {
    site: config,
    page: elContext
  };

  var queue = resolveLayout('templates/github.html')

  renderLayout(queue, fullContext)
    .then(page => {
      var pagePath = elContext.pageDirName;

      mkdirp.sync(path.join('_site', pagePath));
      pagePath = path.join('_site', pagePath ,'index.html');

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(err => console.log(err.stack));
});

glob(`${config.pagesDir}/**`)
  .then(files => {
    files.forEach(filePath => {
      var context = {site: config, page: {}};
      var pathObj = path.parse(filePath);
      var queue;

      if (!fs.statSync(filePath).isFile()) {
        return;
      }

      queue = resolveLayout(filePath);

      if (config.markdownExtensions.indexOf(pathObj.ext) !== -1) {
        queue[0].body = marked(queue[0].body || '');
      }

      renderLayout(queue, context)
        .then(page => {
          var pagesDir = path.resolve(config.pagesDir);
          var outDir = path.resolve(config.outDir);
          var pathObj = path.parse(filePath);
          var pagePath;

          outDir = path.resolve(pathObj.dir).replace(pagesDir, outDir);
          mkdirp(outDir);
          pagePath = path.join(outDir, `${pathObj.name}.html`);

          console.log(`Build: ${pagePath}`);
          fs.writeFileSync(pagePath, page);
        })
        .catch(err => console.log(err.stack));
    });
  })
  .catch(err => console.log(err.stack));
