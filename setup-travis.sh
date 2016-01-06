#!/usr/bin/env bash

# TODO: assure user that github passwords aren't stored
# TODO: deduce the current repo don't ask for it
# TODO: run the task for creating `metadata.json`
# TODO: disable the build pull requests option

get_val() {
	value="$(grep "$1" "$2")"
	value="${value%\"*}"
	value="${value##*\"}"
	echo "$value"
}

handle_logs_and_exit() {
	cat github-*.log travis-*.log >setup.log
	rm github-*.log travis-*.log
}

if ! git remote show upstream &>/dev/null
then
	git remote add upstream https://github.com/atomproject/elements.git
fi

read -p "GitHub Username: " gh_uname
read -s -p "GitHub Password: " gh_pass
echo ""
note="Atom Elements Travis - $(date "+%x")"
data='{
	"scopes": [
		"read:org",
		"user:email",
		"repo_deployment",
		"repo:status",
		"write:repo_hook",
		"public_repo"
	],
	"note": "'"$note"'"
}'

curl -s -u "$gh_uname:$gh_pass" -d "$data" https://api.github.com/authorizations >github-token-resp.log
token="$(get_val '"token"' github-token-resp.log)"

if [[ -z "$token" ]]
then
	echo ""
	get_val '"message"' github-token-resp.log
	handle_logs_and_exit
fi
echo "Received GitHub token"

curl -s -u "$gh_uname:$gh_pass" https://api.github.com/user >github-email-resp.log
email="$(get_val '"email"' github-email-resp.log)"

if [[ -z "$email" ]]
then
	echo ""
	get_val '"message"' github-email-resp.log
	handle_logs_and_exit
fi
echo "Received user email"

data='{"github_token":"'"$token"'"}'

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-d "$data" https://api.travis-ci.org/auth/github >travis-token-resp.log

travis_token="$(get_val '"access_token"' travis-token-resp.log)"

if [[ -z "$travis_token" ]]
then
	echo ""
	echo "Login to Travis atleast once from the web interface if you haven't."
	cat travis-token-resp.log
	handle_logs_and_exit
fi

echo "Received Travis token"

repo_url="$(git remote show origin | grep 'github.com' | head -n 1)"
repo_url="${repo_url##*github\.com[:/]}"
repo="${repo_url%\.git}"

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "User-Agent: MyClient/1.0.0" \
	https://api.travis-ci.org/repos/"$repo" >travis-repo-resp.log

repo_id="$(grep -iEo '"id": ?[0-9]+' travis-repo-resp.log)"
repo_id="${repo_id#*:}"

if [[ -z "$repo_id" ]]
then
	echo ""
	cat travis-repo-resp.log
	handle_logs_and_exit
fi

echo "Repository Id: $repo_id"

data='{
	"env_var": {
		"name": "GH_TOKEN",
		"value": "'"$token"'",
		"public": false
	}
}'

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-H "Authorization: token $travis_token" \
	-d "$data" https://api.travis-ci.org/settings/env_vars?repository_id="$repo_id" >travis-env-token-resp.log

if ! grep '"id":' travis-env-token-resp.log &>/dev/null
then
	echo ""
	cat travis-env-token-resp.log
	handle_logs_and_exit
fi
echo "Added GH_TOKEN environment variable"

data='{
	"env_var": {
		"name": "GH_REF",
		"value": "github.com/'"$repo"'.git",
		"public": false
	}
}'

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-H "Authorization: token $travis_token" \
	-d "$data" https://api.travis-ci.org/settings/env_vars?repository_id="$repo_id" >travis-env-ref-resp.log

if ! grep '"id":' travis-env-ref-resp.log &>/dev/null
then
	echo ""
	cat travis-env-ref-resp.log
	handle_logs_and_exit
fi
echo "Added GH_REF environment variable"

read -p "Gist url for metadata.json file: " gist_url

if [[ -z "$gist_url" ]]
then
	echo ""
	echo "You need to provide the url of metadata.json gist"
	handle_logs_and_exit
fi

data='{
	"env_var": {
		"name": "CONFIG_GIST_URL",
		"value": "'"$gist_url"'",
		"public": true
	}
}'

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-H "Authorization: token $travis_token" \
	-d "$data" https://api.travis-ci.org/settings/env_vars?repository_id="$repo_id" >travis-env-gist-resp.log

if ! grep '"id":' travis-env-gist-resp.log &>/dev/null
then
	echo ""
	cat travis-env-gist-resp.log
	handle_logs_and_exit
fi
echo "Added CONFIG_GIST_URL environment variable"

data='{
	"env_var": {
		"name": "USER_EMAIL",
		"value": "'"$email"'",
		"public": true
	}
}'

curl -s -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-H "Authorization: token $travis_token" \
	-d "$data" https://api.travis-ci.org/settings/env_vars?repository_id="$repo_id" >travis-env-email-resp.log

if ! grep '"id":' travis-env-email-resp.log &>/dev/null
then
	echo ""
	cat travis-env-email-resp.log
	handle_logs_and_exit
fi
echo "Added USER_EMAIL environment variable"

data='{
	"settings": {
		"builds_only_with_travis_yml": true,
		"build_pushes": true,
		"build_pull_requests": false
	}
}'

curl -s -X PATCH -H "Accept: application/vnd.travis-ci.2+json" \
	-H "Content-Type: application/json" \
	-H "User-Agent: MyClient/1.0.0" \
	-H "Authorization: token $travis_token" \
	-d "$data" https://api.travis-ci.org/repos/"$repo_id"/settings >travis-settings-resp.log

if ! grep 'build_pull_requests' travis-settings-resp.log &>/dev/null
then
	echo ""
	cat travis-settings-resp.log
	handle_logs_and_exit
fi

git commit -m "Build Travis" --allow-empty
git push origin master

handle_logs_and_exit
