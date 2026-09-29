# @fusionstrings/panchangam 0.2.1 (browser build)

`panchangam.js`, `panchangam.internal.js` and `panchangam.d.ts` are the files
JSR publishes as the `./browser` export of
[`jsr:@fusionstrings/panchangam@0.2.1`](https://jsr.io/@fusionstrings/panchangam@0.2.1),
byte for byte; `node scripts/vendor-panchangam.cjs` re-fetches them and checks
them against the hashes pinned in the import map in `index.html`.
`panchangam.js` carries the compiled WebAssembly inline, as base64.

Source: <https://github.com/fusionstrings/panchangam> (commit `ae3a05f`, version
0.2.1). The package declares its own code MIT. No licence file is published
with it or kept in its repository.

**The compiled WebAssembly also contains the Swiss Ephemeris**, by Astrodienst
AG (<https://www.astro.com/swisseph/>), version 2.10.03, linked through the
Rust crate [`swiss-eph` 0.2.1](https://crates.io/crates/swiss-eph)
(<https://github.com/fusionstrings/swiss-eph>). That crate is licensed
**AGPL-3.0**, as the Swiss Ephemeris itself is under its free licence (the
alternative being the Swiss Ephemeris Professional Licence from Astrodienst).
The AGPL's terms therefore apply to this binary regardless of the MIT label on
the package. The text of the licence is in `LICENSE-AGPL-3.0.txt`. The
corresponding source is the two repositories above and the Swiss Ephemeris
distribution. docs/LUNAR-MANSIONS-STATUS.md records what this means for the
site and what the owner has to decide.

At run time the Swiss Ephemeris data files are not present, and the library
falls back to its built-in Moshier ephemeris (the positions with `SEFLG_SWIEPH`
and `SEFLG_MOSEPH` are identical); the Moon is good to a few arcseconds.
