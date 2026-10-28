export const HINT_COST = 5;
export const LEVEL_COUNT = 10;
export const ROUNDS_PER_LEVEL = 5;
export const START_LIVES = 3;

export const TOPIC_GROUPS = [
  { key: 'body', label: 'Body basics', tone: 'pink' },
  { key: 'hormones', label: 'Hormones', tone: 'gold' },
  { key: 'conditions', label: 'Conditions', tone: 'peach' },
  { key: 'lifestyle', label: 'Lifestyle & mind', tone: 'green' },
  { key: 'relationships', label: 'Relationships', tone: 'pink' },
  { key: 'fertility', label: 'Fertility & pregnancy', tone: 'peach' },
  { key: 'screening', label: 'Screening & later life', tone: 'gold' },
];

export const TOPICS = [
  { id: 'my-cycle', name: 'My Cycle', group: 'body', minAge: 13 },
  { id: 'period-myths', name: 'Period Myths', group: 'body', minAge: 13 },
  { id: 'body-changes', name: 'Body Changes', group: 'body', minAge: 13 },
  { id: 'period-care', name: 'Period Care', group: 'body', minAge: 13 },
  { id: 'intimate-health', name: 'Intimate Health', group: 'body', minAge: 13 },
  { id: 'hormones-101', name: 'Hormones 101', group: 'hormones', minAge: 13 },
  { id: 'skin-hormones', name: 'Skin & Hormones', group: 'hormones', minAge: 13 },
  { id: 'mood-hormones', name: 'Mood & Hormones', group: 'hormones', minAge: 13 },
  { id: 'sleep-cycle', name: 'Sleep & Your Cycle', group: 'hormones', minAge: 13 },
  { id: 'pcos', name: 'PCOS', group: 'conditions', minAge: 13 },
  { id: 'endometriosis', name: 'Endometriosis', group: 'conditions', minAge: 13 },
  { id: 'fibroids', name: 'Fibroids', group: 'conditions', minAge: 13 },
  { id: 'thyroid', name: 'Thyroid & Periods', group: 'conditions', minAge: 13 },
  { id: 'uti-thrush', name: 'UTIs & Thrush', group: 'conditions', minAge: 13 },
  { id: 'food-cycle', name: 'Food & Your Cycle', group: 'lifestyle', minAge: 13 },
  { id: 'move-cycle', name: 'Move With Your Cycle', group: 'lifestyle', minAge: 13 },
  { id: 'stress', name: 'Stress & Periods', group: 'lifestyle', minAge: 13 },
  { id: 'body-confidence', name: 'Body Confidence', group: 'lifestyle', minAge: 13 },
  { id: 'consent', name: 'Consent', group: 'relationships', minAge: 13 },
  { id: 'healthy-relationships', name: 'Healthy Relationships', group: 'relationships', minAge: 13 },
  { id: 'sex-intimacy', name: 'Sex & Intimacy', group: 'relationships', minAge: 18 },
  { id: 'contraception', name: 'Contraception', group: 'relationships', minAge: 18 },
  { id: 'stis', name: 'STIs', group: 'relationships', minAge: 18 },
  { id: 'trying-baby', name: 'Trying for a Baby', group: 'fertility', minAge: 18 },
  { id: 'pregnancy', name: 'Pregnancy', group: 'fertility', minAge: 18 },
  { id: 'childbirth', name: 'Childbirth', group: 'fertility', minAge: 18 },
  { id: 'after-birth', name: 'After Birth', group: 'fertility', minAge: 18 },
  { id: 'pregnancy-loss', name: 'Pregnancy Loss', group: 'fertility', minAge: 18 },
  { id: 'breast-checks', name: 'Breast Checks', group: 'screening', minAge: 13 },
  { id: 'cervical-screening', name: 'Cervical Screening', group: 'screening', minAge: 18 },
  { id: 'menopause', name: 'Perimenopause & Menopause', group: 'screening', minAge: 18 },
];

export const SAMPLE_PROGRESS = {
  'my-cycle': { current: 2, stars: { 1: 3 } },
  'body-changes': { current: 1, stars: {} },
};

export const SAMPLE_STATS = { streak: 3, stars: 3, levelsDone: 1 };

export const LEVEL_NAMES = [
  'First flow',
  'Egg-cellent timing',
  'Hormone hustle',
  'Cycle detective',
  'Myth buster',
  'Flow pro',
  'Body boss',
  'Know-it-all',
  'Cycle sage',
  'Queen of the cycle',
];

export const TODAYS_PICK = { topicId: 'my-cycle', level: 2 };

export const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    statement: 'You shouldn’t swim on your period.',
    answer: 'myth',
    hint: 'Think about what a tampon or a cup does.',
    explain: 'Swimming is fine with a tampon or a cup, and gentle exercise can even ease cramps.',
    fact: 'Water pressure can slow your flow a little while you are in the pool.',
  },
  {
    id: 'q2',
    statement: 'A healthy cycle can be anywhere from 21 to 35 days long.',
    answer: 'fact',
    hint: 'Not everyone runs on 28 days.',
    explain: 'Cycles vary from person to person. Anything from 21 to 35 days is common.',
    fact: 'Only a small share of cycles are exactly 28 days long.',
  },
  {
    id: 'q3',
    statement: 'Ovulation always happens on day 14.',
    answer: 'myth',
    hint: 'Does every cycle have the same length?',
    explain: 'Ovulation moves with your cycle. Day 14 is only an average for a 28-day cycle.',
    fact: 'An egg lives for about 12 to 24 hours after it is released.',
  },
  {
    id: 'q4',
    statement: 'Period blood can be bright red, dark red or brown.',
    answer: 'fact',
    hint: 'Colour changes with how long the blood takes to leave the body.',
    explain: 'Older blood looks darker. Colour often changes from the start to the end of a period.',
    fact: 'Most people lose only about 2 to 3 tablespoons of blood in a whole period.',
  },
  {
    id: 'q5',
    statement: 'Stress can make your period late.',
    answer: 'fact',
    hint: 'Your brain helps time your cycle.',
    explain: 'Stress hormones can delay ovulation, which pushes your period back.',
    fact: 'Big changes in sleep, travel or exercise can shift your cycle too.',
  },
];

export const POINT_PACKS = [
  { id: 'small', sp: 100, bonus: 0, price: '[PRICE]' },
  { id: 'medium', sp: 250, bonus: 25, price: '[PRICE]' },
  { id: 'large', sp: 600, bonus: 100, price: '[PRICE]' },
];
