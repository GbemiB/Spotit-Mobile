import {
  moodFor,
  clueIcon,
  packColor,
  endTitle,
  goalLabels,
  visitPrice,
  nextLabel,
  canPick,
  CLUE_ICONS,
  PACK_COLORS,
} from './padbankLogic.js';
import { avatarXml, LOOK_NAMES, MOODS } from '../../common/avatars.js';

describe('pad bank rules in the app', () => {
  it('shows the visitor happy or sad only on the result', () => {
    expect(moodFor('ask', null)).toBe('neutral');
    expect(moodFor('result', 'great')).toBe('happy');
    expect(moodFor('result', 'ok')).toBe('happy');
    expect(moodFor('result', 'oops')).toBe('sad');
  });
  it('falls back for unknown icons and colours from the server', () => {
    expect(clueIcon('drop')).toBe(CLUE_ICONS.drop);
    expect(clueIcon('mystery')).toBe(CLUE_ICONS.smile);
    expect(packColor('green')).toBe(PACK_COLORS.green);
    expect(packColor('violet')).toBe(PACK_COLORS.pink);
  });
  it('names the end of the day', () => {
    expect(endTitle(0, 0)).toBe('Out of hearts');
    expect(endTitle(2, 3)).toBe('Bank clear!');
    expect(endTitle(2, 2)).toBe('Nice day!');
    expect(endTitle(1, 1)).toBe('Bank closed');
    expect(goalLabels()).toEqual(['Serve every visitor', 'Right pack for everyone', 'Right way to reach everyone']);
    expect(nextLabel(true)).toBe('See the day');
    expect(nextLabel(false)).toBe('Next visitor');
  });
  it('lets packs be picked only while a visitor is waiting and stock lasts', () => {
    expect(canPick('ask', 2)).toBe(true);
    expect(canPick('route', 1)).toBe(true);
    expect(canPick('ask', 0)).toBe(false);
    expect(canPick('result', 3)).toBe(false);
  });
  it('builds every character in every mood', () => {
    LOOK_NAMES.forEach(look =>
      MOODS.forEach(mood => {
        const xml = avatarXml(look, mood);
        expect(xml.startsWith('<svg')).toBe(true);
        expect(xml.endsWith('</svg>')).toBe(true);
      }),
    );
    expect(avatarXml('nobody')).toBe(avatarXml('girl'));
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
});
