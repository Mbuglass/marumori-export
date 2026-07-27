const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const tampermonkeyMetadata = `// ==UserScript==
// @name         MaruMori Export
// @namespace    https://github.com/Mbuglass/marumori-export
// @version      1.0.0
// @description  Export MaruMori vocabulary and kanji as JSON, CSV, TSV, or a plain text list
// @match        https://marumori.io/*
// @match        https://www.marumori.io/*
// @connect      public-api.marumori.io
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==`;
// Separate configs: the MV3 service worker (background.js) must be built
// with target 'webworker' (no `window`/`document`), while the popup script
// runs in a normal page context and can use the default 'web' target.
module.exports = [
  {
    name: 'background',
    target: 'webworker',
    entry: './src/background.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'background.js'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'src/ui/popup.html', to: 'popup.html' },
          { from: 'src/ui/popup.css', to: 'popup.css' },
          { from: 'src/images', to: 'images' }
        ]
      })
    ]
  },
  {
    name: 'popup',
    target: 'web',
    entry: './src/ui/popup.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'popup.js'
    }
  },
  {
    name: 'tampermonkey',
    target: 'web',
    entry: './src/tampermonkey.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tampermonkey.user.js',
      iife: true
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: tampermonkeyMetadata,
        raw: true,
        entryOnly: true,
        // Add userscript metadata after minimization so Terser cannot strip it.
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
      })
    ]
  }
];
