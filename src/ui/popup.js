/**
 * Popup Script
 * Handles UI interactions and data export
 */

const MaruMoriClient = require('../api/client.js');
const CSVExporter = require('../export/csv.js');
const JSONExporter = require('../export/json.js');
const TSVExporter = require('../export/tsv.js');
const TextExporter = require('../export/text.js');

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveApiKey');
  const messageDiv = document.getElementById('message');
  const exportBtn = document.getElementById('exportBtn');
  const apiKeySection = document.getElementById('apiKeySection');
  const exportSection = document.getElementById('exportSection');
  const changeApiKeyBtn = document.getElementById('changeApiKey');
  const progressDiv = document.getElementById('progress');
  const contentTypeSelect = document.getElementById('contentType');
  const minLevelVocabularyGroup = document.getElementById('minLevelVocabularyGroup');
  const minLevelKanjiGroup = document.getElementById('minLevelKanjiGroup');
  const minLevelVocabularySelect = document.getElementById('minLevelVocabulary');
  const minLevelKanjiSelect = document.getElementById('minLevelKanji');

  // Check if API key is already stored
  checkApiKey();

  // Show only the level filter(s) relevant to the selected content type
  function updateLevelGroupVisibility() {
    const contentType = contentTypeSelect.value;
    minLevelVocabularyGroup.style.display = (contentType === 'vocabulary' || contentType === 'both') ? 'block' : 'none';
    minLevelKanjiGroup.style.display = (contentType === 'kanji' || contentType === 'both') ? 'block' : 'none';
  }
  contentTypeSelect.addEventListener('change', updateLevelGroupVisibility);
  updateLevelGroupVisibility();

  function checkApiKey() {
    chrome.storage.local.get(['marumoriApiKey'], (result) => {
      if (result.marumoriApiKey) {
        apiKeySection.style.display = 'none';
        exportSection.style.display = 'block';
      } else {
        apiKeySection.style.display = 'block';
        exportSection.style.display = 'none';
      }
    });
  }

  // Save API Key
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showMessage('Please enter an API key', 'error');
      return;
    }

    chrome.storage.local.set({ marumoriApiKey: apiKey }, () => {
      showMessage('API key saved successfully', 'success');
      setTimeout(() => {
        apiKeyInput.value = '';
        checkApiKey();
      }, 1000);
    });
  });

  // Change API Key
  changeApiKeyBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['marumoriApiKey'], () => {
      checkApiKey();
      showMessage('API key cleared', 'info');
    });
  });

  // Quick Export presets: set the relevant controls, then export immediately.
  const presets = {
    presetDailyReview: { contentType: 'both', minLevelVocabulary: '', minLevelKanji: '' },
    presetHighConfidence: { contentType: 'both', minLevelVocabulary: '5', minLevelKanji: '5' },
    presetVocabOnly: { contentType: 'vocabulary', minLevelVocabulary: '', minLevelKanji: '' },
    presetKanjiOnly: { contentType: 'kanji', minLevelVocabulary: '', minLevelKanji: '' }
  };

  Object.entries(presets).forEach(([buttonId, preset]) => {
    document.getElementById(buttonId).addEventListener('click', () => {
      contentTypeSelect.value = preset.contentType;
      minLevelVocabularySelect.value = preset.minLevelVocabulary;
      minLevelKanjiSelect.value = preset.minLevelKanji;
      updateLevelGroupVisibility();
      performExport();
    });
  });

  // Export Data
  exportBtn.addEventListener('click', performExport);

  async function performExport() {
    exportBtn.disabled = true;
    try {
      const minLevelVocabularyValue = minLevelVocabularySelect.value;
      const minLevelVocabulary = minLevelVocabularyValue ? parseInt(minLevelVocabularyValue, 10) : undefined;
      const minLevelKanjiValue = minLevelKanjiSelect.value;
      const minLevelKanji = minLevelKanjiValue ? parseInt(minLevelKanjiValue, 10) : undefined;
      const format = document.getElementById('exportFormat').value;
      const contentType = contentTypeSelect.value; // 'vocabulary' | 'kanji' | 'both'

      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(['marumoriApiKey'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      const apiKey = result.marumoriApiKey;
      if (!apiKey) {
        showMessage('API key not found', 'error');
        return;
      }

      progressDiv.style.display = 'block';

      const client = new MaruMoriClient(apiKey);
      let vocabulary = [];
      let kanji = [];

      if (contentType === 'vocabulary' || contentType === 'both') {
        document.getElementById('progressText').textContent = 'Fetching vocabulary...';
        vocabulary = await client.getVocabulary({ minLevel: minLevelVocabulary });
      }

      if (contentType === 'kanji' || contentType === 'both') {
        document.getElementById('progressText').textContent = 'Fetching kanji...';
        kanji = await client.getKanji({ minLevel: minLevelKanji });
      }

      document.getElementById('progressText').textContent = 'Preparing export...';

      let content;
      let mimeType;
      const extension = format === 'text' ? 'txt' : format;
      const filename = `marumori-${contentType}-export.${extension}`;

      if (format === 'csv') {
        const exporter = new CSVExporter(vocabulary, kanji);
        content = contentType === 'vocabulary' ? exporter.exportVocabulary()
          : contentType === 'kanji' ? exporter.exportKanji()
          : exporter.exportCombined();
        mimeType = 'text/csv';
      } else if (format === 'json') {
        const exporter = new JSONExporter(vocabulary, kanji);
        content = contentType === 'vocabulary' ? exporter.exportVocabulary()
          : contentType === 'kanji' ? exporter.exportKanji()
          : exporter.export();
        mimeType = 'application/json';
      } else if (format === 'text') {
        const exporter = new TextExporter(vocabulary, kanji);
        content = contentType === 'vocabulary' ? exporter.exportVocabulary()
          : contentType === 'kanji' ? exporter.exportKanji()
          : exporter.exportCombined();
        mimeType = 'text/plain;charset=utf-8';
      } else {
        const exporter = new TSVExporter(vocabulary, kanji);
        content = contentType === 'vocabulary' ? exporter.exportVocabulary()
          : contentType === 'kanji' ? exporter.exportKanji()
          : exporter.exportCombined();
        mimeType = 'text/tab-separated-values;charset=utf-8';
      }

      downloadFile(content, filename, mimeType);

      showMessage('Export complete', 'success');
      progressDiv.style.display = 'none';
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
      progressDiv.style.display = 'none';
    } finally {
      exportBtn.disabled = false;
    }
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    if (type !== 'error') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 3000);
    }
  }
});
