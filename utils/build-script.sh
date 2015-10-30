#!/usr/bin/env bash

if [ "$1" == "--prod" ]
then
	jekyll build --config _config.yml,_config.prod.yml
else
	jekyll build
fi

cp -r bower_components _site
htmlproof ./_site --disable-external
