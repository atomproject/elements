var fs = require('fs');
var cheerio = require('cheerio');
var text, $, name, innerHTML, outPath;

function printHelp() {
	var messages = [];
	//add some color and proper formatting
	messages.push('Correct usage: ');

	messages.forEach(function(msg) {
		console.log(msg);
	});
}

// console.log(process.argv)

if (process.argv.length < 4 || process.argv[2] === '--help') {
	printHelp();

	process.exit(1);
}

outPath = process.argv[4];
text = fs.readFileSync(process.argv[3]);
name = process.argv[2];

$ = cheerio.load(text);

innerHTML = $(name).html() || '';

//remove empty lines??
//handle unix line endings
innerHTML = innerHTML.split('\r\n').map(function(line) {
	return line.replace(/^\s+/, '').replace(/\s+$/, '');
}).filter(function(line) {
	return Boolean(line);
}).join('');

fs.writeFileSync(outPath, innerHTML);
