/** Tampermonkey entry point; webpack adds the userscript metadata block. */
const MaruMoriClient = require('./api/client.js');
const CSVExporter = require('./export/csv.js');
const JSONExporter = require('./export/json.js');
const TSVExporter = require('./export/tsv.js');
const TextExporter = require('./export/text.js');

const KEY = 'marumoriApiKey';
const ID = 'marumori-export-panel';
function gmFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method || 'GET',
      url,
      headers: options.headers || {},
      data: options.body,
      onload: response => resolve({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        json: async () => JSON.parse(response.responseText)
      }),
      onerror: () => reject(new Error('Network request failed')),
      ontimeout: () => reject(new Error('Network request timed out'))
    });
  });
}
const levels = () => ['',1,2,3,4,5,6,7,8,9].map(value => `<option value="${value}">${value ? `${value}${value === 9 ? ' (Burned)' : ' and above'}` : 'All levels'}</option>`).join('');

function addStyles() {
  if (document.getElementById(`${ID}-styles`)) return;
  const style = document.createElement('style');
  style.id = `${ID}-styles`;
  style.textContent = `#${ID}{position:fixed;z-index:2147483647;right:20px;top:20px;width:340px;max-height:calc(100vh - 40px);overflow:auto;padding:16px;border:1px solid #ccd8cc;border-radius:10px;background:#fff;color:#263226;box-shadow:0 8px 30px #0004;font:14px/1.4 system-ui,sans-serif}#${ID} *{box-sizing:border-box}#${ID} header{display:flex;justify-content:space-between;font-size:17px}#${ID} label{display:block;margin:10px 0 4px;font-weight:600}#${ID} input[type=password],#${ID} select{display:block;width:100%;margin-top:4px;padding:7px;border:1px solid #bbb;border-radius:5px;background:#fff;color:#222}#${ID} .check{font-weight:400}#${ID} small{display:block;color:#667266}#${ID} button{margin-top:14px;padding:8px 12px;border:0;border-radius:5px;cursor:pointer}#${ID} .export{background:#388e3c;color:#fff;font-weight:600}#${ID} header button{margin:0;background:transparent;font-size:22px}#${ID} [role=status]{margin-top:10px}#${ID} .error{color:#b42318}`;
  document.head.appendChild(style);
}

function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function makeExport(vocabulary, kanji, contentType, format) {
  let exporter;
  if (format === 'csv') {
    exporter = new CSVExporter(vocabulary, kanji);
    return [contentType === 'vocabulary' ? exporter.exportVocabulary() : contentType === 'kanji' ? exporter.exportKanji() : exporter.exportCombined(), 'csv', 'text/csv;charset=utf-8'];
  }
  if (format === 'tsv') {
    exporter = new TSVExporter(vocabulary, kanji);
    return [contentType === 'vocabulary' ? exporter.exportVocabulary() : contentType === 'kanji' ? exporter.exportKanji() : exporter.exportCombined(), 'tsv', 'text/tab-separated-values;charset=utf-8'];
  }
  if (format === 'text') {
    exporter = new TextExporter(vocabulary, kanji);
    return [contentType === 'vocabulary' ? exporter.exportVocabulary() : contentType === 'kanji' ? exporter.exportKanji() : exporter.exportCombined(), 'txt', 'text/plain;charset=utf-8'];
  }
  exporter = new JSONExporter(vocabulary, kanji);
  return [contentType === 'vocabulary' ? exporter.exportVocabulary() : contentType === 'kanji' ? exporter.exportKanji() : exporter.export(), 'json', 'application/json'];
}

async function openPanel() {
  const existing = document.getElementById(ID);
  if (existing) { existing.hidden = false; return; }
  addStyles();
  const panel = document.createElement('section');
  panel.id = ID;
  panel.setAttribute('aria-label', 'MaruMori export');
  const options = levels();
  panel.innerHTML = `<header><strong>MaruMori Export</strong><button data-action="close" aria-label="Close">×</button></header>
<label>API key<input type="password" data-field="key" autocomplete="off"></label><small>Stored only in Tampermonkey.</small>
<label>Content<select data-field="content"><option value="vocabulary">Vocabulary only</option><option value="kanji">Kanji only</option><option value="both">Vocabulary + kanji</option></select></label>
<label data-group="vocabulary">Minimum vocabulary SRS level<select data-field="vocabLevel">${options}</select></label>
<label data-group="kanji">Minimum kanji SRS level<select data-field="kanjiLevel">${options}</select></label>
<label>Format<select data-field="format"><option value="json">JSON</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="text">Plain text (one per line)</option></select></label>
<button class="export" data-action="export">Export data</button><button data-action="forget">Forget API key</button><div data-field="status" role="status" aria-live="polite"></div>`;
  document.body.appendChild(panel);
  const field = name => panel.querySelector(`[data-field="${name}"]`);
  const status = field('status');
  const button = panel.querySelector('[data-action="export"]');
  field('key').value = await GM_getValue(KEY, '');
  const visibility = () => {
    const type = field('content').value;
    panel.querySelector('[data-group="vocabulary"]').hidden = type === 'kanji';
    panel.querySelector('[data-group="kanji"]').hidden = type === 'vocabulary';
  };
  field('content').addEventListener('change', visibility); visibility();
  panel.querySelector('[data-action="close"]').addEventListener('click', () => { panel.hidden = true; });
  panel.querySelector('[data-action="forget"]').addEventListener('click', async () => { await GM_deleteValue(KEY); field('key').value = ''; status.textContent = 'Stored API key removed.'; });
  button.addEventListener('click', async () => {
    status.className = '';
    const apiKey = field('key').value.trim();
    if (!apiKey) { status.className = 'error'; status.textContent = 'Enter your MaruMori API key.'; return; }
    button.disabled = true;
    try {
      await GM_setValue(KEY, apiKey);
      const client = new MaruMoriClient(apiKey, gmFetch);
      const contentType = field('content').value;
      let vocabulary = [], kanji = [];
      if (contentType !== 'kanji') { status.textContent = 'Fetching vocabulary…'; const value = field('vocabLevel').value; vocabulary = await client.getVocabulary({ minLevel: value ? Number(value) : undefined }); }
      if (contentType !== 'vocabulary') { status.textContent = 'Fetching kanji…'; const value = field('kanjiLevel').value; kanji = await client.getKanji({ minLevel: value ? Number(value) : undefined }); }
      const [content, extension, mime] = makeExport(vocabulary, kanji, contentType, field('format').value);
      download(content, `marumori-${contentType}-export.${extension}`, mime);
      status.textContent = `Export complete (${vocabulary.length} vocabulary, ${kanji.length} kanji).`;
    } catch (error) { status.className = 'error'; status.textContent = `Export failed: ${error.message}`; }
    finally { button.disabled = false; }
  });
}

GM_registerMenuCommand('Open MaruMori Export', openPanel);
openPanel();
