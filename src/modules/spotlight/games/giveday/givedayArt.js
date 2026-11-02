export const FACT_ICONS = {
  girls:
    'M9 7a2.5 2.5 0 1 0 0-.1M15 7a2.5 2.5 0 1 0 0-.1M4.5 19c.5-3.5 2.5-5.5 4.5-5.5s4 2 4.5 5.5M11 19c.5-3.5 2.5-5.5 4.5-5.5s3.5 2 4 5.5',
  cake: 'M5 20h14v-7H5zM5 15.5c2 1.5 4.5 1.5 7 0s5-1.5 7 0M12 13V9M12 6.5v.5',
  drop: 'M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z',
  door: 'M6 21V4h12v17M14 12h.01M4 21h16',
  noDrop: 'M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5zM4 4l16 16',
  run: 'M13 4.5a1.5 1.5 0 1 0 0-.1M9 21l2-6 3 2v4M11 15l-1-4 3-2 3 3h3M7 11l3-2',
  tent: 'M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6',
  light: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
  ball: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  coin: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4',
  shop: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  pain: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8.5 16a4.5 4.5 0 0 1 7 0M8 9l2 1M16 9l-2 1',
  swim: 'M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2.5-1.5 4.5-1.5S19 17 21 17M8 12l3-4 4 2 2-3M16 6.5a1.5 1.5 0 1 0 0-.1',
  river: 'M3 8c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 14c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 20c3 0 3-2 6-2s3 2 6 2 3-2 6-2',
  road: 'M8 3L5 21M16 3l3 18M12 5v3M12 11v3M12 17v3',
};

export const PRODUCT_ART = {
  pads: {
    art: 'M8 9 h16 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-6 a4 4 0 0 1 4 -4z',
    detail: 'M10 16h12',
    fill: '#FDE2E7',
    stroke: '#C8466A',
  },
  liners: {
    art: 'M10 11 h12 a3 3 0 0 1 3 3 v4 a3 3 0 0 1 -3 3 h-12 a3 3 0 0 1 -3 -3 v-4 a3 3 0 0 1 3 -3z',
    detail: 'M12 16h8',
    fill: '#FFF6EE',
    stroke: '#C8466A',
  },
  tampons: { art: 'M12 6 h8 v14 a4 4 0 0 1 -8 0z', detail: 'M16 24v4', fill: '#FFFFFF', stroke: '#C04E68' },
  cup: { art: 'M8 7 h16 l-2 12 a6 6 0 0 1 -12 0z', detail: 'M16 25v3', fill: '#F2A0AE', stroke: '#A9405A' },
  pants: { art: 'M5 8 h22 l-2 9 c-1 4 -4 7 -7 8 l-2 -6 l-2 6 c-3 -1 -6 -4 -7 -8z', detail: 'M8 12h16', fill: '#E8708A', stroke: '#A9405A' },
  reusable: {
    art: 'M8 9 h16 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-6 a4 4 0 0 1 4 -4z',
    detail: 'M11 14l2 2 2-2 2 2 2-2 2 2',
    fill: '#CDEBD9',
    stroke: '#2F7454',
  },
  heat: { art: 'M7 7 h18 v18 h-18z', detail: 'M12 20c0-3 2-3 2-6M18 20c0-3 2-3 2-6', fill: '#FBE0B8', stroke: '#B9853A' },
  wipes: { art: 'M6 11 h20 v13 h-20z', detail: 'M12 11c0-3 8-3 8 0', fill: '#EEF2F2', stroke: '#6E6066' },
  washbag: { art: 'M7 11 h18 l-2 14 h-14z', detail: 'M12 11V8a4 4 0 0 1 8 0v3', fill: '#F7D49A', stroke: '#8E6230' },
  guide: { art: 'M7 6 h18 v20 h-18z', detail: 'M11 11h10M11 15h10M11 19h6', fill: '#FFFFFF', stroke: '#C04E68' },
};
