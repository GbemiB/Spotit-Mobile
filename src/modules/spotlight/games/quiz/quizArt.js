export const TOPIC_ICONS = {
  cycle: ['M12 4a8 8 0 1 1-7.4 5M4 4v5h5', 'spin'],
  myth: ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20', 'sway'],
  sprout: ['M12 20v-8M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z', 'sway'],
  bottle: ['M10 3h4v3l2 3v11H8V9l2-3zM8 13h8', 'bob'],
  molecule: ['M7 7a2.5 2.5 0 1 0 0 .1M17 7a2.5 2.5 0 1 0 0 .1M12 17a2.5 2.5 0 1 0 0 .1M8.5 9l2.5 6M15.5 9l-2.5 6M9.5 7h5', 'spin'],
  mirror: ['M12 3c3.3 0 6 3.6 6 8s-2.7 8-6 8-6-3.6-6-8 2.7-8 6-8zM12 19v2M9 21h6M10 8l3-2', 'bob'],
  mood: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01', 'bob'],
  moon: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', 'sway'],
  box: ['M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8', 'bob'],
  bowl: ['M4 11h16a8 8 0 0 1-16 0zM9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4', 'bob'],
};

export function topicIcon(name) {
  return TOPIC_ICONS[name] || TOPIC_ICONS.cycle;
}

export const LOCK = 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z';
export const BACK = 'M15 5l-7 7 7 7';
export const CLOSE = 'M6 6l12 12M18 6L6 18';
export const HINT = 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z';
export const MYTH_ICON = 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20M8 8.5l5 5M13 8.5l-5 5';
export const FACT_ICON = 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8 12.5l3 3 5-6';
