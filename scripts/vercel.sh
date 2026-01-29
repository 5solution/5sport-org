#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "main"  ]] ; then
  npm run build:prod && npm run postbuild
elif [[ $VERCEL_GIT_COMMIT_REF == "staging" ]] ; then
  npm run build:staging && npm run postbuild
else
  npm run build && npm run postbuild
fi
