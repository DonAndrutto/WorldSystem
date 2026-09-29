# astronomy-engine 2.1.19

`astronomy.js` is the ES-module build (`esm/astronomy.js`) of the npm package
[`astronomy-engine@2.1.19`](https://www.npmjs.com/package/astronomy-engine),
byte for byte; `node scripts/vendor-astronomy-engine.cjs` re-fetches it and
checks it against the hash pinned in the import map in `index.html`.

Source: <https://github.com/cosinekitty/astronomy>. Copyright (c) 2019–2023
Don Cross. **MIT License** — the full licence text is at the head of
`astronomy.js` itself and travels with it. The package has no dependencies.
It is the only engine the Jyotiṣa calculator uses; only `jyotisha-engine.js`
imports it.
