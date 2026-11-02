import { View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../../shared/store/AppContext.jsx';
import * as spotlightApi from '../../../shared/api/spotlight.js';
import * as quizApi from '../../../shared/api/quiz.js';
import { todayISO } from '../../../shared/utils/cycle.js';
import { useReduceMotion } from '../../dashboard/HeroCardFx.jsx';
import { PointsSheet, MessageSheet } from '../common/Sheets.jsx';
import { friendlyError, quizSettings } from '../quiz/quizLogic.js';
import HubView from './HubView.jsx';
import GuideSheet from './GuideSheet.jsx';
import { updateInvite, afterVisit, wasGuideSeen, markGuideSeen } from './inviteLogic.js';
import { moduleFor, blockedReason } from './registry.js';

const NO_STATS = { streak: 0, stars: 0, levelsDone: 0 };

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
  const { state } = useApp();
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

  useEffect(() => {
    loadHome();
    quizApi
      .getHome(token)
      .then(setQuizHome)
      .catch(() => {});
  }, [loadHome, token]);

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

  const exitModule = useCallback(() => setActive(null), []);
  const Module = active?.Module || null;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {Module ? (
        <Module insets={insets} reduceMotion={reduceMotion} challenge={active.challenge} onExit={exitModule} onChanged={loadHome} />
      ) : (
        <HubView
          insets={insets}
          balance={balance}
          stats={home?.stats || NO_STATS}
          challenges={home?.challenges || []}
          userId={userId}
          loading={!home}
          error={error}
          onRetry={loadHome}
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
        topicCount={guideSettings?.topicCount}
        settings={guideSettings}
        reduceMotion={reduceMotion}
        onDone={closeGuide}
      />
    </View>
  );
}
