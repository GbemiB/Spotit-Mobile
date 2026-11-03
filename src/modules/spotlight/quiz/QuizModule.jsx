import { View, BackHandler, StyleSheet } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../shared/store/AppContext.jsx';
import { A } from '../../../shared/store/actions.js';
import * as quizApi from '../../../shared/api/quiz.js';
import { PointsSheet } from '../common/Sheets.jsx';
import { InfoSheet } from './QuizSheets.jsx';
import QuizTopicsV2 from '../v2/quiz/QuizTopicsV2.jsx';
import QuizTrackV2, { LevelSheetV2, levelLook } from '../v2/quiz/QuizTrackV2.jsx';
import QuizPlayV2 from '../v2/quiz/QuizPlayV2.jsx';
import { spotTokens } from '../v2/tokens.js';
import { CircleButton, PinkButton } from '../v2/ui.jsx';
import { BACK } from '../v2/quiz/quizArt.js';
import { useTheme, Text } from '../../../shared/styles/index.js';
import { toGroups, toChips, mergeTopicPages, toLevel, toTopic, sheetModeFor, friendlyError, quizSettings } from './quizLogic.js';

export default function QuizModule({ insets, reduceMotion, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const token = state.accessToken;
  const balance = state.femPoints || 0;
  const [view, setView] = useState('topics');
  const [home, setHome] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [topicFilter, setTopicFilter] = useState('all');
  const [loadingMore, setLoadingMore] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [info, setInfo] = useState(null);
  const [points, setPoints] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [openId, setOpenId] = useState(null);

  const settings = useMemo(() => quizSettings(home), [home]);

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

  const loadTopics = useCallback(
    filter => {
      setTopicsData(null);
      return load(() => quizApi.getTopics({ group: filter === 'all' ? undefined : filter }, token), setTopicsData);
    },
    [load, token],
  );

  const loadMoreTopics = useCallback(async () => {
    const cursor = topicsData?.nextCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await quizApi.getTopics({ cursor, group: topicFilter === 'all' ? undefined : topicFilter }, token);
      setTopicsData(prev => mergeTopicPages(prev, page));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoadingMore(false);
    }
  }, [topicsData?.nextCursor, loadingMore, topicFilter, token]);

  const loadDetail = useCallback(id => load(() => quizApi.getTopic(id, token), setDetail), [load, token]);

  useEffect(() => {
    quizApi
      .getHome(token)
      .then(setHome)
      .catch(() => {});
    quizApi
      .getTopics({}, token)
      .then(setTopicsData)
      .catch(e => setError(friendlyError(e)));
  }, [token]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (view === 'track') setView('topics');
      else onExit();
      return true;
    });
    return () => sub.remove();
  }, [view, onExit]);

  const spent = useCallback(
    newBalance => {
      if (typeof newBalance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance });
    },
    [dispatch],
  );

  function showAllTopics() {
    setView('topics');
    if (topicFilter !== 'all' || !topicsData) {
      setTopicFilter('all');
      loadTopics('all');
    }
  }

  function filterTopics(filter) {
    if (filter === topicFilter) return;
    setTopicFilter(filter);
    loadTopics(filter);
  }

  function openTopic(id) {
    setOpenId(id);
    setDetail(null);
    setView('track');
    loadDetail(id);
  }

  function openLevel(topic, level, levelCount) {
    setSheet({ mode: sheetModeFor(level, balance), level, topic, hasNext: levelCount > level.n });
  }

  function startFromSheet() {
    if (!sheet || sheet.mode === 'short' || levelLook(sheet.level, settings).locked) return;
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
    onChanged?.();
  }

  async function nextLevel() {
    const { topic, level } = playing;
    try {
      const fresh = await quizApi.getTopic(topic.id, token);
      setDetail(fresh);
      const next = fresh.levels.map(toLevel).find(l => l.n === level.n + 1);
      if (next && !levelLook(next, settings).locked && balance >= (next.cost || 0)) {
        setPlaying({ topic, level: next, hasNext: fresh.levels.length > next.n });
      } else {
        setPlaying(null);
      }
    } catch (e) {
      setPlaying(null);
      setError(friendlyError(e));
    }
  }

  const groups = toGroups(topicsData);
  const detailTopic = detail?.topic ? toTopic(detail.topic) : null;
  const levels = (detail?.levels || []).map(toLevel);
  const upNext = playing ? levels.find(l => l.n === playing.level.n + 1) : null;

  const groupOf = id => (topicsData?.allGroups || []).find(g => g.id === id) || {};
  const trackGroup = detailTopic ? groupOf(detailTopic.group) : {};

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {view === 'topics' && (
        <QuizTopicsV2
          t={t}
          insets={insets}
          balance={balance}
          groups={groups}
          chips={toChips(topicsData)}
          filter={topicFilter}
          onFilter={filterTopics}
          hasMore={!!topicsData?.nextCursor}
          loadingMore={loadingMore}
          loading={(loading || !topicsData) && !error}
          onLoadMore={loadMoreTopics}
          settings={settings}
          reduceMotion={reduceMotion}
          onBack={onExit}
          onOpenTopic={openTopic}
          onLocked={topic => setInfo({ kind: 'locked', topic })}
          onOpenPoints={() => setPoints(true)}
        />
      )}
      {view === 'track' && detailTopic && (
        <QuizTrackV2
          t={t}
          insets={insets}
          topic={detailTopic}
          group={trackGroup.label || ''}
          tone={trackGroup.tone || detailTopic.tone || 'pink'}
          levels={levels}
          settings={settings}
          reduceMotion={reduceMotion}
          onBack={showAllTopics}
          onPlayLevel={level => openLevel(detailTopic, level, levels.length)}
        />
      )}
      {view === 'track' && !detailTopic && (
        <View style={{ flex: 1 }}>
          <View style={[styles.waitingBack, { top: insets.top + 8 }]}>
            <CircleButton t={t} icon={BACK} label="Back to topics" onPress={showAllTopics} />
          </View>
          <View style={styles.waiting}>
            <Text style={[styles.waitingTx, { color: t.text2 }]}>{error || 'Loading levels…'}</Text>
            {error && openId ? (
              <PinkButton
                t={t}
                label="Try again"
                reduceMotion={reduceMotion}
                onPress={() => loadDetail(openId)}
                height={48}
                style={{ marginTop: 14, alignSelf: 'stretch' }}
              />
            ) : null}
          </View>
        </View>
      )}
      <LevelSheetV2
        t={t}
        open={!!sheet}
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
          showAllTopics();
        }}
      />
      <PointsSheet open={points} balance={balance} onClose={() => setPoints(false)} />
      <QuizPlayV2
        t={t}
        open={!!playing}
        topic={playing?.topic}
        level={playing?.level}
        hasNext={!!playing?.hasNext}
        nextCost={upNext?.cost || 0}
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

const styles = StyleSheet.create({
  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  waitingTx: { fontSize: 12, textAlign: 'center' },
  waitingBack: { position: 'absolute', left: 14, zIndex: 2 },
});
