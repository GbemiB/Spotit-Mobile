export function viewerOf(state) {
  const isPartner = state.accountType === 'partner';
  return { isPartner, name: isPartner ? state.partnerName || 'Your partner' : null };
}
export function heroParts(phaseKey, cycleDay, viewer) {
  const { isPartner, name } = viewer;
  if (phaseKey === 'period') {
    return isPartner
      ? [{ text: `${name} is on` }, { text: `day ${cycleDay}`, highlight: true }, { text: 'of her period' }]
      : [{ text: 'You’re on' }, { text: `day ${cycleDay}`, highlight: true }, { text: 'of your period' }];
  }
  if (phaseKey === 'fertile') {
    return isPartner
      ? [{ text: `${name} is in her` }, { text: 'fertile window', highlight: true }]
      : [{ text: 'You’re in your' }, { text: 'fertile window', highlight: true }];
  }
  if (phaseKey === 'ovulation') {
    return isPartner
      ? [{ text: `Today is ${name}’s predicted` }, { text: 'ovulation day', highlight: true }]
      : [{ text: 'Today is your predicted' }, { text: 'ovulation day', highlight: true }];
  }
  return null;
}
export function lateParts(status, viewer) {
  const subject = viewer.isPartner ? `${viewer.name}’s period` : 'Your period';
  if (status?.state === 'due') return [{ text: `${subject} is` }, { text: 'due today', highlight: true }];
  return [
    { text: `${subject} is predicted to be` },
    { text: `${status?.daysLate} ${status?.daysLate === 1 ? 'day' : 'days'} late`, highlight: true },
  ];
}
export function milestoneLead(key, viewer) {
  if (key === 'ovulation') return 'Ovulation in';
  if (viewer.isPartner) return key === 'fertile' ? `${viewer.name}’s fertile window starts in` : `${viewer.name}’s period starts in`;
  return key === 'fertile' ? 'Your fertile window starts in' : 'Your period starts in';
}
export function ovulationInsight(phaseKey, cycleLength, viewer) {
  const ovDay = cycleLength - 14;
  if (viewer.isPartner) {
    if (phaseKey === 'ovulation')
      return { title: `${viewer.name}’s fertile window is open`, body: 'Today is her predicted ovulation day.' };
    if (phaseKey === 'fertile')
      return { title: `${viewer.name}’s fertile window is open`, body: `${viewer.name} is in her fertile window.` };
    return { title: `${viewer.name}’s ovulation`, body: `Ovulation is predicted around day ${ovDay} of her cycle.` };
  }
  if (phaseKey === 'ovulation') {
    return {
      title: 'Your fertile window is open',
      body: 'Today is your predicted ovulation day. You may notice a small temperature rise tomorrow.',
    };
  }
  if (phaseKey === 'fertile') {
    return { title: 'Your fertile window is open', body: 'You’re in your fertile window — a good time to track symptoms closely.' };
  }
  return { title: 'Track your ovulation', body: `Ovulation is predicted around day ${ovDay} of your cycle.` };
}
export function noPeriodCopy(viewer) {
  return viewer.isPartner
    ? { headline: `${viewer.name} hasn’t logged a period yet`, sub: 'Her predictions will appear here once she does.' }
    : { headline: 'Log a period to see your predictions', sub: "Track today's flow and we'll start predicting your next cycle." };
}
export function calendarNote(kind, viewer) {
  if (kind === 'before-tracking') {
    return viewer.isPartner
      ? `${viewer.name}’s calendar starts in the month of her first period with Spot it.`
      : 'Your calendar starts in the month of your first period with Spot it.';
  }
  return viewer.isPartner ? `${viewer.name} hasn’t logged a period yet.` : 'Log your last period to see cycle phases here.';
}
export function regularityTitle(status, viewer) {
  if (status === 'regular') return viewer.isPartner ? `${viewer.name}’s cycles look regular` : 'Your cycles look regular';
  if (status === 'unusual_period_length') return 'Unusual period length detected';
  return viewer.isPartner ? `${viewer.name}’s cycle length has varied` : 'Your cycle length has varied';
}
