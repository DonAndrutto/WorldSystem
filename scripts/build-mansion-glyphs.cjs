// Run with `node scripts/build-mansion-glyphs.cjs [--compare]` (development
// dependency: sharp).
//
// The twenty-eight lunar mansions, drawn. Each glyph is authored below as a
// small SVG drawing of the form the White Beryl passage gives (see
// lunar-mansions.js and docs/WHITE-BERYL-LUNAR-MANSIONS.md), written out to
// assets/mansions/src/<id>.svg as the editable source, and rasterised to the
// served texture assets/mansions/<id>.webp. With --compare it also writes the
// PNG beside each WebP in the scratch directory named by MANSION_PNG_DIR (or
// assets/mansions/png-compare/), and prints both sizes, so the choice of format
// can be checked again after any change.
//
// One hand for all of them: a single ink line of one weight, one gold fill,
// on a soft ivory halo that keeps a glyph legible over the day sky and the
// night sky alike. The ring round each glyph is solid where the form is read
// in the supplied White Beryl OCR and dashed where it follows the secondary
// table (the four lost openings), so provenance shows without colour. Small
// gold nodes along the foot of the ring give the star count where the OCR
// makes it legible, and nothing where it does not; they are a count, not
// the stars' positions, which the text does not give.
//
// These are contemporary drawings from textual descriptions, not copies of
// any painted or printed witness. ARTWORK.md records what each one follows.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/mansions');
const src = path.join(out, 'src');
const SIZE = 256;
// Quantised to a 256-colour palette and then stored losslessly: for flat
// two-tone line art that is indistinguishable from the full-colour render at
// twice the served size, and about a third of lossy WebP's weight (the soft
// alpha of anti-aliased edges is what lossy WebP spends its bytes on).
const PALETTE_QUALITY = 90;

const INK = '#2b2a40';
const GOLD = '#e3bf66';
const PALE = '#f3e3b4';
const W = 7;                         // the one line weight, in a 256 box

// the mansions' ids, orders, readable counts and provenance, from the catalogue
async function catalogue() {
  const { MANSIONS } = await import(require('node:url').pathToFileURL(path.join(root, 'lunar-mansions.js')));
  return MANSIONS;
}

