#!/usr/bin/env bash

bower install && jekyll build --config _config.yml,_config.prod.yml && cp -r bower_components _site

