// Ordered easiest -> hardest. Order is significant: drives dropdown order and chart sort order.

export const FRENCH_SPORT = [
  '3', '4', '5', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a',
];

export const FONT = [
  '3', '4', '5', '5+',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c',
];

export const COLOR = [
  'green', 'yellow', 'orange', 'blue', 'red', 'purple', 'black', 'white',
];

export function getGradeSystem(discipline, venueType) {
  if (discipline === 'top-rope' || discipline === 'lead') {
    return 'french_sport';
  }
  if (discipline === 'boulder') {
    return venueType === 'outdoor' ? 'font' : 'color';
  }
  return undefined;
}

export function getGradeOptions(gradeSystem) {
  switch (gradeSystem) {
    case 'french_sport':
      return FRENCH_SPORT;
    case 'font':
      return FONT;
    case 'color':
      return COLOR;
    default:
      return [];
  }
}
