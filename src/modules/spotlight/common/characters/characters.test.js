import { CHARACTERS, lookFor } from './characters.js';

describe('character look', () => {
  it('shows partners the male version of the player characters', () => {
    expect(lookFor('you', 'partner')).toBe('youMale');
    expect(lookFor('padbankGirl', 'partner')).toBe('padbankGirlMale');
    expect(lookFor('mamaRonke', 'partner')).toBe('mamaRonkeMale');
    expect(CHARACTERS.youMale).toContain('<svg');
  });
  it('keeps her characters and characters without a male version', () => {
    expect(lookFor('you', 'owner')).toBe('you');
    expect(lookFor('padbankGirl', undefined)).toBe('padbankGirl');
    expect(lookFor('nurse', 'partner')).toBe('nurse');
  });
});
