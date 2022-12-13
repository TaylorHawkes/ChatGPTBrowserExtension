#!/bin/bash

rm -rf build

npx esbuild src/content-script/index.mjs src/background/index.mjs --bundle --outdir=build

cp src/*.css build/
cp src/*.png build/
cp src/popup.* build/

cp -fr codemirror build/
cp -fr prism build/

MANIFEST_PATH=$([[ $1 == "firefox" ]] && echo "src/manifest.v2.json" || echo "src/manifest.json")
cp $MANIFEST_PATH build/manifest.json
