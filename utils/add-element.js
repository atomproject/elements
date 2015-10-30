#!/usr/bin/env node

var fs = require('fs');
var chalk = require('chalk');
var template = fs.readFileSync('utils/el-template.html', 'utf-8');

function printHelp() {
	var messages = [];
	//add some color and proper formatting
	messages.push('Correct usage: ');
	messages.push(chalk.red('<project root>/utils/create-from-matter.js <name> <display_name> <category> [icon]'));
	messages.push('[.*] parameters are optional')

	messages.forEach(function(msg) {
		console.log(msg);
	});
}

// console.log(process.argv)

if (process.argv.length < 5 || process.argv[2] === '--help') {
	printHelp();

	process.exit(1);
}

var name = process.argv[2];
var displayName = process.argv[3];
var categoryName = process.argv[4] || "";
var icon = process.argv[5] || "";

var newFile, slug, permalink, fileName, filePath, dir;

if (name.indexOf('-') === -1) {
	console.log('Bad component name. The component name should contain "-"');
	process.exit(1);
}

slug = displayName.replace(/ /g, '-');
slug = slug.toLowerCase();

dir = 'elements/' + slug;
fileName = slug + '.html';
filePath = dir + '/' + fileName;
permalink = '/' + fileName;

newFile = template.replace(/%displayName%/g, displayName);
newFile = newFile.replace(/%name%/g, name);
newFile = newFile.replace(/%categoryName%/g, categoryName);
newFile = newFile.replace(/%icon%/g, icon);
newFile = newFile.replace(/%permalink%/g, permalink);

console.log(dir);
console.log(fileName);
console.log(filePath)
console.log(newFile);
fs.mkdirSync(dir);
fs.writeFileSync(filePath, newFile);

console.log('Please add the ' + chalk.blue(dir + '/demo-snippet.html'));
