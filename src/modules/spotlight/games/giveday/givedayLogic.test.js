import {
  giftCost,
  canGive,
  giftSplit,
  togglePick,
  factIcon,
  productArt,
  ratingStyle,
  RATING_STYLE,
  kindIcon,
  travelIcon,
  TRAVEL_ICONS,
  clockLabel,
  kmBetween,
  levelInfo,
  playerLevel,
  nextLevel,
  isAreaLocked,
  freeLevels,
  homeGroups,
  mapRings,
  focusOffset,
  clampOffset,
  tripPrice,
} from './givedayLogic.js';
import { FACT_ICONS, PRODUCT_ART } from './givedayArt.js';
import { MAP_SIZE, WATER, ROADS, REGIONS, WATER_LABELS, ZOOMS } from './lagosMap.js';

const products = [
  { id: 'pads', cost: 2 },
  { id: 'guide', cost: 1 },
  { id: 'cup', cost: 3 },
];

const levels = [
  { number: 1, name: 'Near home', radiusKm: 3, starsNeeded: 0, passCost: 0, giftBudget: 5 },
  { number: 2, name: 'Your side of town', radiusKm: 8, starsNeeded: 3, passCost: 0, giftBudget: 5 },
  { number: 3, name: 'Across the city', radiusKm: 15, starsNeeded: 10, passCost: 10, giftBudget: 10 },
  { number: 5, name: 'All of Lagos', radiusKm: 999, starsNeeded: 30, passCost: 20, giftBudget: 15 },
];

