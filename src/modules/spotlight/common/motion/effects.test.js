import { splitPressStyle } from './effects.jsx';

describe('splitPressStyle', () => {
  it('gives flex and margins to the touch area so buttons share a row', () => {
    const { outer, inner } = splitPressStyle({ flex: 1, marginTop: 14 });
    expect(outer).toEqual({ flex: 1, marginTop: 14 });
    expect(inner).toEqual({ flexGrow: 1 });
  });
  it('keeps looks on the animated part', () => {
    const { outer, inner } = splitPressStyle([{ backgroundColor: 'pink', borderRadius: 12 }, { width: 80 }]);
    expect(outer).toEqual({ width: 80 });
    expect(inner).toEqual({ backgroundColor: 'pink', borderRadius: 12 });
  });
  it('handles no style', () => {
    expect(splitPressStyle(undefined)).toEqual({ outer: {}, inner: {} });
  });
});
