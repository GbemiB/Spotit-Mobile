import {
  kitCost,
  canGive,
  togglePick,
  factIcon,
  productArt,
  ratingStyle,
  mapPoint,
  mapBounds,
  groupLabel,
  RATING_STYLE,
} from './givedayLogic.js';
import { FACT_ICONS, PRODUCT_ART } from './givedayArt.js';

const products = [
  { id: 'pads', cost: 4 },
  { id: 'guide', cost: 1 },
];

describe('give day rules in the app', () => {
  it('prices a kit per person from the server costs', () => {
    expect(kitCost(products, ['pads', 'guide'], 18)).toBe(90);
    expect(kitCost(products, ['glitter'], 5)).toBe(0);
    expect(kitCost(products, ['pads'], null)).toBe(0);
  });
  it('only lets a kit go when something is picked, a group is chosen and coins cover it', () => {
    expect(canGive(products, ['pads'], 6, 200)).toBe(true);
    expect(canGive(products, [], 6, 200)).toBe(false);
    expect(canGive(products, ['pads'], 0, 200)).toBe(false);
    expect(canGive(products, ['pads'], 60, 200)).toBe(false);
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
  });
  it('places the map pins inside the map', () => {
    const places = [
      { x: 70, y: 205 },
      { x: 320, y: 615 },
    ];
    const b = mapBounds(places);
    expect(mapPoint(places[0], 300, 400, b)).toEqual({ left: 0, top: 0 });
    expect(mapPoint(places[1], 300, 400, b)).toEqual({ left: 300, top: 400 });
    expect(mapPoint({ x: 1, y: 1 }, 10, 10, { minX: 1, maxX: 1, minY: 1, maxY: 1 })).toEqual({ left: 0, top: 0 });
  });
  it('names the group size', () => {
    expect(groupLabel(18, { total: 18, who: 'girls' })).toBe('everyone');
    expect(groupLabel(6, { total: 18, who: 'girls' })).toBe('girls');
  });
});
