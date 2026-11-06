import { View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../../shared/store/AppContext.jsx';
import { A } from '../../../shared/store/actions.js';
import * as spotlightApi from '../../../shared/api/spotlight.js';
import * as quizApi from '../../../shared/api/quiz.js';
import * as rewardsApi from '../../../shared/api/rewards.js';
import { todayISO } from '../../../shared/utils/cycle.js';
import { useReduceMotion } from '../../dashboard/HeroCardFx.jsx';
import { PointsSheet, MessageSheet } from '../common/ui/Sheets.jsx';
import { friendlyError, quizSettings } from '../games/quiz/quizLogic.js';
import SpotlightHub from './SpotlightHub.jsx';
import GuideSheet from './GuideSheet.jsx';
import { updateInvite, afterVisit, wasGuideSeen, markGuideSeen } from './inviteLogic.js';
import { moduleFor, blockedReason } from './registry.js';

function blockedMessage(reason, challenge) {
  if (reason === 'locked') {
    return {
      icon: 'lock',
      title: `${challenge.name} opens at ${challenge.minAge}`,
      body: `This one opens by itself when you turn ${challenge.minAge}. Until then, there is plenty more to play.`,
    };
  }
  return {
    icon: 'sparkle',
    title: `${challenge.name} is coming soon`,
    body: 'We’re still building this one. It will show up here, with its price, as soon as it’s ready.',
  };
}

export default function SpotlightScreen() {
  const { state, dispatch } = useApp();
  const token = state.accessToken;
  const userId = state.userId;
  const balance = state.femPoints || 0;
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [home, setHome] = useState(null);
  const [quizHome, setQuizHome] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState(null);
  const [points, setPoints] = useState(false);
  const [guide, setGuide] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const guideSettings = useMemo(() => quizSettings(quizHome), [quizHome]);

  const loadHome = useCallback(
    () =>
      spotlightApi
        .getHome(token)
        .then(data => {
          setError(null);
          setHome(data);
        })
        .catch(e => setError(friendlyError(e))),
    [token],
  );

  const loadQuizHome = useCallback(
    () =>
      quizApi
        .getHome(token)
        .then(setQuizHome)
        .catch(() => {}),
    [token],
  );

  const loadBalance = useCallback(
    () =>
      rewardsApi
        .getSummary(token)
        .then(data => dispatch({ type: A.REWARDS_HYDRATED, ...data }))
        .catch(() => {}),
    [token, dispatch],
  );

  useEffect(() => {
    loadHome();
    loadQuizHome();
  }, [loadHome, loadQuizHome]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([loadHome(), loadQuizHome(), loadBalance()]);
    setRefreshing(false);
  }, [loadHome, loadQuizHome, loadBalance]);

  useEffect(() => {
    updateInvite(userId, r => afterVisit(r, todayISO()));
  }, [userId]);

  const homeReady = !!home;
  useEffect(() => {
    if (!homeReady) return undefined;
    let cancelled = false;
    wasGuideSeen(userId).then(seen => {
      if (!seen && !cancelled) setGuide(true);
    });
    return () => {
      cancelled = true;
    };
  }, [homeReady, userId]);

  function closeGuide() {
    setGuide(false);
    markGuideSeen(userId);
  }

  function openChallenge(challenge) {
    const reason = blockedReason(challenge);
    if (reason) {
      setMessage(blockedMessage(reason, challenge));
      return;
    }
    setActive({ challenge, Module: moduleFor(challenge) });
  }

  const exitModule = useCallback(() => {
    setActive(null);
    loadHome();
    loadBalance();
  }, [loadHome, loadBalance]);
  const Module = active?.Module || null;
  const inChallenge = !!Module;

  useEffect(() => {
    dispatch({ type: A.SET_NAV_HIDDEN, hidden: inChallenge });
  }, [inChallenge, dispatch]);

  useEffect(() => () => dispatch({ type: A.SET_NAV_HIDDEN, hidden: false }), [dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {Module ? (
        <Module insets={insets} reduceMotion={reduceMotion} challenge={active.challenge} onExit={exitModule} onChanged={loadHome} />
      ) : (
        <SpotlightHub
          insets={insets}
          balance={balance}
          stats={home?.stats || null}
          challenges={home?.challenges || []}
          freeLevels={guideSettings?.freeLevels ?? 0}
          loading={!home}
          error={error}
          onRetry={loadHome}
          refreshing={refreshing}
          onRefresh={refresh}
          reduceMotion={reduceMotion}
          onOpenChallenge={openChallenge}
          onOpenPoints={() => setPoints(true)}
        />
      )}
      <MessageSheet
        open={!!message}
        icon={message?.icon}
        title={message?.title}
        body={message?.body}
        reduceMotion={reduceMotion}
        onClose={() => setMessage(null)}
      />
      <PointsSheet open={points} balance={balance} onClose={() => setPoints(false)} />
      <GuideSheet
        open={guide && !!guideSettings && !Module && !message && !points}
        settings={guideSettings}
        challenges={home?.challenges || []}
        ranks={home?.ranks || []}
        reduceMotion={reduceMotion}
        onDone={closeGuide}
      />
    </View>
  );
}
