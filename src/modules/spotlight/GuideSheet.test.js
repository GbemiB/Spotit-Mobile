import { moveStep, guideSteps } from './GuideSheet.jsx';

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
    const steps = guideSteps({ topicCount: 10, lives: 1, hintCost: 5 });
    expect(steps.map(s => s.key)).toEqual(['topics', 'levels', 'play']);
    expect(steps[0].body).toContain('10 topics');
    expect(steps[2].body).toContain('1 heart.');
    expect(steps[2].body).toContain('5 SP');
  });
});
