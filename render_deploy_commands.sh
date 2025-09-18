#!/bin/bash
rm -rf node_modules package-lock.json
npm install
git add .gitignore package.json
git commit -m "Clean environment and update Node version"
git push
