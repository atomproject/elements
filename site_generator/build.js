var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var Liquid = require('liquid-node');
var mkdirp = require('mkdirp');
var marked = require('marked');
var promisify = require('promisify-node');
var glob = promisify(require('glob'));
var engine = new Liquid.Engine();
var getConfig = require('./config');

function handleError(err) {
  console.log(err.stack || err);
  process.exit(1);
}

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

function createElementPage(elContext, config) {
  var queue = resolveLayout('templates/github.html');
  var fullContext = {
    site: config,
    page: elContext
  };

  renderLayout(queue, fullContext)
    .then(page => {
      var pagePath = elContext.pageDirName;

      mkdirp.sync(path.join('_site', pagePath));
      pagePath = path.join('_site', pagePath ,'index.html');

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

function createPage(filePath, config) {
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
      var outDir = path.resolve('_site');
      var pathObj = path.parse(filePath);
      var pagePath;

      outDir = path.resolve(pathObj.dir).replace(pagesDir, outDir);
      mkdirp(outDir);
      pagePath = path.join(outDir, `${pathObj.name}.html`);

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

getConfig().then(config => {
  //setup yaml parser engine
  engine.fileSystem = new Liquid.LocalFileSystem();
  engine.fileSystem.root = config.includesDir;

  //create the out dir
  mkdirp.sync('_site');

  //create element pages
  config.elements.forEach(elContext => {
    createElementPage(elContext, config);
  });

  //create other pages
  glob(`${config.pagesDir}/**`)
    .then(files => {
      files.forEach(filePath => {
        createPage(filePath, config);
      });
    })
    .catch(handleError);

}).catch(handleError);
