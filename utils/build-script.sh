#!/usr/bin/env bash

shopt -s extglob
shopt -s globstar
shopt -s nullglob
set -e

copy_design_docs() {
	for dir in elements/*
	do
		if ! [[ -d "$dir" ]]; then
			continue
		fi

		file_name="${dir##*/}"
		component_name=$(grep 'component_name:' "$dir/$file_name.html")
		component_name="${component_name##*:}"
		component_name="${component_name## }"
		component_name="${component_name%% }"
		doc_path="bower_components/$component_name/design-doc.md"
		demo_file_path="bower_components/$component_name/demo/index.html"

		if [[ -f "$doc_path" ]]; then
			printf "%50s --> %s\n" "$doc_path" "$dir/design-doc.md"
			cp "$doc_path" "$dir"
		else
			# keep the design doc blank
			(echo "" ) > "$dir/design-doc.md"
		fi


		if [[ -f "$demo_file_path" ]]; then
			node utils/extract-inner-html.js "$component_name" "$demo_file_path" "$dir/inner.html"
		else
			# do something glaring here, this is too subtle
			printf "%50s --> %s\n" "$demo_file_path" "No demo found"
		fi
	done

	echo ""
}

copy_design_docs

if [ "$1" == "--prod" ]
then
	node utils/get-element-ids.js
	jekyll build --config _config.yml,_config.prod.yml
	cp element-ids.json _site/
	node_modules/vulcanize/bin/vulcanize --inline-script --strip-comments components/elements.html | \
	node_modules/crisper/bin/crisper --script-in-head=false --html _site/components/elements.html --js _site/scripts/build.js
else
	if ! [[ -f "element-ids.json" ]]; then
		node utils/get-element-ids.js
	fi

	jekyll build
fi

cp -r bower_components _site
# htmlproof ./_site --disable-external
