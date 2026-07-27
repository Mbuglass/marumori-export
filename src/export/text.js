/** Plain text export: one term per line, no headers or metadata. */
class TextExporter {
  constructor(vocabulary = [], kanji = []) {
    this.vocabulary = vocabulary;
    this.kanji = kanji;
  }

  exportVocabulary() { return this.exportLines(this.vocabulary); }
  exportKanji() { return this.exportLines(this.kanji); }
  exportCombined() { return this.exportLines([...this.vocabulary, ...this.kanji]); }

  // Terms are deduplicated because a kanji can also be a vocabulary entry,
  // and a bare list has no type column to tell the two apart.
  exportLines(items) {
    const terms = items
      .map(item => this.normalizeTerm(item.item))
      .filter(term => term !== '');
    return [...new Set(terms)].join('\n');
  }

  normalizeTerm(term) {
    const value = term === undefined || term === null ? '' : String(term);
    return value.replace(/\r?\n/g, ' ').trim();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextExporter;
}