const f = (d, fill = GOLD) => `<path d="${d}" fill="${fill}"/>`;
const l = (d) => `<path d="${d}" fill="none"/>`;
const c = (x, y, r, fill = GOLD) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const dot = (x, y, r = 4.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>`;
const mirror = (s) => `<g transform="translate(256 0) scale(-1 1)">${s}</g>`;
const flower = (x, y, r = 12) => {
  let p = '';
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    p += c((x + Math.cos(a) * r * 0.9).toFixed(1), (y + Math.sin(a) * r * 0.9).toFixed(1), (r * 0.62).toFixed(1));
  }
  return `<g stroke-width="5">${p}${c(x, y, r * 0.55, PALE)}</g>`;
};

/* The drawings. Coordinates in a 256 box; the glyph keeps within the ring
   (radius 110) and clear of the foot, where the star nodes go. */
const GLYPHS = {
  // rta mgo'i mgul — horse head and neck, in profile
  lm_tha_skar: () =>
    f('M170 184 C174 142 170 98 152 72 L150 46 L138 62 C122 64 102 76 86 92 C73 105 60 112 60 125 C60 136 73 140 87 135 C101 131 111 131 119 139 C127 150 129 168 127 184 Z') +
    l('M161 78 l15 7 M167 98 l15 5 M171 118 l15 3 M173 138 l15 1 M174 158 l15 0') +
    dot(111, 92) + l('M70 122 q6 -4 10 1'),
  // mo mtshan dbyibs — the female form, kept to a plain symbolic almond
  lm_bra_nye: () =>
    f('M128 42 C168 78 168 146 128 182 C88 146 88 78 128 42 Z') +
    l('M128 74 L128 150'),
  // spu gri'i dbyibs — razor: blade, pivot and handle
  lm_smin_drug: () =>
    `<g transform="rotate(-34 128 112)">` +
    `<g transform="rotate(30 74 110)">` +
    f('M22 102 H74 Q82 102 82 110 Q82 118 74 118 H22 Q14 118 14 110 Q14 102 22 102 Z') + `</g>` +
    f('M66 92 H182 C196 92 204 102 198 116 L188 132 H66 Z', PALE) + l('M72 125 H186') +
    c(74, 110, 7, INK) + `</g>`,
  // (secondary) cart — an ox-cart: a slatted box on two solid wheels, pole and yoke
  lm_snar_ma: () =>
    f('M80 86 H182 V132 H80 Z', PALE) + l('M100 86 V132 M121 86 V132 M142 86 V132 M162 86 V132') +
    l('M80 122 L36 134 M36 118 V150') +
    c(104, 148, 23) + dot(104, 148, 6) + c(160, 148, 23) + dot(160, 148, 6),
  // ri dwags mgo — deer head, facing out, with antlers
  lm_mgo: () => {
    const half = l('M116 98 C112 78 104 62 92 44 M108 72 C98 70 88 64 80 54 M101 60 C102 50 106 42 112 36') +
      f('M100 110 C84 104 70 108 62 118 C76 124 92 122 102 118 Z', PALE);
    return half + mirror(half) +
      f('M128 178 C112 178 100 152 96 126 C94 108 106 96 128 96 C150 96 162 108 160 126 C156 152 144 178 128 178 Z') +
      dot(113, 128) + dot(143, 128) + `<ellipse cx="128" cy="166" rx="9" ry="6" fill="${INK}"/>`;
  },
  // thig le'i dbyibs — a point, a round spot
  lm_lag: () => `<circle cx="128" cy="112" r="56" fill="none" stroke-width="4"/>` + c(128, 112, 34),
  // khri rkang dbyibs — one throne leg, turned and footed
  lm_nabs_so: () =>
    f('M96 48 H160 V68 H96 Z', PALE) +
    f('M108 68 H148 C152 88 140 98 142 112 C144 128 154 138 150 152 L162 176 H94 L106 152 C102 138 112 128 114 112 C116 98 104 88 108 68 Z') +
    l('M112 112 H144 M104 152 H152'),
  // ril ba'i dbyibs — a rounded form (a cautious reading of a fragment)
  lm_rgyal: () =>
    `<ellipse cx="128" cy="170" rx="36" ry="6" fill="${INK}" opacity=".3" stroke="none"/>` +
    `<ellipse cx="128" cy="112" rx="48" ry="46" fill="${GOLD}"/>` +
    l('M98 96 A36 36 0 0 1 126 74'),
  // (secondary) expanded serpent hood
  lm_skag: () =>
    f('M114 170 C92 172 80 184 92 192 C110 202 150 202 166 192 C178 184 164 172 142 170 Z', PALE) +
    f('M128 44 C152 44 164 60 168 76 C186 88 196 108 188 130 C182 148 160 160 144 164 L140 184 H116 L112 164 C96 160 74 148 68 130 C60 108 70 88 88 76 C92 60 104 44 128 44 Z') +
    l('M86 104 Q128 118 170 104 M84 126 Q128 142 172 126 M96 146 Q128 158 160 146') +
    `<ellipse cx="128" cy="72" rx="15" ry="19" fill="${PALE}"/>` + dot(121, 66, 3.2) + dot(135, 66, 3.2) +
    `<path d="M128 91 V104 M128 104 l-6 7 M128 104 l6 7" fill="none" stroke-width="3.2"/>`,
  // chu bo 'dra — like a river
  lm_mchu: () =>
    f('M44 98 C76 74 108 122 140 98 C172 74 196 108 212 94 V130 C196 144 172 110 140 134 C108 158 76 110 44 134 Z') +
    l('M54 116 C82 98 110 136 138 116 C166 96 190 126 204 114'),
  // mi rkang lta bu — like a human leg
  lm_gre: () =>
    f('M114 42 H148 C150 78 146 102 150 126 C152 146 150 162 152 172 L190 178 C198 180 198 192 190 194 H130 C120 194 118 184 120 176 C124 158 120 140 116 126 C110 100 110 70 114 42 Z') +
    l('M118 112 Q134 118 148 110'),
  // khri'i dbyibs — a throne
  lm_dbo: () =>
    f('M76 120 V66 C76 52 180 52 180 66 V120 Z', PALE) +
    f('M66 140 H84 V178 H66 Z M172 140 H190 V178 H172 Z') +
    f('M58 118 H198 V140 H58 Z') + l('M84 154 Q128 170 172 154 M88 104 H168'),
  // lag pa'i dbyibs — a hand, open
  lm_me_bzhi: () =>
    `<rect x="148" y="62" width="19" height="58" rx="9.5" fill="${GOLD}"/>` +
    `<rect x="128" y="48" width="19" height="72" rx="9.5" fill="${GOLD}"/>` +
    `<rect x="108" y="42" width="19" height="78" rx="9.5" fill="${GOLD}"/>` +
    `<rect x="88" y="54" width="19" height="66" rx="9.5" fill="${GOLD}"/>` +
    f('M88 112 H167 V150 C167 172 151 184 128 184 C104 184 88 172 88 150 Z') +
    f('M90 146 C78 138 62 124 55 110 C51 100 62 93 71 100 C79 108 85 116 92 124 Z'),
  // (secondary) lotus seed-head, its fruit
  lm_nag_pa: () =>
    l('M128 146 C125 166 131 180 128 196') +
    f('M78 78 C80 112 104 142 128 148 C152 142 176 112 178 78 Z') +
    `<ellipse cx="128" cy="78" rx="50" ry="18" fill="${PALE}"/>` +
    dot(128, 78) + dot(106, 75) + dot(150, 75) + dot(116, 86) + dot(140, 86) + dot(96, 84, 3.5) + dot(160, 84, 3.5) + dot(128, 66, 3.5),
  // nor bu'i dbyibs — a jewel, faceted
  lm_sa_ri: () =>
    f('M80 92 L104 62 H152 L176 92 L128 172 Z') + f('M104 62 L116 92 L128 62 L140 92 L152 62 Z', PALE) +
    l('M80 92 H176 M116 92 L128 172 L140 92'),
  // ra mgo'i dbyibs — a goat's head (the OCR's ri mgo, corrected)
  lm_sa_ga: () => {
    const half = f('M112 90 C100 64 78 54 62 64 C76 66 90 74 98 94 Z') +
      f('M102 110 C88 108 74 114 68 122 C82 126 96 122 104 118 Z', PALE);
    return half + mirror(half) +
      f('M128 178 C114 178 106 160 104 140 L100 106 C100 94 112 86 128 86 C144 86 156 94 156 106 L152 140 C150 160 142 178 128 178 Z') +
      f('M118 172 L128 200 L138 172 Z', PALE) + dot(116, 120) + dot(140, 120);
  },
  // glang po'i dbyibs — an elephant, in profile
  lm_lha_mtshams: () =>
    f('M114 140 H132 V180 H114 Z M140 146 H156 V180 H140 Z M166 146 H182 V180 H166 Z M188 134 H202 V178 H188 Z') +
    `<ellipse cx="152" cy="122" rx="54" ry="36" fill="${GOLD}"/>` +
    l('M204 114 C214 122 216 138 211 150') +
    c(96, 102, 31) +
    f('M78 108 C64 128 62 158 78 180 L92 176 C82 158 84 132 96 118 Z') +
    f('M100 84 C124 82 132 110 120 130 C108 134 96 124 94 112 Z', PALE) +
    `<path d="M82 122 C92 134 104 136 112 130" fill="none" stroke="${PALE}" stroke-width="6"/>` +
    l('M82 122 C92 134 104 136 112 130') + dot(86, 96),
  // them skas dbyibs — steps, a ladder
  lm_snon: () =>
    `<path d="M88 186 L108 44 M168 186 L148 44" fill="none" stroke-width="11"/>` +
    l('M103 76 H153 M99 104 H157 M95 132 H161 M91 160 H165'),
  // sdig pa'i dbyibs — a scorpion, from above
  lm_snubs: () => {
    const half = l('M116 76 C98 68 86 56 80 42') +
      f('M80 42 C66 36 60 50 70 56 L76 50 C74 46 78 42 84 46 Z') +
      l('M108 100 L84 92 M106 112 L80 112 M106 124 L82 134 M110 134 L90 150');
    return half + mirror(half) +
      `<path d="M128 138 C128 168 136 184 152 184 C168 184 172 168 164 158" fill="none" stroke-width="24"/>` +
      `<path d="M128 138 C128 168 136 184 152 184 C168 184 172 168 164 158" fill="none" stroke="${GOLD}" stroke-width="11"/>` +
      f('M164 158 L176 148 L158 150 Z', INK) +
      `<ellipse cx="128" cy="112" rx="22" ry="30" fill="${GOLD}"/>` + `<ellipse cx="128" cy="76" rx="16" ry="12" fill="${PALE}"/>` +
      l('M108 104 H148 M107 118 H149');
  },
  // mchod rten dbyibs — a stūpa
  lm_chu_stod: () =>
    f('M70 166 H186 V182 H70 Z M80 152 H176 V166 H80 Z M90 140 H166 V152 H90 Z', PALE) +
    f('M96 140 C96 106 108 90 128 90 C148 90 160 106 160 140 Z') +
    f('M113 80 H143 V90 H113 Z', PALE) +
    f('M118 80 L122 50 H134 L138 80 Z') + l('M120 70 H136 M121 61 H135') +
    f('M110 50 Q128 38 146 50 Z', PALE) + c(128, 30, 5) + l('M118 36 Q128 46 138 36'),
  // bre lta bu — a grain measure, heaped with grain ("life-star of grain")
  lm_chu_smad: () =>
    f('M92 104 C100 64 156 58 182 96 Z') +
    dot(118, 86, 3) + dot(138, 80, 3) + dot(156, 88, 3) + dot(128, 96, 3) + dot(108, 98, 3) + dot(166, 98, 3) +
    f('M84 104 H172 L162 174 H94 Z', PALE) + f('M172 104 L194 88 L184 158 L162 174 Z') +
    l('M89 138 H167'),
  // bre lta bu — a grain measure, empty, its inside showing
  lm_gro_bzhin: () =>
    f('M84 104 L106 86 H194 L172 104 Z', INK) + l('M84 104 L106 86 H194 L172 104 Z') +
    f('M84 104 H172 L162 174 H94 Z', PALE) + f('M172 104 L194 86 L184 158 L162 174 Z') +
    l('M89 138 H167'),
  // dbyibs glang mgo — an ox head
  lm_byi_bzhin: () => {
    const half = f('M102 94 C82 94 62 80 56 54 C70 70 86 76 106 80 Z') +
      f('M98 108 C82 106 68 112 62 120 C76 124 90 120 100 116 Z', PALE);
    return half + mirror(half) +
      f('M128 182 C106 182 96 166 96 148 L92 106 C92 94 106 84 128 84 C150 84 164 94 164 106 L160 148 C160 166 150 182 128 182 Z') +
      `<ellipse cx="128" cy="164" rx="24" ry="15" fill="${PALE}"/>` + dot(119, 164, 3.5) + dot(137, 164, 3.5) +
      dot(112, 120) + dot(144, 120) + l('M110 100 Q128 108 146 100');
  },
  // bya lta bu — like a bird
  lm_mon_dre: () =>
    l('M110 146 L106 172 M126 146 L128 172 M86 174 H150') +
    f('M76 108 C76 86 94 72 114 76 C134 80 148 94 160 110 L202 136 L196 148 L152 134 C140 148 118 152 100 146 C86 140 76 126 76 108 Z') +
    f('M78 90 L56 96 L78 102 Z', PALE) +
    f('M108 106 C130 100 152 112 170 130 C146 132 124 128 108 118 Z', PALE) + dot(92, 92),
  // me tog phung dbyibs — a heap of flowers
  lm_mon_gru: () =>
    l('M66 186 H190') +
    flower(90, 162, 12.5) + flower(128, 164, 12.5) + flower(166, 162, 12.5) +
    flower(109, 125, 12.5) + flower(147, 125, 12.5) + flower(128, 88, 12.5) +
    l('M112 146 l-6 4 M144 146 l6 4 M128 108 v6'),
  // shing rta'i dbyibs — a cart: a chariot on one spoked wheel
  lm_khrums_stod: () =>
    l('M176 118 L220 104 M216 92 L224 116') +
    f('M84 106 H178 V122 H84 Z', PALE) + l('M92 106 C86 84 96 68 112 64 M170 106 V76') +
    c(118, 142, 36) + c(118, 142, 9, INK) +
    l('M118 106 V178 M82 142 H154 M93 117 L143 167 M143 117 L93 167'),
  // (secondary) an ear
  lm_khrums_smad: () =>
    f('M144 46 C104 42 84 74 86 104 C88 126 102 136 106 152 C110 172 122 188 142 184 C158 180 162 164 154 154 C146 144 150 132 162 118 C176 100 178 74 166 58 C160 50 152 47 144 46 Z') +
    l('M126 76 C150 70 160 90 150 104 C142 116 128 116 124 130 C122 140 130 146 136 150'),
  // gru dbyibs — a boat
  lm_nam_gru: () =>
    l('M128 132 V60') + f('M134 64 V122 H180 Z', PALE) +
    f('M42 118 C58 116 72 124 80 132 H176 C184 124 198 116 214 118 C206 150 182 166 128 166 C74 166 50 150 42 118 Z') +
    l('M60 142 C90 152 166 152 196 142') +
    `<path d="M58 184 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke-width="4"/>`
};

