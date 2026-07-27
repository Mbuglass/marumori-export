const fs = require('fs');
const path = require('path');

describe('Tampermonkey distribution source', () => {
  const webpackConfig = fs.readFileSync(path.join(__dirname, '..', 'webpack.config.js'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'tampermonkey.js'), 'utf8');

  test('declares install metadata and the marumori.io scope', () => {
    expect(webpackConfig).toContain('// ==UserScript==');
    expect(webpackConfig).toContain('// @match        https://marumori.io/*');
    expect(webpackConfig).toContain('// @connect      public-api.marumori.io');
    expect(webpackConfig).toContain('// @grant        GM_xmlhttpRequest');
    expect(webpackConfig).toContain("filename: 'tampermonkey.user.js'");
  });

  test('supports vocabulary and kanji', () => {
    expect(source).toContain("client.getVocabulary");
    expect(source).toContain("client.getKanji");
  });
});
