#!/usr/bin/env bash

shopt -s extglob
shopt -s globstar
shopt -s nullglob

fswatch assets components includes layouts pages scripts styles templates | \
while read -r file; do
  file="${file#*/elements/}"

  if [[ "$prev" == "$file" ]] && ((counter < 1)); then
    ((++counter))
    continue
  fi

  ((counter = 0))

  case "$file" in
    styles/**)
      rm -rf _site/styles && cp -r styles _site
      echo "copy: styles"
    ;;

    scripts/**)
      rm -rf _site/scripts && cp -r scripts _site
      echo "copy: scripts"
    ;;

    components/**)
      rm -rf _site/components && cp -r components _site
      echo "copy: components"
    ;;

    assets/**)
      rm -rf _site/assets && cp -r assets _site
      echo "copy: assets"
    ;;
  esac

  prev="$file"
done
