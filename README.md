# MaruMori Export

Export your learned vocabulary and kanji from [MaruMori.io](https://marumori.io) as JSON, CSV, TSV,
or a plain text word list, for use in other language learning tools.

Available as a Chrome/Edge extension or as a Tampermonkey userscript that adds an export panel to
marumori.io. Both run entirely in your browser: your API key is stored locally and the only server
contacted is MaruMori's own API.

## Features

- Export vocabulary, kanji, or both
- Filter by minimum SRS level, set independently for vocabulary and kanji
- Four output formats, including a plain word list with no headers or metadata
- Quick Export presets for the common combinations

## Installation

### Tampermonkey userscript

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open [`dist/tampermonkey.user.js`](dist/tampermonkey.user.js) and click **Raw** — Tampermonkey
   will offer to install it. Alternatively, download the file and use Tampermonkey's
   **Utilities → Import from file**.
3. Visit `https://marumori.io`. The export panel opens automatically, and can be reopened from
   Tampermonkey's **Open MaruMori Export** menu command.

### Browser extension (unpacked)

1. `npm install && npm run build`
2. Go to `chrome://extensions/` and enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.

For Firefox, go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and
select `dist/manifest.json`.

## Usage

Get your API key from your [MaruMori account settings](https://marumori.io/settings) and paste it
into the panel. It's stored in extension storage (or Tampermonkey storage for the userscript) and
is only ever sent to `public-api.marumori.io`.

Then pick what to export, optionally raise the minimum SRS level to exclude items you've only just
started learning, choose a format, and export. The file downloads directly.

## Export formats

Kanji and vocabulary are tracked separately by MaruMori — you can know a kanji without knowing any
of the words that use it — so each is filtered by its own SRS level.

### JSON

Full structured data, including SRS levels, item IDs and counts:

```json
{
  "exported": "2026-01-01T00:00:00.000Z",
  "source": "MaruMori.io",
  "type": "combined",
  "vocabulary": [
    { "item": "単語", "level": 5, "_id": "Vocab/..." }
  ],
  "kanji": [
    { "item": "語", "level": 3, "_id": "Kanji/..." }
  ],
  "stats": { "vocabularyCount": 1, "kanjiCount": 1, "totalItems": 2 }
}
```

### CSV

One row per item. A combined export gains a leading `type` column:

```csv
type,item,level,id
vocabulary,単語,5,Vocab/...
kanji,語,3,Kanji/...
```

### TSV

Tab-separated, with the `term`, `reading` and `definition` columns that word-list importers
usually expect. Reading and definition are always empty — MaruMori's known-items endpoints return
the term and SRS level only, so there is nothing to put in them. Map the columns during import.

```
term	reading	definition
単語		
語		
```

### Plain text

Just the terms, one per line, with no header row and no other columns — for tools that take a bare
word list. Terms are deduplicated, so a kanji that is also a vocabulary entry appears once:

```
単語
語
```

## Development

Requires Node.js 14+.

```bash
npm install
npm run build    # production build into dist/
npm run dev      # development build, rebuilt on change
npm test         # run tests
npm run lint     # lint src/
```

`npm run build` produces three things in `dist/`: the unpacked extension (`manifest.json`,
`popup.*`, `background.js`, `images/`) and the standalone userscript `tampermonkey.user.js`.

The userscript bundle is committed to the repository so it can be installed straight from GitHub,
so **rebuild and commit it whenever you change anything under `src/`** — otherwise the installable
script drifts from the source.

### Layout

```
src/
├── api/client.js       # MaruMori API client
├── export/             # One module per output format
│   ├── csv.js
│   ├── json.js
│   ├── text.js
│   └── tsv.js
├── ui/                 # Extension popup
│   ├── popup.css
│   ├── popup.html
│   └── popup.js
├── background.js       # MV3 service worker (also the static-asset entry point)
└── tampermonkey.js     # Userscript entry point; builds the on-page panel
```

The API client and the exporters are shared by both builds; only the UI layer differs.

## API

Uses the MaruMori Public API v1, documented in
[this gist](https://gist.github.com/Eearslya/d233379c1743f32b4bada4afa542c208):

| Endpoint | Purpose |
|----------|---------|
| `GET /known/vocabulary` | Learned vocabulary with SRS levels |
| `GET /known/kanji` | Learned kanji with SRS levels |

Both accept an optional `min-level` parameter and authenticate with an
`Authorization: Bearer <api-key>` header.

## Contributing

Issues and pull requests are welcome. Please run `npm test` and `npm run lint` before opening a PR,
and rebuild `dist/tampermonkey.user.js` if you've changed anything under `src/`.

## License

MIT — see [LICENSE](LICENSE).

---

This is an unofficial tool. It is not affiliated with or endorsed by MaruMori. Use it in accordance
with MaruMori's terms of service.
