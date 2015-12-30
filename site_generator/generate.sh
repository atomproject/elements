#!/usr/bin/env bash

set -e

ifncp() {
	if ! [[ -d "_site/$1" ]]; then
		cp "$1" -r "_site"
		printf "Copy: %-30s\n" "$1"
	fi
}

dirs=(assets bower_components components node_modules scripts styles element-ids.json)

if ! [[ -f "element-ids.json" ]]; then
	node site_generator/get-element-ids.json
fi

node site_generator/build.js "$1"
	
for item in "${dirs[@]}"
do
	ifncp "$item"
done

if [[ "$1" == "--prod" ]]
then
	node_modules/vulcanize/bin/vulcanize --inline-script --strip-comments components/elements.html | \
	node_modules/crisper/bin/crisper --script-in-head=false --html _site/components/elements.html --js _site/scripts/build.js
fi
