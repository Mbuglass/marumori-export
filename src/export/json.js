/**
 * JSON Export Format Handler
 */

class JSONExporter {
  constructor(vocabulary = [], kanji = []) {
    this.vocabulary = vocabulary;
    this.kanji = kanji;
  }

  /**
   * Export both vocabulary and kanji to JSON format
   * @returns {string} JSON string
   */
  export() {
    const data = {
      exported: new Date().toISOString(),
      source: 'MaruMori.io',
      type: 'combined',
      vocabulary: this.vocabulary,
      kanji: this.kanji,
      stats: {
        vocabularyCount: this.vocabulary.length,
        kanjiCount: this.kanji.length,
        totalItems: this.vocabulary.length + this.kanji.length
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export vocabulary only
   * @returns {string} JSON string
   */
  exportVocabulary() {
    const data = {
      exported: new Date().toISOString(),
      source: 'MaruMori.io',
      type: 'vocabulary',
      vocabulary: this.vocabulary,
      kanji: [],
      stats: {
        vocabularyCount: this.vocabulary.length,
        kanjiCount: 0,
        totalItems: this.vocabulary.length
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export kanji only
   * @returns {string} JSON string
   */
  exportKanji() {
    const data = {
      exported: new Date().toISOString(),
      source: 'MaruMori.io',
      type: 'kanji',
      vocabulary: [],
      kanji: this.kanji,
      stats: {
        vocabularyCount: 0,
        kanjiCount: this.kanji.length,
        totalItems: this.kanji.length
      }
    };

    return JSON.stringify(data, null, 2);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JSONExporter;
}
