import { Animated } from 'react-native';
import { kf, TOPIC_ICONS } from './TopicIcon.jsx';

const at = (node, value, v) => {
  v.setValue(value);
  return node.__getValue();
};

describe('kf keyframes', () => {
  it('maps milliseconds on the tap timeline to values', () => {
    const v = new Animated.Value(0);
    const node = kf(v, 1000, [
      [0, 1],
      [500, 2],
      [1000, 1],
    ]);
    expect(at(node, 0, v)).toBe(1);
    expect(at(node, 0.5, v)).toBe(2);
    expect(at(node, 0.25, v)).toBeCloseTo(1.5);
    expect(at(node, 1, v)).toBe(1);
  });
  it('holds the first and last values when frames do not cover the whole timeline', () => {
    const v = new Animated.Value(0);
    const node = kf(v, 1000, [
      [200, 0],
      [600, 5],
    ]);
    expect(at(node, 0, v)).toBe(0);
    expect(at(node, 0.9, v)).toBe(5);
  });
  it('skips frames that do not move forward in time', () => {
    const v = new Animated.Value(0);
    const node = kf(v, 1000, [
      [0, 0],
      [0, 9],
      [1000, 4],
    ]);
    expect(at(node, 1, v)).toBe(4);
  });
});

describe('topic icon set', () => {
  it('has a drawing for every icon key the content script sets', () => {
    expect(Object.keys(TOPIC_ICONS).sort()).toEqual(
      ['bottle', 'bowl', 'box', 'cycle', 'molecule', 'mirror', 'mood', 'moon', 'myth', 'sprout'].sort(),
    );
    Object.values(TOPIC_ICONS).forEach(entry => {
      expect(entry.T).toBeGreaterThan(0);
      expect(typeof entry.C).toBe('function');
    });
  });
});
