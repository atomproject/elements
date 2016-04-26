'use strict';

let fs = require('fs');
let path = require('path');
let fm = require('front-matter');
let Liquid = require('liquid-node');
let mkdirp = require('mkdirp');
let marked = require('marked');
let promisify = require('promisify-node');
let glob = promisify(require('glob'));
let engine = new Liquid.Engine();
let getFullConfig = require('./config').getFullConfig;

function handleError(err) {
  console.log(err.stack || err);
  process.exit(1);
}

function resolveLayout(filePath, queue) {
  let file = fs.readFileSync(path.resolve(filePath), 'utf-8');
  let layout;

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
  let p = Promise.resolve('');

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
  let queue = resolveLayout('templates/github.html');
  let fullContext = {
    site: config,
    page: elContext
  };

  renderLayout(queue, fullContext)
    .then(page => {
      let pagePath = elContext.pageDirName;

      mkdirp.sync(path.join('_site', pagePath));
      pagePath = path.join('_site', pagePath ,'index.html');

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

function createPage(filePath, config) {
  if (!fs.statSync(filePath).isFile()) {
    return;
  }

  let queue = resolveLayout(filePath);
  let pathObj = path.parse(filePath);
  let context = {site: config, page: {}};

  if (config.markdownExtensions.indexOf(pathObj.ext) !== -1) {
    queue[0].body = marked(queue[0].body || '');
  }

  renderLayout(queue, context)
    .then(page => {
      let pagesDir = path.resolve(config.pagesDir);
      let outDir = path.resolve('_site');
      let pathObj = path.parse(filePath);

      outDir = path.resolve(pathObj.dir).replace(pagesDir, outDir);

      if (pathObj.name !== 'index') {
        outDir = path.join(outDir, pathObj.name);
      }

      mkdirp.sync(outDir);
      let pagePath = path.join(outDir, `index.html`);

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

getFullConfig().then(config => {
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
