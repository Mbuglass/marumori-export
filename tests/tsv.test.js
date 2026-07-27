const TSVExporter = require('../src/export/tsv.js');

describe('TSVExporter', () => {
  test('exports vocabulary with term, reading and definition columns', () => {
    const exporter = new TSVExporter([{ item: '食べる', level: 5, _id: 'v1' }]);
    expect(exporter.exportVocabulary()).toBe(
      'term\treading\tdefinition\n食べる\t\t'
    );
  });

  test('combines item types and sanitizes delimiters', () => {
    const exporter = new TSVExporter([{ item: '言\t葉' }], [{ item: '語' }]);
    expect(exporter.exportCombined().split('\n')).toEqual([
      'term\treading\tdefinition',
      '言 葉\t\t',
      '語\t\t'
    ]);
  });

  test('exports a header for an empty selection', () => {
    expect(new TSVExporter().exportCombined()).toBe(
      'term\treading\tdefinition'
    );
  });
});
