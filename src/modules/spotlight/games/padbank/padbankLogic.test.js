import { clueIcon, endTitle, goalLabels, visitPrice, togglePack, slipName, CLUE_ICONS } from './padbankLogic.js';

describe('pad bank rules in the app', () => {
  it('falls back for unknown icons and colours from the server', () => {
    expect(clueIcon('drop')).toBe(CLUE_ICONS.drop);
    expect(clueIcon('mystery')).toBe(CLUE_ICONS.smile);
  });
  it('names the end of the day', () => {
    expect(endTitle(0, 0)).toBe('Out of hearts');
    expect(endTitle(2, 3)).toBe('Bank clear!');
    expect(endTitle(2, 2)).toBe('Nice day!');
    expect(endTitle(1, 1)).toBe('Bank closed');
    expect(goalLabels()).toEqual(['Serve every visitor', 'Right pack for everyone', 'Right way to reach everyone']);
  });
  it('charges nothing for the free visitors, then the fee, pack and delivery', () => {
    const rules = { freeVisitors: 2, visitorFee: 2, deliveryCost: 2 };
    const pack = { cost: 5 };
    expect(visitPrice(0, rules, pack, 'delivery')).toBe(0);
    expect(visitPrice(1, rules, pack, 'pickup')).toBe(0);
    expect(visitPrice(2, rules, pack, 'pickup')).toBe(7);
    expect(visitPrice(2, rules, pack, 'delivery')).toBe(9);
    expect(visitPrice(2, rules, null, null)).toBe(2);
    expect(visitPrice(0, { freeVisitors: 0, visitorFee: 1 }, pack, 'pickup')).toBe(6);
    expect(visitPrice(3, null, pack, 'pickup')).toBe(0);
  });
  it('lets a group pick several packs up to its size and stock', () => {
    expect(togglePack([], 'starter', 1, 2)).toEqual(['starter']);
    expect(togglePack(['school'], 'starter', 1, 2)).toEqual(['starter']);
    expect(togglePack([], 'starter', 1, 0)).toEqual([]);
    expect(togglePack(['sport'], 'sport', 3, 3)).toEqual(['sport', 'sport']);
    expect(togglePack(['sport', 'sport'], 'sport', 3, 2)).toEqual(['sport']);
    expect(togglePack(['sport', 'comfort', 'sport'], 'night', 3, 2)).toEqual(['sport', 'comfort', 'sport']);
    expect(togglePack(['sport', 'comfort', 'sport'], 'sport', 3, 3)).toEqual(['sport', 'comfort']);
  });
  it('names the packs on the order slip and prices a group', () => {
    const packs = [
      { id: 'sport', name: 'Active Pack', cost: 6 },
      { id: 'comfort', name: 'Comfort Kit', cost: 6 },
    ];
    expect(slipName(['sport', 'comfort', 'sport'], packs)).toBe('2 × Active Pack, Comfort Kit');
    expect(slipName(['mystery'], packs)).toBe('mystery');
    expect(visitPrice(2, { freeVisitors: 2, visitorFee: 2, deliveryCost: 2 }, packs, 'delivery')).toBe(16);
    expect(visitPrice(2, { freeVisitors: 2, visitorFee: 2, deliveryCost: 2, freeDay: true }, packs, 'delivery')).toBe(0);
  });
  it('has drawings for every clue in the content', () => {
    ['girls', 'ball', 'swim', 'moon', 'baby', 'water', 'noWater', 'clock'].forEach(name => expect(clueIcon(name)).toBe(CLUE_ICONS[name]));
  });
});
