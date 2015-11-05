#!/usr/bin/env node

var rp = require('request-promise');
var chalk = require('chalk');

var token = process.env.GH_ORG_CLONE_TOKEN;
var orgName = process.argv[2];
var requestOptions = {
    headers: {
    	'User-Agent': 'Request-Promise',
        'Authorization': 'token ' + token
    }
};
var apiEndPoints = {
	listOrgRepos: '/orgs/{orgName}/repos'
}
var baseUrl = 'https://api.github.com';

function getUrl(template, obj) {
	return template.replace(/\{\w+\}/g, function(match) {
		var key = match.slice(1, -1);

		return obj[key];
	});
}

if (!token) {
	console.log(chalk.red('Please set environment variable GH_ORG_CLONE_TOKEN'));
	console.log('The value of the above variable should be a personal access token');
	console.log('Personal access tokens should be generated with proper scopes');
	console.log('The personal access token can be generated from following page');
	console.log(chalk.cyan('https://github.com/settings/tokens'));
}


if (!orgName) {
	console.log(chalk.red('Please provide the org name as a parameter to this script'));
}

var template = baseUrl + apiEndPoints.listOrgRepos;
var url = getUrl(template, {
	orgName: orgName
});

requestOptions.uri = url;

// var reposPromise = rp(requestOptions);
var reposPromise = rp(requestOptions);

reposPromise
	.then(function(repos) {
		// repos = JSON.parse(repos);

		// repos.forEach(function(repo) {
		// 	console.log(repo.name);
		// });
	})
	.catch(function(error){
		//report the http error status
		//show the error message in red
		//don't show anything else
		console.log(chalk.red(error.message));
	});
