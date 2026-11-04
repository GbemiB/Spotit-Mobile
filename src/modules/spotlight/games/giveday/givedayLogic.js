import { FACT_ICONS, PRODUCT_ART } from './givedayArt.js';

export const RATING_STYLE = {
  good: { dot: '#4E9E78', bg: '#E7F2EB', icon: 'M5 12.5l4.5 4.5L19 7.5' },
  ok: { dot: '#E07A4F', bg: '#FDEBE2', icon: 'M6 12h12' },
  poor: { dot: '#C9604F', bg: '#FDECEA', icon: 'M7 7l10 10M17 7L7 17' },
  missed: { dot: '#E07A4F', bg: '#FFF6EE', icon: 'M12 7v6M12 17h.01' },
};

const KIND_ICONS = {
  training: 'M6 7a2.5 2.5 0 1 0 0-.1M6 17a2.5 2.5 0 1 0 0-.1M8 8.5L20 18M8 15.5L20 6',
  school: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 1 6.5 18H20',
  market: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  roadside: 'M6 3h12v14H6zM6 11h12M8 20v-3M16 20v-3M9 14h.01M15 14h.01',
  clinic: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  football: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z',
  hostel: 'M3 21V9l9-6 9 6v12M9 21v-6h6v6',
  motherless: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  community:
    'M9 7a2.5 2.5 0 1 0 0-.1M15 7a2.5 2.5 0 1 0 0-.1M4.5 19c.5-3.5 2.5-5.5 4.5-5.5s4 2 4.5 5.5M11 19c.5-3.5 2.5-5.5 4.5-5.5s3.5 2 4 5.5',
  shelter: 'M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6',
  waterside: 'M3 8c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 14c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 20c3 0 3-2 6-2s3 2 6 2 3-2 6-2',
  youth: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
};

export const TRAVEL_ICONS = {
  walk: 'M13 4.5a1.5 1.5 0 1 0 0-.1M9 21l2-6 3 2v4M11 15l-1-4 3-2 3 3h3M7 11l3-2',
  bike: 'M6 17.5a3.5 3.5 0 1 0 0-.1M18 17.5a3.5 3.5 0 1 0 0-.1M6 17.5l4-8h5l3 8M10 9.5L8.5 6H6.5M15 9.5l1-3h2',
  car: 'M5 16h14v-4l-2-5H7l-2 5zM5 12h14M7.5 19a1.5 1.5 0 1 0 0-.1M16.5 19a1.5 1.5 0 1 0 0-.1',
};

function kindKey(kind) {
  const k = (kind || '').toLowerCase();
  return Object.keys(KIND_ICONS).find(key => k.includes(key)) || 'community';
}

export function kindIcon(kind) {
  return KIND_ICONS[kindKey(kind)];
}

export function travelIcon(mode) {
  return TRAVEL_ICONS[mode] || TRAVEL_ICONS.walk;
}

export function giftCost(products, picked) {
  return picked.reduce((sum, id) => sum + (products.find(p => p.id === id)?.cost || 0), 0);
}

export function canGive(products, picked, budget) {
  return picked.length > 0 && giftCost(products, picked) <= budget;
}

export function giftSplit(cost, free, max, extrasFree) {
  const limit = Math.max(max || 0, free || 0);
  const extra = Math.max(0, cost - (free || 0));
  return { limit, extra, pay: extrasFree ? 0 : extra, over: cost > limit };
}

export function tripPrice(trips, quote) {
  if (!trips || !quote || trips.extrasFree) return 0;
  return quote.cost + (trips.passNeeded ? trips.passCost : 0);
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

export function clockLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${m < 10 ? '0' : ''}${m} ${h % 24 < 12 ? 'am' : 'pm'}`;
}

export function kmBetween(a, b, unitsPerKm) {
  if (!a || !b) return 0;
  return Math.round((Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, unitsPerKm)) * 10) / 10;
}

export function levelInfo(levels, number) {
  return (levels || []).find(l => l.number === number) || (levels || [])[0] || null;
}

export function playerLevel(levels, stars) {
  return (levels || []).filter(l => stars >= l.starsNeeded).reduce((best, l) => Math.max(best, l.number), 1);
}

export function nextLevel(levels, stars) {
  const now = playerLevel(levels, stars);
  return (levels || []).find(l => l.number === now + 1) || null;
}

export function isAreaLocked(levels, area, stars) {
  const lv = levelInfo(levels, area.level);
  return !!lv && stars < lv.starsNeeded;
}

export function freeLevels(levels) {
  return (levels || []).filter(l => !l.passCost).map(l => l.number);
}

export function homeGroups(areas) {
  const groups = [];
  (areas || []).forEach(a => {
    let g = groups.find(x => x.name === a.region);
    if (!g) {
      g = { name: a.region, areas: [] };
      groups.push(g);
    }
    g.areas.push(a);
  });
  return groups;
}

export function isAllOfLagos(level, maxRadius) {
  return !level || level.radiusKm >= maxRadius;
}

export function mapRings(levels) {
  const list = levels || [];
  if (list.length < 2) return [];
  const widest = Math.max(...list.map(l => l.radiusKm));
  return list.filter(l => l.radiusKm < widest);
}

export function focusOffset(point, zoom, view, top) {
  return { x: view.width / 2 - point.x * zoom, y: top - point.y * zoom };
}

export function clampOffset(offset, view, mapPx, pad) {
  const axis = (v, viewSize, size, p) =>
    size + p.start + p.end <= viewSize
      ? p.start + (viewSize - size - p.start - p.end) / 2
      : Math.min(p.start, Math.max(viewSize - size - p.end, v));
  return {
    x: axis(offset.x, view.width, mapPx.width, { start: 0, end: 0 }),
    y: axis(offset.y, view.height, mapPx.height, pad),
  };
}
