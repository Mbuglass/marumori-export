const TextExporter = require('../src/export/text.js');

describe('TextExporter', () => {
  test('exports vocabulary as one term per line with no headers', () => {
    const exporter = new TextExporter([
      { item: '食べる', level: 5, _id: 'v1' },
      { item: '飲む', level: 3, _id: 'v2' }
    ]);
    expect(exporter.exportVocabulary()).toBe('食べる\n飲む');
  });

  test('exports kanji only when asked for kanji', () => {
    const exporter = new TextExporter([{ item: '言葉' }], [{ item: '語' }]);
    expect(exporter.exportKanji()).toBe('語');
  });

  test('deduplicates terms shared between vocabulary and kanji', () => {
    const exporter = new TextExporter([{ item: '語' }, { item: '言葉' }], [{ item: '語' }]);
    expect(exporter.exportCombined().split('\n')).toEqual(['語', '言葉']);
  });

  test('flattens newlines and drops empty terms', () => {
    const exporter = new TextExporter([{ item: '言\n葉' }, { item: '  ' }, { item: null }]);
    expect(exporter.exportVocabulary()).toBe('言 葉');
  });

  test('exports nothing for an empty selection', () => {
    expect(new TextExporter().exportCombined()).toBe('');
  });
});
