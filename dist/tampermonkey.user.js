// ==UserScript==
// @name         MaruMori Export
// @namespace    https://github.com/Mbuglass/marumori-export
// @version      1.0.0
// @description  Export MaruMori vocabulary and kanji as JSON, CSV, TSV, or a plain text list
// @match        https://marumori.io/*
// @match        https://www.marumori.io/*
// @connect      public-api.marumori.io
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==
(() => {
  var e = {
    184(e) {
      e.exports &&
        (e.exports = class {
          constructor(e, t = fetch) {
            if (!e) throw new Error("API key is required.");
            ((this.apiKey = e),
              (this.fetch = t),
              (this.baseURL = "https://public-api.marumori.io"));
          }
          async request(e, t = {}) {
            const a = `${this.baseURL}${e}`,
              o = {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                ...t.headers,
              };
            try {
              const e = await this.fetch(a, {
                ...t,
                method: t.method || "GET",
                headers: o,
              });
              if (!e.ok) {
                if (401 === e.status || 403 === e.status)
                  throw new Error("Invalid API key or unauthorized access");
                throw new Error(`API error: ${e.status} ${e.statusText}`);
              }
              return await e.json();
            } catch (e) {
              throw (
                console.error(`MaruMori API request failed: ${e.message}`),
                e
              );
            }
          }
          async getHome() {
            return this.request("/home");
          }
          async getVocabulary(e = {}) {
            const t = new URLSearchParams();
            void 0 !== e.minLevel && t.append("min-level", e.minLevel);
            const a = t.toString(),
              o = "/known/vocabulary" + (a ? "?" + a : "");
            return (await this.request(o)).items;
          }
          async getKanji(e = {}) {
            const t = new URLSearchParams();
            void 0 !== e.minLevel && t.append("min-level", e.minLevel);
            const a = t.toString(),
              o = "/known/kanji" + (a ? "?" + a : "");
            return (await this.request(o)).items;
          }
        });
    },
    319(e) {
      e.exports &&
        (e.exports = class {
          constructor(e = [], t = []) {
            ((this.vocabulary = e), (this.kanji = t));
          }
          exportVocabulary() {
            const e = ["item", "level", "id"];
            return 0 === this.vocabulary.length
              ? e.join(",") + "\n"
              : [
                  e,
                  ...this.vocabulary.map((e) => [
                    this.escapeCsvField(e.item),
                    e.level,
                    this.escapeCsvField(e._id),
                  ]),
                ]
                  .map((e) => e.join(","))
                  .join("\n");
          }
          exportKanji() {
            return 0 === this.kanji.length
              ? "item,level,id\n"
              : [
                  ["item", "level", "id"],
                  ...this.kanji.map((e) => [
                    this.escapeCsvField(e.item),
                    e.level,
                    this.escapeCsvField(e._id),
                  ]),
                ]
                  .map((e) => e.join(","))
                  .join("\n");
          }
          exportCombined() {
            const e = [["type", "item", "level", "id"].join(",")];
            return (
              this.vocabulary.forEach((t) => {
                const a = [
                  "vocabulary",
                  this.escapeCsvField(t.item),
                  t.level,
                  this.escapeCsvField(t._id),
                ];
                e.push(a.join(","));
              }),
              this.kanji.forEach((t) => {
                const a = [
                  "kanji",
                  this.escapeCsvField(t.item),
                  t.level,
                  this.escapeCsvField(t._id),
                ];
                e.push(a.join(","));
              }),
              e.join("\n")
            );
          }
          escapeCsvField(e) {
            return "string" != typeof e
              ? e
              : (/^\s*[=+\-@]/.test(e) && (e = `'${e}`),
                e.includes(",") || e.includes('"') || e.includes("\n")
                  ? `"${e.replace(/"/g, '""')}"`
                  : e);
          }
        });
    },
    485(e) {
      e.exports &&
        (e.exports = class {
          constructor(e = [], t = []) {
            ((this.vocabulary = e), (this.kanji = t));
          }
          export() {
            const e = {
              exported: new Date().toISOString(),
              source: "MaruMori.io",
              type: "combined",
              vocabulary: this.vocabulary,
              kanji: this.kanji,
              stats: {
                vocabularyCount: this.vocabulary.length,
                kanjiCount: this.kanji.length,
                totalItems: this.vocabulary.length + this.kanji.length,
              },
            };
            return JSON.stringify(e, null, 2);
          }
          exportVocabulary() {
            const e = {
              exported: new Date().toISOString(),
              source: "MaruMori.io",
              type: "vocabulary",
              vocabulary: this.vocabulary,
              kanji: [],
              stats: {
                vocabularyCount: this.vocabulary.length,
                kanjiCount: 0,
                totalItems: this.vocabulary.length,
              },
            };
            return JSON.stringify(e, null, 2);
          }
          exportKanji() {
            const e = {
              exported: new Date().toISOString(),
              source: "MaruMori.io",
              type: "kanji",
              vocabulary: [],
              kanji: this.kanji,
              stats: {
                vocabularyCount: 0,
                kanjiCount: this.kanji.length,
                totalItems: this.kanji.length,
              },
            };
            return JSON.stringify(e, null, 2);
          }
        });
    },
    292(e) {
      e.exports &&
        (e.exports = class {
          constructor(e = [], t = []) {
            ((this.vocabulary = e), (this.kanji = t));
          }
          exportVocabulary() {
            return this.exportLines(this.vocabulary);
          }
          exportKanji() {
            return this.exportLines(this.kanji);
          }
          exportCombined() {
            return this.exportLines([...this.vocabulary, ...this.kanji]);
          }
          exportLines(e) {
            const t = e
              .map((e) => this.normalizeTerm(e.item))
              .filter((e) => "" !== e);
            return [...new Set(t)].join("\n");
          }
          normalizeTerm(e) {
            return (null == e ? "" : String(e)).replace(/\r?\n/g, " ").trim();
          }
        });
    },
    282(e) {
      e.exports &&
        (e.exports = class {
          constructor(e = [], t = []) {
            ((this.vocabulary = e), (this.kanji = t));
          }
          exportVocabulary() {
            return this.exportRows(this.vocabulary);
          }
          exportKanji() {
            return this.exportRows(this.kanji);
          }
          exportCombined() {
            return this.exportRows([...this.vocabulary, ...this.kanji]);
          }
          exportRows(e) {
            return [
              ["term", "reading", "definition"],
              ...e.map((e) => [e.item, "", ""]),
            ]
              .map((e) => e.map((e) => this.escapeTsvField(e)).join("\t"))
              .join("\n");
          }
          escapeTsvField(e) {
            return (null == e ? "" : String(e))
              .replace(/\t/g, " ")
              .replace(/\r?\n/g, " ");
          }
        });
    },
  };
  const t = {};
  function a(o) {
    const n = t[o];
    if (void 0 !== n) return n.exports;
    const r = (t[o] = { exports: {} });
    return (e[o](r, r.exports, a), r.exports);
  }
  const o = a(184),
    n = a(319),
    r = a(485),
    i = a(282),
    s = a(292),
    l = "marumoriApiKey",
    c = "marumori-export-panel";
  function u(e, t = {}) {
    return new Promise((a, o) => {
      GM_xmlhttpRequest({
        method: t.method || "GET",
        url: e,
        headers: t.headers || {},
        data: t.body,
        onload: (e) =>
          a({
            ok: e.status >= 200 && e.status < 300,
            status: e.status,
            statusText: e.statusText,
            json: async () => JSON.parse(e.responseText),
          }),
        onerror: () => o(new Error("Network request failed")),
        ontimeout: () => o(new Error("Network request timed out")),
      });
    });
  }
  async function p() {
    const e = document.getElementById(c);
    if (e) return void (e.hidden = !1);
    !(function () {
      if (document.getElementById(`${c}-styles`)) return;
      const e = document.createElement("style");
      ((e.id = `${c}-styles`),
        (e.textContent = `#${c}{position:fixed;z-index:2147483647;right:20px;top:20px;width:340px;max-height:calc(100vh - 40px);overflow:auto;padding:16px;border:1px solid #ccd8cc;border-radius:10px;background:#fff;color:#263226;box-shadow:0 8px 30px #0004;font:14px/1.4 system-ui,sans-serif}#${c} *{box-sizing:border-box}#${c} header{display:flex;justify-content:space-between;font-size:17px}#${c} label{display:block;margin:10px 0 4px;font-weight:600}#${c} input[type=password],#${c} select{display:block;width:100%;margin-top:4px;padding:7px;border:1px solid #bbb;border-radius:5px;background:#fff;color:#222}#${c} .check{font-weight:400}#${c} small{display:block;color:#667266}#${c} button{margin-top:14px;padding:8px 12px;border:0;border-radius:5px;cursor:pointer}#${c} .export{background:#388e3c;color:#fff;font-weight:600}#${c} header button{margin:0;background:transparent;font-size:22px}#${c} [role=status]{margin-top:10px}#${c} .error{color:#b42318}`),
        document.head.appendChild(e));
    })();
    const t = document.createElement("section");
    ((t.id = c), t.setAttribute("aria-label", "MaruMori export"));
    const a = ["", 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map(
        (e) =>
          `<option value="${e}">${e ? `${e}${9 === e ? " (Burned)" : " and above"}` : "All levels"}</option>`,
      )
      .join("");
    ((t.innerHTML = `<header><strong>MaruMori Export</strong><button data-action="close" aria-label="Close">×</button></header>\n<label>API key<input type="password" data-field="key" autocomplete="off"></label><small>Stored only in Tampermonkey.</small>\n<label>Content<select data-field="content"><option value="vocabulary">Vocabulary only</option><option value="kanji">Kanji only</option><option value="both">Vocabulary + kanji</option></select></label>\n<label data-group="vocabulary">Minimum vocabulary SRS level<select data-field="vocabLevel">${a}</select></label>\n<label data-group="kanji">Minimum kanji SRS level<select data-field="kanjiLevel">${a}</select></label>\n<label>Format<select data-field="format"><option value="json">JSON</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="text">Plain text (one per line)</option></select></label>\n<button class="export" data-action="export">Export data</button><button data-action="forget">Forget API key</button><div data-field="status" role="status" aria-live="polite"></div>`),
      document.body.appendChild(t));
    const p = (e) => t.querySelector(`[data-field="${e}"]`),
      d = p("status"),
      h = t.querySelector('[data-action="export"]');
    p("key").value = await GM_getValue(l, "");
    const b = () => {
      const e = p("content").value;
      ((t.querySelector('[data-group="vocabulary"]').hidden = "kanji" === e),
        (t.querySelector('[data-group="kanji"]').hidden = "vocabulary" === e));
    };
    (p("content").addEventListener("change", b),
      b(),
      t.querySelector('[data-action="close"]').addEventListener("click", () => {
        t.hidden = !0;
      }),
      t
        .querySelector('[data-action="forget"]')
        .addEventListener("click", async () => {
          (await GM_deleteValue(l),
            (p("key").value = ""),
            (d.textContent = "Stored API key removed."));
        }),
      h.addEventListener("click", async () => {
        d.className = "";
        const e = p("key").value.trim();
        if (!e)
          return (
            (d.className = "error"),
            void (d.textContent = "Enter your MaruMori API key.")
          );
        h.disabled = !0;
        try {
          await GM_setValue(l, e);
          const t = new o(e, u),
            a = p("content").value;
          let c = [],
            h = [];
          if ("kanji" !== a) {
            d.textContent = "Fetching vocabulary…";
            const e = p("vocabLevel").value;
            c = await t.getVocabulary({ minLevel: e ? Number(e) : void 0 });
          }
          if ("vocabulary" !== a) {
            d.textContent = "Fetching kanji…";
            const e = p("kanjiLevel").value;
            h = await t.getKanji({ minLevel: e ? Number(e) : void 0 });
          }
          const [b, v, m] = (function (e, t, a, o) {
            let l;
            return "csv" === o
              ? ((l = new n(e, t)),
                [
                  "vocabulary" === a
                    ? l.exportVocabulary()
                    : "kanji" === a
                      ? l.exportKanji()
                      : l.exportCombined(),
                  "csv",
                  "text/csv;charset=utf-8",
                ])
              : "tsv" === o
                ? ((l = new i(e, t)),
                  [
                    "vocabulary" === a
                      ? l.exportVocabulary()
                      : "kanji" === a
                        ? l.exportKanji()
                        : l.exportCombined(),
                    "tsv",
                    "text/tab-separated-values;charset=utf-8",
                  ])
                : "text" === o
                  ? ((l = new s(e, t)),
                    [
                      "vocabulary" === a
                        ? l.exportVocabulary()
                        : "kanji" === a
                          ? l.exportKanji()
                          : l.exportCombined(),
                      "txt",
                      "text/plain;charset=utf-8",
                    ])
                  : ((l = new r(e, t)),
                    [
                      "vocabulary" === a
                        ? l.exportVocabulary()
                        : "kanji" === a
                          ? l.exportKanji()
                          : l.export(),
                      "json",
                      "application/json",
                    ]);
          })(c, h, a, p("format").value);
          (!(function (e, t, a) {
            const o = URL.createObjectURL(new Blob([e], { type: a })),
              n = Object.assign(document.createElement("a"), {
                href: o,
                download: t,
              });
            (document.body.appendChild(n),
              n.click(),
              n.remove(),
              URL.revokeObjectURL(o));
          })(b, `marumori-${a}-export.${v}`, m),
            (d.textContent = `Export complete (${c.length} vocabulary, ${h.length} kanji).`));
        } catch (e) {
          ((d.className = "error"),
            (d.textContent = `Export failed: ${e.message}`));
        } finally {
          h.disabled = !1;
        }
      }));
  }
  (GM_registerMenuCommand("Open MaruMori Export", p), p());
})();