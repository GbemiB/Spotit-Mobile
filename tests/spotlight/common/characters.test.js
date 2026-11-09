import { CHARACTERS, lookFor } from '../../../src/modules/spotlight/common/characters/characters.js';

describe('character look', () => {
  it('shows partners the male version of the player characters', () => {
    expect(lookFor('you', 'partner')).toBe('youMale');
    expect(lookFor('padbankGirl', 'partner')).toBe('padbankGirlMale');
    expect(lookFor('mamaRonke', 'partner')).toBe('mamaRonkeMale');
    expect(lookFor('youHappy', 'partner')).toBe('youHappyMale');
    expect(CHARACTERS.youMale).toContain('<svg');
    expect(CHARACTERS.youHappyMale).toContain('<svg');
  });
  it('keeps her characters and characters without a male version', () => {
    expect(lookFor('you', 'owner')).toBe('you');
    expect(lookFor('youHappy', 'owner')).toBe('youHappy');
    expect(lookFor('padbankGirl', undefined)).toBe('padbankGirl');
    expect(lookFor('nurse', 'partner')).toBe('nurse');
  });
});
