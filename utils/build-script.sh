#!/usr/bin/env bash

shopt -s extglob
shopt -s globstar
shopt -s nullglob

copy_design_docs() {
	for dir in elements/*
	do
		file_name="${dir##*/}"
		component_name=$(grep 'component_name:' "$dir/$file_name.html")
		component_name="${component_name##*:}"
		component_name="${component_name## }"
		component_name="${component_name%% }"
		doc_path="bower_components/$component_name/design-doc.md"


		if [[ -f "$doc_path" ]]; then
			printf "%-50s --> %s" "$doc_path" "$dir/design-doc.md"
			cp "$doc_path" "$dir"
		fi
	done

	echo ""
}

copy_design_docs

if [ "$1" == "--prod" ]
then
	jekyll build --config _config.yml,_config.prod.yml
else
	jekyll build
fi

cp -r bower_components _site
# htmlproof ./_site --disable-external
