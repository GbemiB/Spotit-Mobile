import { MOODS, SYMPTOMS } from '../constants/options.js';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
function days(n) {
  return `${n} ${n === 1 ? 'day' : 'days'}`;
}
export function homeInviteCopy({ firstName, phaseKey, cycleDay, daysToPeriod }) {
  const comma = firstName ? `, ${firstName}` : '';
  if (phaseKey === 'period') {
    return {
      title: cycleDay ? `Day ${cycleDay}. Let them show up.` : 'Let them show up.',
      body: 'Your partner sees where you are and what you need.',
    };
  }
  if (daysToPeriod != null && daysToPeriod >= 1 && daysToPeriod <= 7) {
    return { title: `${days(daysToPeriod)} to go${comma}.`, body: 'Give your partner a heads-up before it starts.' };
  }
  if (phaseKey === 'fertile' || phaseKey === 'ovulation') {
    return { title: `Planning together${comma}?`, body: 'Share your fertile window with your partner.' };
  }
  return { title: `Better together${comma}.`, body: 'Let your partner see your cycle and show up on purpose.' };
}
export function connectedTitle(partnerName) {
  return partnerName ? `You and ${partnerName}, in sync` : 'You and your partner, in sync';
}
export function connectedLine({ partnerName }) {
  return `${partnerName || 'Your partner'} sees your cycle, read-only.`;
}
export function inviteExpiryText(iso, now = new Date()) {
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return '';
  const hours = (end.getTime() - now.getTime()) / 3600000;
  if (hours <= 0) return 'code expired';
  if (hours < 24) return 'code expires today';
  const left = Math.floor(hours / 24);
  return left === 1 ? 'code expires tomorrow' : `code expires in ${left} days`;
}
export function sharedSinceLabel(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return null;
  return `Sharing since ${d.getDate()} ${LONG_MONTHS[d.getMonth()]}`;
}
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
export function headsUpChip(daysToPeriod) {
  if (daysToPeriod == null || daysToPeriod < 1) return null;
  const left = daysToPeriod - 5;
  if (left > 1) return `Heads-up in ${left} days`;
  if (left === 1) return 'Heads-up tomorrow';
  if (left === 0) return 'Heads-up today';
  return daysToPeriod === 1 ? 'Period tomorrow' : `Period in ${daysToPeriod} days`;
}
