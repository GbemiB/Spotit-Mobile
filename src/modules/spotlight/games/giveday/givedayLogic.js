import { FACT_ICONS, PRODUCT_ART } from './givedayArt.js';

export const RATING_STYLE = {
  good: { dot: '#4E9E78', bg: '#E7F2EB', icon: 'M5 12.5l4.5 4.5L19 7.5' },
  ok: { dot: '#E07A4F', bg: '#FDEBE2', icon: 'M6 12h12' },
  poor: { dot: '#C9604F', bg: '#FDECEA', icon: 'M7 7l10 10M17 7L7 17' },
  missed: { dot: '#E07A4F', bg: '#FFF6EE', icon: 'M12 7v6M12 17h.01' },
};

export function kitCost(products, picked, people) {
  const unit = picked.reduce((sum, id) => sum + (products.find(p => p.id === id)?.cost || 0), 0);
  return unit * (people || 0);
}

export function canGive(products, picked, people, coins) {
  return picked.length > 0 && people > 0 && kitCost(products, picked, people) <= coins;
}

export function togglePick(picked, id) {
  return picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id];
}

export function factIcon(name) {
  return FACT_ICONS[name] || FACT_ICONS.girls;
}

export function productArt(id) {
  return PRODUCT_ART[id] || PRODUCT_ART.pads;
}

export function ratingStyle(rating) {
  return RATING_STYLE[rating] || RATING_STYLE.ok;
}

export function mapPoint(place, width, height, bounds) {
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanY = Math.max(1, bounds.maxY - bounds.minY);
  return { left: ((place.x - bounds.minX) / spanX) * width, top: ((place.y - bounds.minY) / spanY) * height };
}

export function mapBounds(places) {
  const xs = places.map(p => p.x);
  const ys = places.map(p => p.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

export function groupLabel(n, place) {
  return n === place.total ? 'everyone' : place.who;
}
