const DISPLAY_LABELS = {
  'top-rope': 'Top Rope',
  lead: 'Lead',
  boulder: 'Boulder',
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  onsight: 'Onsight',
  flash: 'Flash',
  redpoint: 'Redpoint',
  attempt: 'Attempt',
  fall: 'Fall',
  french_sport: 'Sport (French)',
  font: 'Font',
  color: 'Color',
};

export function formatLabel(value) {
  if (DISPLAY_LABELS[value]) return DISPLAY_LABELS[value];
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
