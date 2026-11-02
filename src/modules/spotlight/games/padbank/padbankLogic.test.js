import { moodFor, clueIcon, packColor, endTitle, goalLabels, nextLabel, canPick, CLUE_ICONS, PACK_COLORS } from './padbankLogic.js';
import { avatarXml, LOOK_NAMES, MOODS } from './avatars.js';

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
    expect(goalLabels(3, 40)).toEqual(['3 packs out', '3 perfect', '40+ budget left']);
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
});
