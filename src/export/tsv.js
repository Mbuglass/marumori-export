/** Tab-separated export with term/reading/definition columns. */
class TSVExporter {
  constructor(vocabulary = [], kanji = []) {
    this.vocabulary = vocabulary;
    this.kanji = kanji;
  }

  exportVocabulary() { return this.exportRows(this.vocabulary); }
  exportKanji() { return this.exportRows(this.kanji); }
  exportCombined() { return this.exportRows([...this.vocabulary, ...this.kanji]); }

  exportRows(items) {
    const headers = ['term', 'reading', 'definition'];
    const rows = items.map(item => [item.item, '', '']);
    return [headers, ...rows]
      .map(row => row.map(field => this.escapeTsvField(field)).join('\t'))
      .join('\n');
  }

  escapeTsvField(field) {
    const value = field === undefined || field === null ? '' : String(field);
    return value.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TSVExporter;
}
