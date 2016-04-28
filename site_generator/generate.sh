#!/usr/bin/env bash

set -e

ifncp() {
  if ! [[ -d "_site/$1" ]]; then
    cp "$1" -r "_site"
    printf "Copy : %-30s\n" "$1"
  fi
}

# `bower_components` are needed since it is used like cdn. (exceptions `ace` see vulcanize step)
# `components` and `scripts` aren't needed. Confirm that.
dirs=(assets bower_components components scripts styles favicon.ico)

# STEP: Install the data
if ! [[ -f "bower_components/config/metadata.json" ]]
then
  if [[ -z "$CONFIG_GIST_URL" ]]
  then
    read -p "Gist url for metadata.json file: " CONFIG_GIST_URL
  fi

  bower install "config=$CONFIG_GIST_URL.git"
fi

# STEP: Dowload the latest version of component on github.
#       Extract it and install its dependencies.
#       Generate the necessary files if absent.
node site_generator/install-elements.js

# STEP: Generate the pages of site
node site_generator/build.js "$1"

# STEP: Generate the travis repo ids of the elements
if ! [[ -f "_site/element-ids.json" ]]; then
  node site_generator/get-element-ids.js
fi

# STEP: Copy the necessary things
for item in "${dirs[@]}"
do
  ifncp "$item"
done

# STEP: If in prod environment then vulcanize components
if [[ "$1" == "--prod" ]]
then
  # we have to exclude the ace js library from vulcanization since it loads
  # service workers using urls relative to itself
  node_modules/vulcanize/bin/vulcanize --exclude "bower_components/t-component-panel/ace-element/ace/" --inline-script --strip-comments components/elements.html | \
  node_modules/crisper/bin/crisper --script-in-head=false --html _site/components/elements.html --js _site/scripts/build.js
fi

echo ""
echo "Generate: complete"
