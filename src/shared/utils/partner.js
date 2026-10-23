import { MOODS, SYMPTOMS } from '../constants/options.js';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function ownerCard(status) {
  if (!status) return 'loading';
  if (status.role !== 'owner') return 'hidden';
  if (status.state === 'pending' || status.state === 'expired' || status.state === 'active') return status.state;
  return 'none';
}
export function expiryLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  const time = `${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${time}`;
}
export function normalizeInviteCode(input) {
  return (input || '').replace(/[\s-]/g, '').toUpperCase();
}
export function signedInRoute({ onboarded, accountType }) {
  if (accountType === 'partner') return 'partner-home';
  return onboarded ? 'tabs' : 'setup';
}
export function setupRoute(partnerStatus, choseOwnCycle) {
  if (partnerStatus === undefined) return 'checking';
  if (!choseOwnCycle && partnerStatus?.state === 'invited') return 'join';
  return 'onboarding';
}
export function dayLogRows(log) {
  if (!log) return null;
  const symptoms = (log.symptoms || []).map(id => SYMPTOMS.find(x => x.id === id)?.label || id);
  const notes = (log.notes || '').trim();
  const mood = MOODS.find(x => x.id === log.mood);
  if (!log.flow && !mood && symptoms.length === 0 && !log.intimate && !notes) return null;
  return {
    flow: log.flow ? log.flow.charAt(0).toUpperCase() + log.flow.slice(1) : null,
    mood: mood ? `${mood.emoji} ${mood.label}` : null,
    symptoms,
    intimate: !!log.intimate,
    notes,
  };
}
export function supportLabels(options, ids) {
  return (ids || []).map(id => options.find(o => o.id === id)?.label || id);
}
