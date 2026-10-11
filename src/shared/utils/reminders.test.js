import { DAY_OPTIONS, toggleDay, shiftTime, timeLabel } from './reminders.js';
describe('toggleDay', () => {
  test('removes a day that is selected', () => {
    expect(toggleDay([3, 2, 1, 0], 2)).toEqual([3, 1, 0]);
  });
  test('adds a day and keeps countdown order', () => {
    expect(toggleDay([1, 0], 3)).toEqual([3, 1, 0]);
    expect(toggleDay([3], 0)).toEqual([3, 0]);
  });
  test('removing the last day leaves an empty list', () => {
    expect(toggleDay([0], 0)).toEqual([]);
  });
  test('does not change the list it was given', () => {
    const selected = [3, 2];
    toggleDay(selected, 1);
    expect(selected).toEqual([3, 2]);
  });
});
describe('shiftTime', () => {
  test('moves by half hours', () => {
    expect(shiftTime('09:00', 30)).toBe('09:30');
    expect(shiftTime('09:00', -30)).toBe('08:30');
  });
  test('wraps around midnight in both directions', () => {
    expect(shiftTime('23:30', 30)).toBe('00:00');
    expect(shiftTime('00:00', -30)).toBe('23:30');
  });
});
describe('timeLabel', () => {
  test('formats as a 12-hour clock', () => {
    expect(timeLabel('09:00')).toBe('9:00 AM');
    expect(timeLabel('20:30')).toBe('8:30 PM');
    expect(timeLabel('00:00')).toBe('12:00 AM');
    expect(timeLabel('12:15')).toBe('12:15 PM');
  });
});
test('the day options count down from 3 days to the day itself', () => {
  expect(DAY_OPTIONS.map(o => o.days)).toEqual([3, 2, 1, 0]);
});
