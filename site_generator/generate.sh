#!/usr/bin/env bash

set -e

ifncp() {
  if ! [[ -d "_site/$1" ]]; then
    cp "$1" -r "_site"
    printf "Copy : %-30s\n" "$1"
  fi
}

dirs=(assets bower_components components scripts styles favicon.ico)

# STEP 1: Install the data
if ! [[ -f "bower_components/config/metadata.json" ]]
then
  if [[ -z "$CONFIG_GIST_URL" ]]
  then
    read -p "Gist url for metadata.json file: " CONFIG_GIST_URL
  fi

  bower install "config=$CONFIG_GIST_URL.git"
fi

# STEP 2: Dowload the latest version of component on github.
#       Extract it and install its dependencies.
#     Generate the necessary files if absent.
node site_generator/list-elements.js | while read -r line
do
  name="${line%%:*}"
  line="${line#*:}"
  dir="${line%%:*}"
  dep="${line##*:}"
  dep="https://github.com/$dep/archive/master.tar.gz"

  dir="_site/$dir"

  if ! [[ -d "$dir" ]]
  then
    mkdir -p "$dir"
  fi

  if ! [[ -d "$dir/bower_components" ]]
  then
    pushd "$dir" &>/dev/null

    echo "Clone: $dep"
    curl "$dep" -L &>/dev/null >archive.tar.gz
    echo "Extract: $name-master"
    tar -xvf archive.tar.gz &>/dev/null
    ndir="$name-master"
    bow="$(readlink -f "$ndir/bower.json")"
    cp "$bow" ./
    echo "Install: $name"
    bower install &>/dev/null
    rm bower.json
    mv "$ndir" bower_components/"$name"

    popd &>/dev/null
  fi

  if ! [[ -f "$dir/bower_components/$name/property.json" ]]
  then
    echo "Create: property.json file for $name"
    node site_generator/generate-property.js "$dir/bower_components/$name"
  fi
done

# STEP 3: Generate the pages of site
node site_generator/build.js "$1"

# STEP 4: Generate the travis repo ids of the elements
if ! [[ -f "_site/element-ids.json" ]]; then
  node site_generator/get-element-ids.js
fi

# STEP 5: Copy the necessary things
for item in "${dirs[@]}"
do
  ifncp "$item"
done

# STEP 6: If in prod environment then vulcanize components
if [[ "$1" == "--prod" ]]
then
  node_modules/vulcanize/bin/vulcanize --inline-script --strip-comments components/elements.html | \
  node_modules/crisper/bin/crisper --script-in-head=false --html _site/components/elements.html --js _site/scripts/build.js
fi

echo ""
echo "Generate: complete"
