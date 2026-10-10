import { searchText } from './search-text.js';
// Common spellings aid discovery; canonical Sanskrit and Tibetan stay unchanged.
const SPELLINGS = [
  'Ashwini Ashvini Aswini', 'Bharani', 'Krittika Krithika', 'Rohini',
  'Mrigashira Mrigashirsha Mrigashirsa', 'Ardra', 'Punarvasu', 'Pushya',
  'Ashlesha Aslesha', 'Magha', 'Purva Phalguni Poorva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha Visakha',
  'Anuradha', 'Jyeshtha Jyestha', 'Mula Moola', 'Purva Ashadha Poorvashadha',
  'Uttara Ashadha Uttarashada', 'Shravana Sravana', 'Abhijit',
  'Dhanishta Dhanishtha', 'Shatabhisha Shatabhishaj Satabhisha Shatataraka',
  'Purva Bhadrapada Poorva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];
export function mansionSearchText(m) {
  return searchText([m.sanskrit,m.wylie,m.tibetan,SPELLINGS[m.order-1],
    ...m.aliases.flatMap(a=>[a.wylie,a.tibetan]),
    'nakshatra naksatra nakṣatra lunar mansion rgyu skar dom księżycowy nakszatra',m.form.en].join(' '));
}
