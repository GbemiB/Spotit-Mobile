export const FLOW = [
  { id: 'spotting', label: 'Spotting', icon: '·' },
  { id: 'light', label: 'Light', icon: '🩸' },
  { id: 'medium', label: 'Medium', icon: '🩸🩸' },
  { id: 'heavy', label: 'Heavy', icon: '🩸🩸🩸' },
];

export const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'irritable', emoji: '😤', label: 'Irritable' },
  { id: 'emotional', emoji: '🥺', label: 'Emotional' },
];

// `category` is presentation-only (the backend's /logs/template just returns id+label) — it
// groups the symptom picker into scannable sections instead of one long flat chip list.
export const SYMPTOM_CATEGORIES = ['Head', 'Body', 'Pelvis', 'Fluid', 'Skin', 'Mood'];

export const SYMPTOMS = [
  { id: 'headache', label: 'Headache', category: 'Head' },
  { id: 'dizziness', label: 'Dizziness', category: 'Head' },
  { id: 'cramps', label: 'Cramps', category: 'Body' },
  { id: 'backpain', label: 'Back pain', category: 'Body' },
  { id: 'fatigue', label: 'Fatigue', category: 'Body' },
  { id: 'jointpain', label: 'Joint pain', category: 'Body' },
  { id: 'nausea', label: 'Nausea', category: 'Body' },
  { id: 'bloating', label: 'Bloating', category: 'Pelvis' },
  { id: 'tender', label: 'Tender breasts', category: 'Pelvis' },
  { id: 'pelvicpain', label: 'Pelvic pain', category: 'Pelvis' },
  { id: 'discharge', label: 'Discharge', category: 'Fluid' },
  { id: 'sweating', label: 'Night sweats', category: 'Fluid' },
  { id: 'acne', label: 'Acne', category: 'Skin' },
  { id: 'moodswings', label: 'Mood swings', category: 'Mood' },
  { id: 'insomnia', label: 'Insomnia', category: 'Mood' },
  { id: 'anxiety', label: 'Anxiety', category: 'Mood' },
];

export const GOALS = [
  { id: 'track', label: 'Track my cycle', icon: '📅', desc: 'Understand your body and patterns' },
  { id: 'conceive', label: 'Try to conceive', icon: '🌱', desc: 'Identify your fertile window' },
  { id: 'avoid', label: 'Avoid pregnancy', icon: '🛡️', desc: 'Natural family planning support' },
  { id: 'curious', label: 'Just curious', icon: '✨', desc: 'Explore what Spot it offers' },
];
