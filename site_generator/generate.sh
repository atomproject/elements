#!/usr/bin/env bash

set -e

ifncp() {
	if ! [[ -d "_site/$1" ]]; then
		cp "$1" -r "_site"
		printf "Copy : %-30s\n" "$1"
	fi
}

dirs=(assets bower_components components scripts styles)

node site_generator/build.js "$1"

if ! [[ -f "_site/element-ids.json" ]]; then
	node site_generator/get-element-ids.js
fi

for item in "${dirs[@]}"
do
	ifncp "$item"
done

node site_generator/install-element.js | while read -r line
do
	name="${line%%:*}"
	line="${line#*:}"
	dir="${line%%:*}"
	dep="${line##*:}"
	dep="https://github.com/$dep/archive/master.tar.gz"

	dir="_site/$dir"

	if ! [[ -d "$dir/bower_components" ]]
	then
		pushd "$dir" &>/dev/null

		echo "Clone: $dep"

		curl "$dep" -L &>/dev/null >archive.tar.gz
		tar -xvf archive.tar.gz &>/dev/null
		ndir="$name-master"
		bow="$(readlink -f "$ndir/bower.json")"
		cp "$bow" ./
		bower install &>/dev/null
		rm bower.json
		mv "$ndir" bower_components/"$name"

		popd &>/dev/null
	fi
done

if [[ "$1" == "--prod" ]]
then
	node_modules/vulcanize/bin/vulcanize --inline-script --strip-comments components/elements.html | \
	node_modules/crisper/bin/crisper --script-in-head=false --html _site/components/elements.html --js _site/scripts/build.js
fi
