export function splitTitle(name = '') {
  const at = name.lastIndexOf(' ');
  return at > 0 ? { titleA: name.slice(0, at + 1), titleB: name.slice(at + 1) } : { titleA: '', titleB: name };
}

export function toTopic(card) {
  return { id: card.id, name: card.name, group: card.groupId, tone: card.tone, minAge: card.minAge };
}

export function topicStatus(card) {
  const pct = card.levelCount ? Math.round((card.levelsCleared / card.levelCount) * 100) : 0;
  if (card.locked) return { label: 'Opens at 18', pct: 0 };
  if (!card.ready && card.levelsCleared < card.levelCount) return { label: 'Coming soon', pct };
  if (!card.started) return { label: 'Start playing', pct: 0 };
  if (card.levelsCleared >= card.levelCount) return { label: 'All levels cleared', pct: 100 };
  return { label: `Level ${card.currentLevel} of ${card.levelCount}`, pct };
}

export function toCards(cards = []) {
  return cards.map(card => ({ topic: toTopic(card), status: topicStatus(card), locked: card.locked, ready: card.ready }));
}

export function toGroups(response) {
  return (response?.groups || []).map(g => ({
    key: g.id,
    label: g.label,
    tone: g.tone,
    items: toCards(g.topics),
  }));
}

export function toLevel(view) {
  return { n: view.number, name: view.name, cost: view.cost, state: view.state, stars: view.stars, ready: view.ready };
}

export function toPick(pick) {
  if (!pick) return null;
  return {
    topic: { id: pick.topicId, name: pick.topicName, group: pick.groupId, tone: pick.tone },
    level: { n: pick.level, name: pick.levelName, cost: pick.cost, state: 'current', stars: 0, ready: true },
    free: pick.cost === 0,
    ...splitTitle(pick.levelName),
  };
}

export function sheetModeFor(level, balance) {
  if (level.cost === 0) return 'start';
  return balance >= level.cost ? 'unlock' : 'short';
}

export function initialPlay() {
  return {
    phase: 'intro',
    attempt: null,
    round: 0,
    total: 0,
    lives: 0,
    startLives: 0,
    streak: 0,
    best: 0,
    correct: 0,
    hint: null,
    hinted: false,
    feedback: null,
    stars: 0,
    nextLevel: null,
    busy: false,
    error: null,
  };
}

export function playReducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, busy: true, error: null };
    case 'failed':
      return { ...state, busy: false, error: action.message };
    case 'started': {
      const a = action.attempt;
      return {
        ...initialPlay(),
        phase: 'countdown',
        attempt: a,
        total: a.rounds.length,
        lives: a.lives,
        startLives: a.lives,
      };
    }
    case 'go':
      return state.phase === 'countdown' ? { ...state, phase: 'question' } : state;
    case 'hinted':
      return { ...state, busy: false, hinted: true, hint: action.hint };
    case 'answered': {
      const r = action.result;
      return {
        ...state,
        busy: false,
        phase: 'feedback',
        feedback: r,
        lives: r.lives,
        streak: r.streak,
        best: r.bestStreak,
        correct: r.correct,
        stars: r.stars,
        nextLevel: r.nextLevelOpened ?? null,
      };
    }
    case 'next': {
      if (state.phase !== 'feedback') return state;
      const status = state.feedback?.status;
      if (status === 'cleared' || status === 'out') return { ...state, phase: status };
      return { ...state, phase: 'question', round: state.round + 1, hint: null, hinted: false, feedback: null };
    }
    case 'restart':
      return initialPlay();
    default:
      return state;
  }
}

export function resultTitle(stars) {
  if (stars >= 3) return 'You aced it!';
  if (stars === 2) return 'Nicely done!';
  return 'You made it!';
}

export function feedbackTitle(right, streak) {
  if (!right) return 'Not quite!';
  if (streak >= 3) return 'On fire!';
  if (streak === 2) return 'Spot on!';
  return 'Nailed it!';
}

export function friendlyError(e) {
  if (e?.status === 402) return 'You don’t have enough SpotPoints for that yet.';
  if (e?.status === 409) return 'This level isn’t ready yet. New questions are on the way.';
  if (e?.status === 403) return 'This level isn’t open yet.';
  return e?.message || 'Something went wrong. Please try again.';
}
