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
  it('has three steps using the server settings', () => {
    const steps = guideSteps({ topicCount: 10, lives: 1, hintCost: 5, freeLevels: 2 });
    expect(steps.map(s => s.key)).toEqual(['topics', 'levels', 'play']);
    expect(steps[0].body).toContain('10 topics');
    expect(steps[2].body).toContain('1 heart.');
    expect(steps[2].body).toContain('5 SP');
    expect(steps[1].body).toContain('Levels 1 to 2');
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
