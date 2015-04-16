#!/bin/bash

# prepare a temporary file name
TMP_FILE=$$"_tmp"

# concatenate all js files
find ../app/ -name "*.js" | xargs cat > vector-video.js

# minify the script
uglifyjs vector-video.js > $TMP_FILE

# add the comment to the minified file
cat header.js $TMP_FILE > vector-video.min.js

# delete the tmp file
rm $TMP_FILE
