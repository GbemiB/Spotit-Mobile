import { View, StyleSheet } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { PressScale } from './SpotlightFx.jsx';
import TopicIcon from './TopicIcon.jsx';
import { TopicWell, iconPalette, OPEN_DELAY_MS } from './TopicTile.jsx';
import { tone } from './quizTheme.js';
import { challengeTag } from './summaryLogic.js';

function useTapThenOpen(reduceMotion, onOpen) {
  const [play, setPlay] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function press() {
    if (timer.current) return;
    if (reduceMotion) {
      onOpen();
      return;
    }
    setPlay(n => n + 1);
    timer.current = setTimeout(() => {
      timer.current = null;
      onOpen();
    }, OPEN_DELAY_MS);
  }
  return { play, press };
}

function MiniWell({ icon, toneName, size, iconSize, style }) {
  const { colors: c, isDark } = useTheme();
  const p = iconPalette(toneName, isDark, c);
  return (
    <View style={[styles.mini, { width: size, height: size * 1.1, borderRadius: size * 0.34, backgroundColor: c.surface }, style]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: size * 0.34, backgroundColor: p.bg, borderWidth: 1, borderColor: p.line }]} />
      <TopicIcon icon={icon} size={iconSize} palette={p} play={0} reduceMotion />
    </View>
  );
}

export function QuizCard({ quiz, levelsWon, reduceMotion, onOpen }) {
  const { colors: c, isDark } = useTheme();
  const t = tone(quiz.tone || 'pink', isDark);
  const green = tone('green', isDark);
  const { press } = useTapThenOpen(reduceMotion, onOpen);
  const live = quiz.status === 'live';
  return (
    <PressScale onPress={press} accessibilityLabel={`${quiz.name}. ${quiz.blurb || ''}`}>
      <View style={[styles.quiz, { backgroundColor: c.surface, borderColor: t.line }]}>
        <View style={[styles.quizGlow, { backgroundColor: t.bg }]} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={[styles.kick, { color: live ? green.ink : c.textMuted }]}>Quiz · {live ? 'Live' : 'Coming soon'}</Text>
          <Text style={[styles.quizName, { color: c.textPrimary }]}>{quiz.name}</Text>
          {quiz.blurb ? <Text style={[styles.blurb, { color: c.textSecondary }]}>{quiz.blurb}</Text> : null}
          <Text style={[styles.won, { color: t.ink }]}>{levelsWon === 1 ? '1 level won' : `${levelsWon} levels won`}</Text>
        </View>
        <View style={styles.fan}>
          <MiniWell icon="myth" toneName="pink" size={42} iconSize={30} style={{ left: 0, top: 20, transform: [{ rotate: '-9deg' }] }} />
          <MiniWell icon="bowl" toneName="green" size={42} iconSize={30} style={{ right: 0, top: 20, transform: [{ rotate: '9deg' }] }} />
          <MiniWell icon="cycle" toneName="pink" size={50} iconSize={38} style={{ left: 28, top: 6, zIndex: 1 }} />
        </View>
      </View>
    </PressScale>
  );
}

export function GameTile({ game, index, reduceMotion, onOpen }) {
  const { colors: c, isDark } = useTheme();
  const t = tone(game.locked ? 'locked' : game.tone || 'pink', isDark);
  const tag = challengeTag(game);
  const { play, press } = useTapThenOpen(reduceMotion, onOpen);
  const wide = game.minAge >= 18;
  const well = (
    <TopicWell
      topic={{ icon: game.icon, tone: game.tone || 'pink', group: 'body' }}
      locked={game.locked}
      index={index}
      play={play}
      reduceMotion={reduceMotion}
    />
  );
  const tagView = (
    <Text
      style={[
        styles.tag,
        tag.muted
          ? { color: c.textMuted, backgroundColor: c.surface, borderColor: c.border }
          : { color: t.ink, backgroundColor: t.bg, borderColor: t.line },
      ]}
    >
      {tag.text}
    </Text>
  );
  return (
    <View style={{ flex: 1 }}>
      <PressScale onPress={press} accessibilityLabel={`${game.name}. ${tag.text}`}>
        <View style={[styles.tile, wide && styles.wide, { backgroundColor: c.surface, borderColor: c.border }]}>
          {wide ? (
            <>
              <View style={{ gap: 6, alignItems: 'flex-start' }}>
                {well}
                <Text style={[styles.adult, { color: c.textMuted, borderColor: c.border }]}>18+</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Text style={[styles.name, { color: game.locked ? c.textMuted : c.textPrimary }]}>{game.name}</Text>
                {game.blurb ? <Text style={[styles.blurb, { color: c.textSecondary }]}>{game.blurb}</Text> : null}
                <View style={{ marginTop: 4 }}>{tagView}</View>
              </View>
            </>
          ) : (
            <>
              {well}
              <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={2}>
                {game.name}
              </Text>
              {game.blurb ? (
                <Text style={[styles.blurb, { color: c.textSecondary }]} numberOfLines={3}>
                  {game.blurb}
                </Text>
              ) : null}
              <View style={{ marginTop: 'auto' }}>{tagView}</View>
            </>
          )}
        </View>
      </PressScale>
    </View>
  );
}

export function GameGrid({ games, reduceMotion, onOpen }) {
  const rows = [];
  let row = [];
  games.forEach(g => {
    if (g.minAge >= 18) {
      if (row.length) rows.push(row);
      rows.push([g]);
      row = [];
      return;
    }
    row.push(g);
    if (row.length === 2) {
      rows.push(row);
      row = [];
    }
  });
  if (row.length) rows.push(row);
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, ri) => (
        <View key={r[0].id} style={{ flexDirection: 'row', gap: 10 }}>
          {r.map((g, i) => (
            <GameTile key={g.id} game={g} index={ri * 2 + i} reduceMotion={reduceMotion} onOpen={() => onOpen(g)} />
          ))}
          {r.length === 1 && r[0].minAge < 18 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quiz: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 24, borderWidth: 1.5, overflow: 'hidden' },
  quizGlow: { position: 'absolute', right: -40, top: -30, width: 180, height: 180, borderRadius: 90, opacity: 0.9 },
  kick: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  quizName: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 26 },
  won: { fontSize: 9.5, fontWeight: '700', marginTop: 4 },
  fan: { width: 106, height: 80 },
  mini: { position: 'absolute', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tile: { minHeight: 176, padding: 12, borderRadius: 20, borderWidth: 1.5, gap: 8 },
  wide: { minHeight: 0, flexDirection: 'row', gap: 12 },
  name: { fontFamily: FONT.serif, fontSize: 16, lineHeight: 19 },
  blurb: { fontSize: 10.5, lineHeight: 15 },
  tag: {
    alignSelf: 'flex-start',
    fontSize: 9.5,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  adult: { fontSize: 9.5, fontWeight: '700', borderWidth: 1, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
});
