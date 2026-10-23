import { DAY_OPTIONS, toggleDay } from './reminders.js';
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
test('the day options are 2 days before, 1 day before and on the day', () => {
  expect(DAY_OPTIONS.map(o => o.days)).toEqual([2, 1, 0]);
});
