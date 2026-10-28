import { View, BackHandler } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { useReduceMotion } from '../dashboard/HeroCardFx.jsx';
import HubView from './HubView.jsx';
import TopicsView from './TopicsView.jsx';
import TrackView from './TrackView.jsx';
import QuizPlay from './QuizPlay.jsx';
import { LevelSheet, InfoSheet } from './QuizSheets.jsx';
import { TOPICS, TOPIC_GROUPS, SAMPLE_PROGRESS, SAMPLE_STATS, SAMPLE_QUESTIONS, TODAYS_PICK } from './sampleQuiz.js';
import { ageOn, isTopicLocked, buildLevels, topicStatus, sheetModeFor } from './quizLogic.js';

const GROUP_TONE = Object.fromEntries(TOPIC_GROUPS.map(g => [g.key, g.tone]));

export default function SpotlightScreen() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [view, setView] = useState('hub');
  const [topicId, setTopicId] = useState(TODAYS_PICK.topicId);
  const [progress, setProgress] = useState(SAMPLE_PROGRESS);
  const [stats, setStats] = useState(SAMPLE_STATS);
  const [spent, setSpent] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [info, setInfo] = useState(null);
  const [playing, setPlaying] = useState(null);

  const balance = Math.max(0, (state.femPoints || 0) - spent);
  const age = ageOn(state.dob, state.today);
  const topics = useMemo(() => TOPICS.map(t => ({ ...t, tone: GROUP_TONE[t.group] })), []);
  const byId = useMemo(() => Object.fromEntries(topics.map(t => [t.id, t])), [topics]);
  const topic = byId[topicId];
  const levels = useMemo(() => buildLevels(progress[topicId]), [progress, topicId]);

  const groups = useMemo(
    () =>
      TOPIC_GROUPS.map(g => ({
        ...g,
        items: topics
          .filter(t => t.group === g.key)
          .map(t => ({ topic: t, status: topicStatus(progress[t.id]), locked: isTopicLocked(t, age) })),
      })),
    [topics, progress, age],
  );

  const cards = useMemo(() => {
    const open = topics.filter(t => !isTopicLocked(t, age));
    const started = open.filter(t => progress[t.id]);
    const rest = open.filter(t => !progress[t.id]);
    return [...started, ...rest].slice(0, 5).map(t => ({ topic: t, status: topicStatus(progress[t.id]) }));
  }, [topics, progress, age]);

  const pickTopic = byId[TODAYS_PICK.topicId];
  const pickLevel = buildLevels(progress[pickTopic.id]).find(l => l.state === 'current') || buildLevels(progress[pickTopic.id])[0];
  const split = pickLevel.name.lastIndexOf(' ');
  const pick = {
    topic: pickTopic,
    level: pickLevel.n,
    free: pickLevel.cost === 0,
    titleA: split > 0 ? pickLevel.name.slice(0, split + 1) : '',
    titleB: split > 0 ? pickLevel.name.slice(split + 1) : pickLevel.name,
  };

  useEffect(() => {
    if (view === 'hub') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView(view === 'track' ? 'topics' : 'hub');
      return true;
    });
    return () => sub.remove();
  }, [view]);

  function openLevel(tId, level) {
    setTopicId(tId);
    setSheet({ mode: sheetModeFor(level, balance), level, topicId: tId });
  }

  function startFromSheet() {
    const { level, mode, topicId: tId } = sheet;
    if (mode === 'short') return;
    const cost = mode === 'unlock' ? level.cost : 0;
    if (cost) setSpent(x => x + cost);
    setSheet(null);
    setPlaying({ topicId: tId, level });
  }

  function finish({ cleared, stars }) {
    if (!cleared || !playing) return;
    const { topicId: tId, level } = playing;
    const cur = progress[tId] || { current: 1, stars: {} };
    const before = cur.stars[level.n] || 0;
    const best = Math.max(before, stars);
    const firstClear = level.n >= cur.current;
    setStats(st => ({ ...st, stars: st.stars + (best - before), levelsDone: st.levelsDone + (firstClear ? 1 : 0) }));
    setProgress(p => ({ ...p, [tId]: { current: firstClear ? level.n + 1 : cur.current, stars: { ...cur.stars, [level.n]: best } } }));
  }

  function nextLevel() {
    const { topicId: tId, level } = playing;
    setPlaying(null);
    const next = buildLevels(progress[tId]).find(l => l.n === level.n + 1);
    if (next) setTimeout(() => openLevel(tId, next), 350);
  }

  const sheetTopic = sheet ? byId[sheet.topicId] : null;
  const playTopic = playing ? byId[playing.topicId] : null;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {view === 'hub' && (
        <HubView
          insets={insets}
          balance={balance}
          stats={stats}
          pick={pick}
          cards={cards}
          topicCount={topics.length}
          reduceMotion={reduceMotion}
          onPlayPick={() => openLevel(pickTopic.id, pickLevel)}
          onOpenTopics={() => setView('topics')}
          onOpenTopic={id => {
            setTopicId(id);
            setView('track');
          }}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      {view === 'topics' && (
        <TopicsView
          insets={insets}
          balance={balance}
          groups={groups}
          isTeen={age != null && age < 18}
          total={topics.length}
          reduceMotion={reduceMotion}
          onBack={() => setView('hub')}
          onOpenTopic={id => {
            setTopicId(id);
            setView('track');
          }}
          onLocked={t => setInfo({ kind: 'locked', topic: t })}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      {view === 'track' && topic && (
        <TrackView
          insets={insets}
          balance={balance}
          topic={topic}
          levels={levels}
          reduceMotion={reduceMotion}
          onBack={() => setView('topics')}
          onPlayLevel={level => openLevel(topic.id, level)}
          onHowItWorks={() => setInfo({ kind: 'how' })}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      <LevelSheet
        open={!!sheet}
        mode={sheet?.mode}
        level={sheet?.level}
        topic={sheetTopic}
        balance={balance}
        reduceMotion={reduceMotion}
        onClose={() => setSheet(null)}
        onStart={startFromSheet}
      />
      <InfoSheet
        open={!!info}
        kind={info?.kind}
        topic={info?.topic}
        balance={balance}
        reduceMotion={reduceMotion}
        onClose={() => setInfo(null)}
        onShowMine={() => {
          setInfo(null);
          setView('topics');
        }}
      />
      <QuizPlay
        open={!!playing}
        topic={playTopic}
        level={playing?.level}
        questions={SAMPLE_QUESTIONS}
        balance={balance}
        reduceMotion={reduceMotion}
        onClose={() => setPlaying(null)}
        onFinish={finish}
        onNextLevel={nextLevel}
        onHint={cost => setSpent(x => x + cost)}
      />
    </View>
  );
}
