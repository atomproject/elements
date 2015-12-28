var fm = require('front-matter');
var promisify = require('promisify-node');
var Liquid = require('liquid-node');
var engine = new Liquid.Engine();
var fs = promisify('fs');
var layout;

engine.fileSystem = new Liquid.LocalFileSystem;
engine.fileSystem.root = '../';
