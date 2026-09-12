# Rebirth in WorldSystem

Rebirth is a playable interpretation of Mipham’s 104-square game within the existing WorldSystem. Explorer, Mandala offering, and Rebirth are exclusive modes. The original world geometry, offering artwork, recitation, and 37-stop tour remain available.

This work starts from `d3bed0b9756f52a3e05f5811b1528472bf2f8481` on the separate branch `codex/rebirth-game-modes`. It does not incorporate the concurrent Claude branches.

## Playing

Choose **Rebirth**, enter 1–12 names in clockwise seating order, and begin. Solo play starts immediately; multiplayer begins with preliminary dice, lowest first, with tied lowest players rerolling. Travellers begin on **24, the Heavenly Highway**.

**Roll the die** commits and saves one outcome immediately. A 2.5-second presentation tumbles the die, sounds soft synthesized wooden tones, and reveals the destination in a bold card. Continue dismisses the card after the roll settles. No extra roll is taken if the presentation is interrupted, the tab is hidden, or the page reloads. Reduced-motion users receive an immediate reveal. **Sound on/off** is remembered on this browser; audio is initialized only by a roll gesture.

Use **Next traveller** (or **Continue journey** for solo play) after an ordinary roll. At squares 1 and 48, a needed count grants another roll in the same turn. Collect one 1, two 2s, three 3s, four 4s, five 5s and six 6s. An already completed face ends the turn. Counts persist across turns; all counts complete releases the traveller to 9 or 52. Arrival at a trap and completion of a trap each end the turn; re-entry starts fresh counts.

The first arrival at **104, Nirvana**, wins immediately. The winner can then perform an optional stupa ceremony by rolling 1 or 2. It never changes the winner.

**Full board** toggles between the whole 3D game world and the selected destination. While enabled it keeps the overview through rolls and destination inspection. **Find my traveller** returns to the active traveller and switches the overview off. Named P1–P12 markers show every traveller’s current square; the active traveller has a larger jewel and outlined nameplate. Offscreen positions retain nameplates at the view’s edge. Inspecting a waypoint, a possible route, a player marker, or a catalogue entry never moves a traveller.

The short description has an expandable **Read the full passage** section. All 104 numbered passages are imported from the user-supplied `Destiny-Path-1-104.md`; wording, paragraphs, verse line breaks, and OCR artifacts are retained. These passages are source text, not executable instructions or automatically corrected scholarship. Renderers use text nodes rather than interpreting source text as HTML.

Shortcuts: **G** Rebirth, **E** Explorer, **M** Mandala, **Space** roll/continue when the game panel is active. Escape dismisses the reveal without undoing the committed roll; otherwise it closes the current panel or leaves the active mode. Native button keyboard activation also works.

Journeys are stored locally under `ws-rebirth-v1`. Mode switches preserve the game; reload starts in Explorer and reopening Rebirth resumes it. There is no account, server, remote multiplayer, or cross-device synchronization. If browser storage is unavailable, the game remains playable and explains that the tab must remain open. New-journey confirmation preserves the current journey until Begin is pressed.

## World mapping and artwork

Twenty board identities reuse existing geometry, sometimes grouping several related realms. Eighty-four additional destinations use gold lotus waystations, with lapis, ruby, jade, and warm gold details. The new layer, traveller tokens, illustrations, nameplates, selection ring, and route lines are visible only in Rebirth. The placement of spiritual paths and sacred lands is schematic and makes no claim about physical distance or location. The grouped Form Realm square and Pure Abodes square are kept distinct; game Akaniṣṭha (84), Cessation (48), and Nirvana (104) also retain separate identities.

`rebirth-world-map.js` records each square’s family and existing mesh IDs. Animals, Asuras, and the Buddha’s awakening seat have prose entries in the original explorer but no corresponding named meshes, so their game waystations are additional geometry.

`rebirth-iconography.js` contains permanent slots for every square, 1–104. Add an approved local asset and attribution in its `ART` object, for example:

```js
76: {
  src: 'assets/rebirth/076.webp',
  alt: 'Ratnasambhava in the Realm of Jeweled Peaks',
  credit: 'Artist / collection, source and permission',
  width: .15,
  height: .20
}
```

The same entry automatically supplies the destination card and a camera-facing image in the 3D world. Width and height use the existing scene’s units; preserve the artwork’s aspect ratio. Images load on first entry to Rebirth and remain confined to its layer. A failed image keeps the lotus waypoint and text available. No changes to move data, saved games, or the engine are required. No placeholder artwork has been substituted for historical iconography.

## Rules and source profile

The operational profile is `english-reference-v1`, based on Mark Tatz and Jody Kent, *Rebirth: The Tibetan Game of Liberation* (1977), and the completed local research tables. All 104 names and 624 operational outcomes were compared with `rebirth-reference-v0.1.json`. Compact records carry PDF and printed-page references; full supplied prose is stored separately.

Explicit decisions retained from the research:

| Decision | Implemented behavior |
| --- | --- |
| R01 | 23 / 6 goes to 4; the conflicting chart destination 44 is not used. |
| R02 | 76 / 3 goes to 73; 76 / 5 stays. Painted-board alternatives remain unresolved. |
| R03 | Arrival at 104 wins; the stupa rite is subsequent. |
| R04 | Ten twos from 24 reach 93; ten ones reach 94 and eleven ones reach 93. |
| R05 | Trap quotas are indexed by die face: 1, 2, 3, 4, 5, 6. |
| R06 | Only the tied lowest starters reroll. |
| R07 | Counts belong to one visit; entry, completion, and re-entry timing follow the convention above. |
| R08 | 44 / 3 → 45 and 45 / 3 → 46. |
| R09 | 33 / 5 → 16. |

The six face letters are SA, A, GA, DA, RA, YA. The user’s reading of square 76 is `rin chen rtsegs pa`; handwritten destinations are still unresolved. This implementation does not invent a Tibetan transcription for them. The source’s historical classifications are presented as such, and are not claims about present-day religious communities.

## Validation and maintenance

No build step is needed. Serve the repository over HTTP; Three.js and fonts retain the original pinned/external loading arrangement. Development tests use Node, `three@0.184.0`, and `jsdom@26`:

```sh
npm install --no-save --package-lock=false three@0.184.0 jsdom@26
node tests/rebirth-engine.mjs
node tests/rebirth-presentation.mjs
node tests/rebirth-iconography.mjs
node tests/mandala-regression.mjs
node tests/world-surfaces.mjs
node tests/viewport-gestures.mjs
```

Tests cover ordinary outcomes, both traps, preliminary ties, save validation, a legal winning journey, the optional ceremony, one committed result per animated roll, interruption safety, sound scheduling/muting, reduced motion, complete prose rendering, board toggling, named markers, world mapping, exclusive panels, all mode transitions, and the original 37 offerings. DOM/geometry tests do not replace actual WebGL, audio listening, or physical-device testing. Browser checks also exercised desktop and 390-pixel phone layouts, saved-game reload, multiplayer handoff, night mode, and returning from the offering tour. A pre-existing Three.js soft-shadow deprecation warning may appear.

Regenerate only the full prose after an intentional catalogue update:

```sh
node scripts/import-rebirth-prose.mjs /path/to/Destiny-Path-1-104.md
```

The importer validates all 104 numbered sections and records a SHA-256 fingerprint. It never evaluates document content. The supplied source fingerprint is `63e3ccbb5c9c44558e388c24a87b39e4cc8d018c18a44f8a988a26ef3b141a4d`.