// the count, as small nodes along the foot of the ring (32 go round it)
function starNodes(n) {
  if (!n) return '';
  let s = '';
  if (n > 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI * 1.72 / n);
      s += `<circle cx="${(128 + Math.cos(a) * 110).toFixed(1)}" cy="${(128 + Math.sin(a) * 110).toFixed(1)}" r="3.4" fill="${GOLD}" stroke="${INK}" stroke-width="1.6"/>`;
    }
    return s;
  }
  const step = 11 * Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i - (n - 1) / 2) * step;
    s += `<circle cx="${(128 + Math.cos(a) * 98).toFixed(1)}" cy="${(128 + Math.sin(a) * 98).toFixed(1)}" r="5.2" fill="${GOLD}" stroke="${INK}" stroke-width="2.2"/>`;
  }
  return s;
}

function svg(m) {
  const secondary = m.provenance === 'secondary';
  const nodes = m.stars.readable || 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 256 256">
<!-- ${m.id}: ${m.wylie} / ${m.sanskrit} — ${m.form.en} (${m.provenance}; White Beryl L:${m.source.line}, p. ${m.source.page}) -->
<defs><radialGradient id="h"><stop offset="0" stop-color="#fbf6e8" stop-opacity=".84"/><stop offset=".86" stop-color="#fbf6e8" stop-opacity=".84"/><stop offset="1" stop-color="#fbf6e8" stop-opacity="0"/></radialGradient></defs>
<circle cx="128" cy="128" r="127" fill="url(#h)"/>
<circle cx="128" cy="128" r="110" fill="none" stroke="${INK}" stroke-width="4"${secondary ? ' stroke-dasharray="15 11"' : ''}${nodes > 12 ? ' opacity=".45"' : ''}/>
<g transform="translate(0 4)" stroke="${INK}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round">
${GLYPHS[m.id]()}
</g>
${starNodes(nodes)}
</svg>
`;
}

async function main() {
  const compare = process.argv.includes('--compare');
  const pngDir = process.env.MANSION_PNG_DIR || path.join(out, 'png-compare');
  const mansions = await catalogue();
  const missing = mansions.filter((m) => !GLYPHS[m.id]);
  if (missing.length) throw new Error('no drawing for ' + missing.map((m) => m.id).join(', '));
  fs.mkdirSync(src, { recursive: true });
  if (compare) fs.mkdirSync(pngDir, { recursive: true });
  let webpBytes = 0, pngBytes = 0;
  for (const m of mansions) {
    const text = svg(m);
    fs.writeFileSync(path.join(src, m.id + '.svg'), text);
    const raster = sharp(Buffer.from(text), { density: 72 }).resize(SIZE, SIZE);
    const quantised = await raster.clone().png({ palette: true, quality: PALETTE_QUALITY, effort: 10 }).toBuffer();
    const webp = await sharp(quantised).webp({ lossless: true, effort: 6 }).toBuffer();
    fs.writeFileSync(path.join(out, m.id + '.webp'), webp);
    webpBytes += webp.length;
    if (compare) {
      const png = await raster.clone().png({ compressionLevel: 9, palette: false }).toBuffer();
      fs.writeFileSync(path.join(pngDir, m.id + '.png'), png);
      pngBytes += png.length;
    }
  }
  console.log('28 glyphs: WebP ' + (webpBytes / 1024).toFixed(1) + ' KB' +
    (compare ? ', PNG ' + (pngBytes / 1024).toFixed(1) + ' KB (in ' + path.relative(root, pngDir) + ')' : '') + '.');
}

main().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
