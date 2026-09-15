// Run with `node scripts/build-square-notes.cjs` (no dependencies).
//
// The board of rebirth carries two write-ups per square: a short one that
// appears as soon as the square is opened, and a long one folded behind the
// disclosure in the drawer. Both are authored as Markdown in `content/`, which
// is where they are edited, and this turns the two files into the data module
// the page imports.
//
//   content/squares-1-104-blurbs.md  ->  SQUARE_NOTES  (one paragraph a square)
//   content/squares-1-104-full.md    ->  SQUARE_FULL   (blocks, a square each)
//
// Both files are headed `## <n>. <name>` per square, numbered 1 to 104 in the
// board's own order. The names in those headings are not read: the square
// names and the Tibetan beside them live in rebirth-board.js and this script
// never touches them.
//
// Markdown is reduced to the small amount of HTML the drawer renders, since
// both values are written into the sheet with innerHTML: paragraphs go in as
// text, `**bold**` and `*italic*` become <b> and <i>, bullet and numbered
// lists become <ul class="body"> and <ol class="body">, a `>` quotation
// becomes <blockquote class="verse"> with its line breaks kept, and a
// cross-reference of the form [No. 48](#field-48) becomes a link that opens
// square 48 in the drawer. Anything else is left alone deliberately: the
// renderer in index.html only knows these.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const BLURBS = path.join(root, 'content/squares-1-104-blurbs.md');
const FULL = path.join(root, 'content/squares-1-104-full.md');
const OUT = path.join(root, 'rebirth-notes.js');
const SQUARES = 104;

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

/* Split a file into its hundred and four sections, keyed by square number.
   Everything before the first heading is front matter and is dropped, as are
   the `<a id="field-n">` anchors, which exist for the Markdown edition only. */
function sections(md, file) {
  const out = new Map();
  let n = null;
  let lines = [];
  const close = () => { if (n !== null) out.set(n, lines); };
  for (const line of md.split('\n')) {
    const head = /^##\s+(\d+)\.\s/.exec(line);
    if (head) { close(); n = Number(head[1]); lines = []; continue; }
    if (n === null) continue;
    if (/^<a id="field-\d+"><\/a>\s*$/.test(line)) continue;
    lines.push(line);
  }
  close();
  for (let i = 1; i <= SQUARES; i += 1) {
    if (!out.has(i)) throw new Error(`${path.basename(file)}: no section for square ${i}`);
  }
  if (out.size !== SQUARES) throw new Error(`${path.basename(file)}: ${out.size} sections, expected ${SQUARES}`);
  return out;
}

/* Group a section's lines into blocks. A run of `>` lines is one quotation, a
   run of list items is one list — with a blank line between items allowed, as
   the numbered lists in the source are spaced that way — and anything else is
   a paragraph, which may be wrapped over several lines. */
function blocks(lines) {
  const out = [];
  const kindOf = (line) => {
    if (/^>/.test(line)) return 'quote';
    if (/^-\s+/.test(line)) return 'ul';
    if (/^\d+\.\s+/.test(line)) return 'ol';
    return 'p';
  };
  let open = null;
  const push = () => { if (open && open.lines.length) out.push(open); open = null; };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      // A blank line ends everything but a list, which may be spaced out; a
      // list carries on only if the next non-blank line is another item.
      if (open && (open.kind === 'ul' || open.kind === 'ol')) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j += 1;
        if (j < lines.length && kindOf(lines[j]) === open.kind) continue;
      }
      push();
      continue;
    }
    const kind = kindOf(line);
    if (!open || open.kind !== kind) { push(); open = { kind, lines: [] }; }
    open.lines.push(line);
  }
  push();
  return out;
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Inline Markdown, in the order that keeps `**` from being read as two `*`. */
function inline(text) {
  return escape(text)
    .replace(/\[([^\]]+)\]\(#field-(\d+)\)/g,
             (m, label, n) => `<a href="#" data-sq="${n}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

/* A quotation keeps its stanzas and its line breaks: two trailing spaces mean
   a break inside a stanza, a bare `>` means a stanza ends, and a line opening
   with an em dash is the attribution. */
function quote(lines) {
  const stanzas = [[]];
  for (const line of lines) {
    const body = line.replace(/^>\s?/, '');
    if (!body.trim()) { if (stanzas[stanzas.length - 1].length) stanzas.push([]); continue; }
    stanzas[stanzas.length - 1].push(body.trim());
  }
  const html = stanzas.filter((s) => s.length).map((s) => {
    const text = s.map(inline).join('<br>');
    return /^—/.test(s[0]) ? `<cite>${text}</cite>` : `<p>${text}</p>`;
  }).join('');
  return `<blockquote class="verse">${html}</blockquote>`;
}

function list(kind, lines) {
  const items = [];
  for (const line of lines) {
    const item = line.replace(/^(?:-|\d+\.)\s+/, '');
    if (item !== line) items.push(item.trim());
    else items[items.length - 1] += ' ' + line.trim();   // a wrapped item
  }
  return `<${kind} class="body">` + items.map((i) => `<li>${inline(i)}</li>`).join('') + `</${kind}>`;
}

const render = (block) => {
  if (block.kind === 'quote') return quote(block.lines);
  if (block.kind === 'ul' || block.kind === 'ol') return list(block.kind, block.lines);
  return inline(block.lines.map((l) => l.trim()).join(' '));
};

/* The module is written with single-quoted strings, as the rest of the page
   is; the prose uses typographic apostrophes, so there is rarely anything to
   escape. */
const quoteJs = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

function main() {
  const short = sections(read(BLURBS), BLURBS);
  const long = sections(read(FULL), FULL);
  const notes = [];
  const full = [];
  for (let n = 1; n <= SQUARES; n += 1) {
    const blurb = blocks(short.get(n)).map(render);
    if (blurb.length !== 1) throw new Error(`square ${n}: a blurb is one paragraph, got ${blurb.length}`);
    if (blurb[0].split(' ').length <= 20) throw new Error(`square ${n}: blurb is too short`);
    notes.push(`  ${n}: ${quoteJs(blurb[0])}`);
    const body = blocks(long.get(n)).map(render);
    if (!body.length) throw new Error(`square ${n}: the full entry is empty`);
    full.push(`  ${n}: [\n` + body.map((b) => '    ' + quoteJs(b)).join(',\n') + '\n  ]');
  }

  const header = fs.readFileSync(path.join(__dirname, 'square-notes-header.txt'), 'utf8');
  fs.writeFileSync(OUT,
    header
    + 'export const SQUARE_NOTES = {\n' + notes.join(',\n') + '\n};\n\n'
    + '/* The long form of each entry, folded behind a disclosure in the drawer and\n'
    + ' * opened only when asked for. The short note above is the blurb; this is what\n'
    + ' * it expands to. Each value is the square\'s section of\n'
    + ' * content/squares-1-104-full.md, one string a block.\n'
    + ' */\n'
    + 'export const SQUARE_FULL = {\n' + full.join(',\n') + '\n};\n');
  process.stdout.write(`rebirth-notes.js: ${notes.length} blurbs, ${full.length} full entries\n`);
}

main();
