#!/usr/bin/env bash

ifncp() {
	if ! [[ -d "_site/$1" ]]; then
		cp "$1" -r "_site"
		printf "Copy: %-30s" "$1"
	fi
}

dirs=(assets bower_components components node_modules scripts styles)

node site_generator/build.js
	
for item in "${dirs[@]}"
do
	ifncp "$item"
done