describe('give day rules in the app', () => {
  it('adds up a gift from the server prices', () => {
    expect(giftCost(products, ['pads', 'guide'])).toBe(3);
    expect(giftCost(products, ['glitter'])).toBe(0);
    expect(giftCost(products, [])).toBe(0);
  });
  it('only lets a gift go when something is picked and it fits the budget', () => {
    expect(canGive(products, ['pads', 'guide'], 5)).toBe(true);
    expect(canGive(products, [], 5)).toBe(false);
    expect(canGive(products, ['pads', 'cup', 'guide'], 5)).toBe(false);
  });
  it('adds and removes products', () => {
    expect(togglePick(['pads'], 'guide')).toEqual(['pads', 'guide']);
    expect(togglePick(['pads', 'guide'], 'pads')).toEqual(['guide']);
  });
  it('falls back for drawings the app does not have', () => {
    expect(factIcon('tent')).toBe(FACT_ICONS.tent);
    expect(factIcon('rocket')).toBe(FACT_ICONS.girls);
    expect(productArt('cup')).toBe(PRODUCT_ART.cup);
    expect(productArt('rocket')).toBe(PRODUCT_ART.pads);
    expect(ratingStyle('poor')).toBe(RATING_STYLE.poor);
    expect(ratingStyle('odd')).toBe(RATING_STYLE.ok);
    expect(travelIcon('bike')).toBe(TRAVEL_ICONS.bike);
    expect(travelIcon('boat')).toBe(TRAVEL_ICONS.walk);
  });
  it('picks a stop icon from the kind of place', () => {
    expect(kindIcon('Training school')).not.toBe(kindIcon('School'));
    expect(kindIcon('Youth clinic')).toBe(kindIcon('Clinic'));
    expect(kindIcon('Girls’ hostel')).toBe(kindIcon('hostel'));
    expect(kindIcon('Something new')).toBe(kindIcon('Community centre'));
    expect(kindIcon(null)).toBe(kindIcon('Community centre'));
  });
  it('shows the game clock in am and pm', () => {
    expect(clockLabel(480)).toBe('8:00 am');
    expect(clockLabel(725)).toBe('12:05 pm');
    expect(clockLabel(1080)).toBe('6:00 pm');
  });
  it('measures straight-line km between areas', () => {
    expect(kmBetween({ x: 0, y: 0 }, { x: 300, y: 400 }, 100)).toBe(5);
    expect(kmBetween(null, { x: 1, y: 1 }, 100)).toBe(0);
    expect(kmBetween({ x: 0, y: 0 }, { x: 10, y: 0 }, 0)).toBe(10);
  });
  it('works out the player level from stars', () => {
    expect(playerLevel(levels, 0)).toBe(1);
    expect(playerLevel(levels, 3)).toBe(2);
    expect(playerLevel(levels, 12)).toBe(3);
    expect(playerLevel([], 50)).toBe(1);
    expect(nextLevel(levels, 4).number).toBe(3);
    expect(nextLevel(levels, 40)).toBeNull();
    expect(levelInfo(levels, 3).name).toBe('Across the city');
    expect(levelInfo(levels, 9).number).toBe(1);
    expect(levelInfo(null, 1)).toBeNull();
  });
  it('locks areas until the stars are won', () => {
    expect(isAreaLocked(levels, { level: 3 }, 9)).toBe(true);
    expect(isAreaLocked(levels, { level: 3 }, 10)).toBe(false);
    expect(isAreaLocked([], { level: 3 }, 0)).toBe(false);
  });
  it('lists free levels and the rings drawn round home', () => {
    expect(freeLevels(levels)).toEqual([1, 2]);
    expect(mapRings(levels).map(l => l.number)).toEqual([1, 2, 3]);
    expect(mapRings([levels[0]])).toEqual([]);
  });
  it('groups areas by region for the home picker', () => {
    const groups = homeGroups([
      { id: 'a', region: 'Mainland' },
      { id: 'b', region: 'Island' },
      { id: 'c', region: 'Mainland' },
    ]);
    expect(groups.map(g => g.name)).toEqual(['Mainland', 'Island']);
    expect(groups[0].areas.map(a => a.id)).toEqual(['a', 'c']);
    expect(homeGroups(null)).toEqual([]);
  });
  it('centres the map on a point and keeps it on screen', () => {
    const view = { width: 400, height: 800 };
    const map = { width: 1000, height: 400 };
    const pad = { start: 100, end: 300 };
    expect(focusOffset({ x: 500, y: 100 }, 1, view, 250)).toEqual({ x: -300, y: 150 });
    expect(clampOffset({ x: -300, y: 150 }, view, map, pad)).toEqual({ x: -300, y: 100 });
    expect(clampOffset({ x: 50, y: 0 }, view, map, pad).x).toBe(0);
    expect(clampOffset({ x: -900, y: 0 }, view, map, pad).x).toBe(-600);
    expect(clampOffset({ x: 0, y: -700 }, { width: 400, height: 600 }, { width: 1000, height: 900 }, pad).y).toBe(-600);
    expect(clampOffset({ x: 0, y: 0 }, view, { width: 200, height: 100 }, pad)).toEqual({ x: 100, y: 250 });
  });
  it('has the Lagos drawing data', () => {
    expect(MAP_SIZE.width).toBeGreaterThan(MAP_SIZE.height);
    expect(Object.keys(WATER)).toEqual(['lagoon', 'island', 'creek', 'ologe', 'ocean']);
    expect(ROADS.some(r => r.name === 'Third Mainland Bridge')).toBe(true);
    expect(REGIONS.length).toBe(10);
    expect(WATER_LABELS.length).toBe(3);
    expect(ZOOMS).toEqual([...ZOOMS].sort((a, b) => a - b));
  });
});

describe('giftSplit', () => {
  it('charges only the part above the free amount, and nothing when extras are free', () => {
    expect(giftSplit(4, 5, 10, false)).toEqual({ limit: 10, extra: 0, pay: 0, over: false });
    expect(giftSplit(9, 5, 10, false)).toEqual({ limit: 10, extra: 4, pay: 4, over: false });
    expect(giftSplit(9, 5, 10, true)).toEqual({ limit: 10, extra: 4, pay: 0, over: false });
    expect(giftSplit(11, 5, 10, false).over).toBe(true);
    expect(giftSplit(6, 5, 0, false)).toEqual({ limit: 5, extra: 1, pay: 1, over: true });
  });
});

describe('trip price', () => {
  it('adds the day pass and is free on free levels', () => {
    const quote = { cost: 2 };
    expect(tripPrice({ passNeeded: true, passCost: 3, extrasFree: false }, quote)).toBe(5);
    expect(tripPrice({ passNeeded: false, passCost: 3, extrasFree: false }, quote)).toBe(2);
    expect(tripPrice({ passNeeded: true, passCost: 3, extrasFree: true }, quote)).toBe(0);
    expect(tripPrice(null, quote)).toBe(0);
  });
});
