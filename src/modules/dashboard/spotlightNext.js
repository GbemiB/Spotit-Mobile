function playable(c) {
  return c && !c.locked && c.status === 'live';
}

function freeLevelsText(c) {
  const unit = c.id === 'pad-bank-run' ? 'Day' : 'Level';
  return c.freeUpTo === 1 ? `${unit} 1 is free` : `${unit}s 1–${c.freeUpTo} are free`;
}

export function nextMove(home, quiz) {
  if (!home) return null;
  const challenges = (home.challenges || []).filter(playable);
  if (!challenges.length) return null;
  const streak = home.stats?.streak || 0;
  const week = home.stats?.week || [];
  const playedToday = !!week[week.length - 1];
  if (streak > 0 && !playedToday) {
    return {
      title: `Keep your ${streak}-day Spotlight streak`,
      sub: 'Play anything today to keep it going.',
      chip: streak === 1 ? '1 day' : `${streak} days`,
    };
  }
  const games = challenges.filter(c => c.kind === 'game' && !c.plays);
  const freeTry = games.find(c => c.cost > 0 && c.freePlaysLeft > 0);
  if (freeTry) return { title: `Free try waiting in ${freeTry.name}`, sub: freeTry.blurb, chip: 'Free try' };
  const freeLevels = games.find(c => c.freeUpTo > 0);
  if (freeLevels) return { title: `${freeLevels.name}: ${freeLevelsText(freeLevels)}`, sub: freeLevels.blurb, chip: 'Free' };
  const quizCard = challenges.find(c => c.kind === 'quiz');
  const pick = quiz?.pick;
  if (quizCard && pick) {
    return {
      title: `${quizCard.name}: level ${pick.level} of ${pick.topicName}`,
      sub: pick.levelName,
      chip: pick.cost ? `${pick.cost} SP` : 'Free',
    };
  }
  const first = games[0] || challenges[0];
  return { title: `Play ${first.name}`, sub: first.blurb, chip: null };
}
