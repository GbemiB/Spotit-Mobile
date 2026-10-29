import { View, BackHandler, StyleSheet } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { Text } from '../../shared/styles/index.js';
import * as quizApi from '../../shared/api/quiz.js';
import { useReduceMotion } from '../dashboard/HeroCardFx.jsx';
import HubView from './HubView.jsx';
import TopicsView from './TopicsView.jsx';
import TrackView from './TrackView.jsx';
import QuizPlay from './QuizPlay.jsx';
import { LevelSheet, InfoSheet } from './QuizSheets.jsx';
import { toCards, toGroups, toLevel, toPick, toTopic, sheetModeFor, friendlyError } from './quizLogic.js';

const NO_STATS = { streak: 0, stars: 0, levelsDone: 0 };

function QuizSpotlight() {
  const { state, dispatch } = useApp();
  const token = state.accessToken;
  const balance = state.femPoints || 0;
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [view, setView] = useState('hub');
  const [home, setHome] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [info, setInfo] = useState(null);
  const [playing, setPlaying] = useState(null);

  const settings = useMemo(
    () => ({ rounds: home?.rounds ?? 5, lives: home?.lives ?? 3, hintCost: home?.hintCost ?? 5 }),
    [home?.rounds, home?.lives, home?.hintCost],
  );

  const load = useCallback(async (work, apply) => {
    setLoading(true);
    setError(null);
    try {
      apply(await work());
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHome = useCallback(() => load(() => quizApi.getHome(token), setHome), [load, token]);
  const loadTopics = useCallback(() => load(() => quizApi.getTopics(token), setTopicsData), [load, token]);
  const loadDetail = useCallback(id => load(() => quizApi.getTopic(id, token), setDetail), [load, token]);

  useEffect(() => {
    quizApi
      .getHome(token)
      .then(setHome)
      .catch(e => setError(friendlyError(e)));
  }, [token]);

  useEffect(() => {
    if (view === 'hub') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView(view === 'track' ? 'topics' : 'hub');
      return true;
    });
    return () => sub.remove();
  }, [view]);

  const spent = useCallback(
    newBalance => {
      if (typeof newBalance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance });
    },
    [dispatch],
  );

  function openTopics() {
    setView('topics');
    loadTopics();
  }

  function openTopic(id) {
    setDetail(null);
    setView('track');
    loadDetail(id);
  }

  function openLevel(topic, level, levelCount) {
    setSheet({ mode: sheetModeFor(level, balance), level, topic, hasNext: levelCount > level.n });
  }

  function startFromSheet() {
    if (!sheet || sheet.mode === 'short') return;
    const { topic, level, hasNext } = sheet;
    setSheet(null);
    setPlaying({ topic, level, hasNext });
  }

  const api = useMemo(() => {
    if (!playing) return null;
    return {
      start: async () => {
        const res = await quizApi.startLevel({ topicId: playing.topic.id, level: playing.level.n }, token);
        spent(res.balance);
        return res;
      },
      hint: async (attemptId, round) => {
        const res = await quizApi.takeHint(attemptId, round, token);
        spent(res.balance);
        return res;
      },
      answer: (attemptId, round, choice) => quizApi.answer(attemptId, round, choice, token),
    };
  }, [playing, token, spent]);

  function finish() {
    if (view === 'track' && detail?.topic?.id) loadDetail(detail.topic.id);
    loadHome();
  }

  async function nextLevel() {
    const { topic, level } = playing;
    setPlaying(null);
    try {
      const fresh = await quizApi.getTopic(topic.id, token);
      setDetail(fresh);
      const next = fresh.levels.map(toLevel).find(l => l.n === level.n + 1);
      if (next) setTimeout(() => openLevel(topic, next, fresh.levels.length), 350);
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  const pick = toPick(home?.pick);
  const pickCard = home?.topics?.find(t => t.id === home?.pick?.topicId);
  const cards = toCards(home?.topics);
  const groups = toGroups(topicsData);
  const detailTopic = detail?.topic ? toTopic(detail.topic) : null;
  const levels = (detail?.levels || []).map(toLevel);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {view === 'hub' && (
        <HubView
          insets={insets}
          balance={balance}
          stats={home?.stats || NO_STATS}
          pick={pick}
          cards={cards}
          topicCount={home?.topicCount ?? 0}
          settings={settings}
          loading={loading || !home}
          error={error}
          onRetry={loadHome}
          reduceMotion={reduceMotion}
          onPlayPick={() => pick && openLevel(pick.topic, pick.level, pickCard?.levelCount ?? 0)}
          onOpenTopics={openTopics}
          onOpenTopic={openTopic}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      {view === 'topics' && (
        <TopicsView
          insets={insets}
          balance={balance}
          groups={groups}
          isTeen={!!topicsData?.underAge}
          total={topicsData?.topicCount ?? 0}
          reduceMotion={reduceMotion}
          onBack={() => setView('hub')}
          onOpenTopic={openTopic}
          onLocked={t => setInfo({ kind: 'locked', topic: t })}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      {view === 'track' && detailTopic && (
        <TrackView
          insets={insets}
          balance={balance}
          topic={detailTopic}
          levels={levels}
          settings={settings}
          reduceMotion={reduceMotion}
          onBack={() => (topicsData ? setView('topics') : openTopics())}
          onPlayLevel={level => openLevel(detailTopic, level, levels.length)}
          onHowItWorks={() => setInfo({ kind: 'how' })}
          onOpenPoints={() => setInfo({ kind: 'points' })}
        />
      )}
      {view === 'track' && !detailTopic && (
        <View style={styles.waiting}>
          <Text style={styles.waitingTx}>{error || 'Loading levels…'}</Text>
        </View>
      )}
      <LevelSheet
        open={!!sheet}
        mode={sheet?.mode}
        level={sheet?.level}
        topic={sheet?.topic}
        balance={balance}
        settings={settings}
        reduceMotion={reduceMotion}
        onClose={() => setSheet(null)}
        onStart={startFromSheet}
      />
      <InfoSheet
        open={!!info}
        kind={info?.kind}
        topic={info?.topic}
        balance={balance}
        settings={settings}
        reduceMotion={reduceMotion}
        onClose={() => setInfo(null)}
        onShowMine={() => {
          setInfo(null);
          openTopics();
        }}
      />
      <QuizPlay
        open={!!playing}
        topic={playing?.topic}
        level={playing?.level}
        hasNext={!!playing?.hasNext}
        settings={settings}
        balance={balance}
        api={api}
        reduceMotion={reduceMotion}
        onClose={() => setPlaying(null)}
        onFinish={finish}
        onNextLevel={nextLevel}
      />
    </View>
  );
}

export default function SpotlightScreen() {
  return <QuizSpotlight />;
}

const styles = StyleSheet.create({
  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  waitingTx: { fontSize: 12, textAlign: 'center' },
});
