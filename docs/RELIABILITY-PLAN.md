# Prioritized reliability work — 6 November 2026

Baseline: `46288bffd3d087193bfaac7cae8d642ef1b58251`. These stages preserve
the 37-offering mandala, all 104 game fields, saved games and Tibetan/Sanskrit
text. Editorial changes remain subject to the owner's terminology decisions.

## 1. Make releases reach installed copies

This change regenerates the stale service worker, adds pinned development
dependencies, a single Node test command, CI, and a real Chromium worker
upgrade test. The test covers interrupted installation, an update waiting for
acceptance, new assets after reload, save/preference preservation, pending-die
recovery and offline access to the Polish packs and lazy artwork.

Acceptance: all automated checks pass; repository administrators require the
`Application checks` status on main; installed Safari/iPhone acceptance is
recorded with device, OS, tested revision and result. The workflow cannot
configure branch protection, and the existing Pages publisher remains separate.
Do not describe the new workflow as an enforced deployment gate until repository
settings or a checked Pages deployment workflow actually enforce it.

Validation for this change: all 34 Node suites passed on Node 24.22.1. The
upgrade suite passed in headless Chromium 138.0.7204.0 using the real worker
and updater in the documented minimal fixture. The normal Playwright browser
download was unavailable in this environment; a separately obtained Chromium
executable was used through `WORLDSYSTEM_CHROMIUM`. CI uses Playwright's pinned
browser. No WebGL, Safari, physical iPhone or full-app visual acceptance was
performed for this change.

## 2. Keep reading available when 3D fails

Extract an independently bootable, searchable text view for cosmology, the 37
offerings and all 104 game fields. Offer it when WebGL or module loading fails,
with an accurate error and a retry route. Do not duplicate the content sources.

Acceptance: deliberately deny WebGL and a renderer module request; the reader
can still find and read entries, choose English/Polish, enlarge text and navigate
by keyboard. Repeat offline. Normal 3D startup must retain its current behaviour.

## 3. Make language loading recoverable, then reversible

First add a visible error/retry state for the lazy Polish text pack, covering
both failed and stalled requests without retry loops. Then migrate from English
DOM-string replacement to keyed rendering in small sections. Preserve authored
Tibetan/Sanskrit and apply only approved editorial decisions.

Acceptance: a failed text request can be retried successfully; repeated language
changes do not reload or lose the selected mode/entry, camera, tour position or
saved game; no untranslated UI or missing long text in the agreed coverage list.

## 4. Make the board efficient with a keyboard and screen reader

Implement valid row/grid semantics with one tab stop and arrow-key movement,
or a native accessible list alternative. Preserve visible/hidden display-layer
choices while retaining the field number, name, player and turn announcements.

Acceptance: reach all 104 fields without 104 Tab presses, start/continue a game,
inspect a field and return focus. Test VoiceOver and larger text on a real phone.

## 5. Improve durability and measured performance

Add validated save export/import and a previous-save recovery path. Then measure
frame time and memory on representative phones before changing geometry/shadows
or preserved drawing buffers. Evaluate a small required offline shell plus
optional media with explicit readiness, retaining atomic release installation.

Acceptance: malformed imports do not overwrite a good save; pending dice remain
durable. Record performance measurements and before/after visual acceptance for
any reduced-detail option. Verify installed-app upgrades, storage pressure,
background recovery and offline use on Safari/iPhone separately from Chromium.

## Later security and maintenance work

Introduce and test a compatible Content Security Policy, narrow HTML sinks,
track vendored dependency advisories, and split mode/content orchestration out
of index.html incrementally. The audit did not establish a remotely exploitable
injection flaw; these are preventative improvements. Branch protection and
publishing permissions require an administrator's settings review.
