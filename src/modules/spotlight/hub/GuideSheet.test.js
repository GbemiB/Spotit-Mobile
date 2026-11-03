import { moveStep, guideSteps, dragOffset, releaseTarget } from './GuideSheet.jsx';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('moveStep', () => {
  it('goes forward and back between steps', () => {
    expect(moveStep(0, 1, 3)).toBe(1);
    expect(moveStep(2, -1, 3)).toBe(1);
  });
  it('stays on the first and last step at the edges', () => {
    expect(moveStep(0, -1, 3)).toBe(0);
    expect(moveStep(2, 1, 3)).toBe(2);
  });
  it('jumps straight to a tapped dot', () => {
    expect(moveStep(2, 0, 3)).toBe(2);
    expect(moveStep(7, 0, 3)).toBe(2);
  });
});

describe('guideSteps', () => {
  it('builds the three steps from the server data', () => {
    const steps = guideSteps({
      freeLevels: 2,
      freeTries: 1,
      games: ['Pad Bank Run', 'Give Day'],
      ranks: [{ name: 'Curious' }, { name: 'Explorer' }, { name: 'Myth Buster' }, { name: 'Know-It-All' }],
    });
    expect(steps.map(s => s.key)).toEqual(['ways', 'free', 'stars']);
    expect(steps[0].title).toBe('Three ways to play');
    expect(steps[0].body).toContain('two pretend games: Pad Bank Run and Give Day');
    expect(steps[1].body).toContain('Levels 1 to 2 of every quiz topic are free');
    expect(steps[1].body).toContain('one free try');
    expect(steps[2].body).toContain('from Curious to Explorer, Myth Buster and Know-It-All');
  });
  it('says the games are free to open when they cost nothing', () => {
    const steps = guideSteps({ freeLevels: 2, freeTries: 1, freeGames: true, games: ['Pad Bank Run', 'Give Day'], ranks: [] });
    expect(steps[1].body).toBe(
      'Levels 1 to 2 of every quiz topic are free, and the games are free to open. After that, you use SpotPoints.',
    );
  });
  it('copes with no games, no free tries and one rank', () => {
    const steps = guideSteps({ freeLevels: 0, freeTries: 0, games: [], ranks: [{ name: 'Curious' }] });
    expect(steps[0].title).toBe('One way to play');
    expect(steps[1].body).toBe('Every quiz level costs SP. After that, you use SpotPoints.');
    expect(steps[2].body).toBe('Every win earns stars.');
  });
});

describe('slider', () => {
  it('follows the finger between steps', () => {
    expect(dragOffset(1, -50, 3)).toBe(-50);
    expect(dragOffset(1, 50, 3)).toBe(50);
  });
  it('only stretches a little past the first and last step', () => {
    expect(dragOffset(0, 100, 3)).toBe(30);
    expect(dragOffset(2, -100, 3)).toBe(-30);
  });
  it('changes step after a quarter of the width', () => {
    expect(releaseTarget(0, -90, 0, 300, 3)).toBe(1);
    expect(releaseTarget(1, 90, 0, 300, 3)).toBe(0);
  });
  it('changes step on a quick flick', () => {
    expect(releaseTarget(0, -30, -0.8, 300, 3)).toBe(1);
  });
  it('springs back after a short slow drag or at the edges', () => {
    expect(releaseTarget(1, -40, -0.1, 300, 3)).toBe(1);
    expect(releaseTarget(0, 200, 1, 300, 3)).toBe(0);
    expect(releaseTarget(2, -200, -1, 300, 3)).toBe(2);
  });
});
