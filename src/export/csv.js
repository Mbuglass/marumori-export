/**
 * CSV Export Format Handler
 */

class CSVExporter {
  constructor(vocabulary = [], kanji = []) {
    this.vocabulary = vocabulary;
    this.kanji = kanji;
  }

  /**
   * Export vocabulary to CSV format
   * @returns {string} CSV content
   */
  exportVocabulary() {
    const headers = ['item', 'level', 'id'];

    if (this.vocabulary.length === 0) {
      return headers.join(',') + '\n';
    }

    const rows = this.vocabulary.map(item => {
      const row = [
        this.escapeCsvField(item.item),
        item.level,
        this.escapeCsvField(item._id)
      ];
      return row;
    });

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Export kanji to CSV format
   * @returns {string} CSV content
   */
  exportKanji() {
    if (this.kanji.length === 0) {
      return 'item,level,id\n';
    }

    const headers = ['item', 'level', 'id'];
    const rows = this.kanji.map(item => [
      this.escapeCsvField(item.item),
      item.level,
      this.escapeCsvField(item._id)
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Export both vocabulary and kanji to combined CSV
   * @returns {string} CSV content with both types
   */
  exportCombined() {
    const headers = ['type', 'item', 'level', 'id'];
    const lines = [headers.join(',')];

    this.vocabulary.forEach(item => {
      const row = ['vocabulary', this.escapeCsvField(item.item), item.level, this.escapeCsvField(item._id)];
      lines.push(row.join(','));
    });

    this.kanji.forEach(item => {
      const row = ['kanji', this.escapeCsvField(item.item), item.level, this.escapeCsvField(item._id)];
      lines.push(row.join(','));
    });

    return lines.join('\n');
  }

  /**
   * Escape CSV field if it contains special characters
   */
  escapeCsvField(field) {
    if (typeof field !== 'string') return field;
    // Guard against CSV formula injection when opened in spreadsheet tools
    // Catch formulas at start or after leading whitespace
    if (/^\s*[=+\-@]/.test(field)) {
      field = `'${field}`;
    }
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSVExporter;
}
