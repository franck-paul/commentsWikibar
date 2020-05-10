#!/bin/sh

# To be run from main plugin folder
for file in src/*
do
  filename=$(basename -- "$file")
  extension="${filename##*.}"
  filename="${filename%.*}"
  if [ "$extension" = "css" ] || [ "$extension" = "js" ]; then
    echo "$file" → "$filename".min."$extension"
    minify "$file" > "$filename".min."$extension"
  fi
done
