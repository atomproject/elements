#!/usr/bin/env bash

bower install && jekyll build && cp -r bower_components _site

