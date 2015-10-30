#!/usr/bin/env bash

if [ "$1" == "--prod" ]
then
	bower install && jekyll build --config _config.yml,_config.prod.yml && cp -r bower_components _site
else
	bower install && jekyll build --verbose > build.log && subl build.log && cp -r bower_components _site
fi
