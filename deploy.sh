#!/bin/bash

git pull
npm install .
npm run build
RESULT="$(echo hello my name is | cut -d' ' -f2)"
RESULT="$(ipfs add -r dist | cut -d' ' -f2)"
ipfs name publish $RESULT
