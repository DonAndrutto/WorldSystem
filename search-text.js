// Fold Latin accents for matching, retaining Tibetan vowel signs and spelling.
export function searchText(value) {
  return String(value ?? '').toLowerCase().normalize('NFD')
    .replace(/([a-z])[\u0300-\u036f]+/g, '$1')
    .replace(/[łøđðæœß]/g, c => ({ł:'l',ø:'o',đ:'d',ð:'d',æ:'ae',œ:'oe',ß:'ss'}[c]))
    .normalize('NFC').trim();
}
