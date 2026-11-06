import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Svg, { Circle, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { Text } from '../../../../shared/styles/index.js';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { Bob, PressScale } from '../../common/motion/effects.jsx';
import Character from '../../common/characters/Character.jsx';
import { ds, Pulse } from '../../common/motion/motion.jsx';
import { levelColor } from '../../common/style/tokens.js';
import { MAP_SIZE, WATER, ROADS, REGIONS, WATER_LABELS, ZOOMS } from './lagosShapes.js';
import { clampOffset, focusOffset, travelIcon } from './givedayLogic.js';

const LOCK = 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z';

export function lagosColors(isDark) {
  return isDark
    ? {
        sea: '#1E2A33',
        ground: '#1C2420',
        road: '#3A322C',
        label: 'rgba(245,237,233,0.55)',
        labelSoft: 'rgba(245,237,233,0.32)',
        homeWall: '#4A3438',
        homeDoor: '#5E3E46',
        meBg: '#3A2C30',
      }
    : {
        sea: '#CFE6F2',
        ground: '#E6F2E9',
        road: '#D9CFC8',
        label: 'rgba(46,36,41,0.45)',
        labelSoft: 'rgba(46,36,41,0.3)',
        homeWall: '#FFFFFF',
        homeDoor: '#E8C3BC',
        meBg: '#FFE3C8',
      };
}

function MapWalker({ t, m, z, pos, legMs, ride, moving, reduceMotion }) {
  const x = useAnimatedValue(pos.x);
  const y = useAnimatedValue(pos.y);
  useEffect(() => {
    if (reduceMotion || !legMs) {
      x.setValue(pos.x);
      y.setValue(pos.y);
      return undefined;
    }
    const anim = Animated.parallel([
      Animated.timing(x, { toValue: pos.x, duration: legMs, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(y, { toValue: pos.y, duration: legMs, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pos.x, pos.y, legMs, reduceMotion, x, y]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 3,
        transform: [{ translateX: Animated.add(Animated.multiply(x, z), -18) }, { translateY: Animated.add(Animated.multiply(y, z), -44) }],
      }}
    >
      <Bob distance={moving ? 4 : 0} duration={260} reduceMotion={reduceMotion || !moving}>
        <Pulse reduceMotion={reduceMotion} scale={1.04} duration={1800}>
          <View style={[styles.me, { backgroundColor: m.meBg, borderColor: t.pink }]}>
            <Character name="you" size={42} style={{ marginTop: -2, marginLeft: -5 }} asViewer />
          </View>
        </Pulse>
        <View style={[styles.pin, { borderTopColor: t.pink }]} />
        {ride && moving ? (
          <View style={[styles.ride, { backgroundColor: t.gold }]}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d={travelIcon(ride)} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        ) : null}
      </Bob>
    </Animated.View>
  );
}

export default function LagosMap({
  t,
  isDark,
  zoom,
  onZoom,
  areas,
  home,
  pos,
  legMs,
  ride,
  walking,
  selId,
  onArea,
  rings,
  levelNow,
  unitsPerKm,
  focus,
  topPad,
  bottomPad,
  reduceMotion,
}) {
  const m = lagosColors(isDark);
  const z = ZOOMS[zoom];
  const mapPx = useMemo(() => ({ width: MAP_SIZE.width * z, height: MAP_SIZE.height * z }), [z]);
  const [view, setView] = useState(null);
  const [offset] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const fx = focus ? focus.x : null;
  const fy = focus ? focus.y : null;

  useEffect(() => {
    if (fx == null || !view) return undefined;
    const pad = { start: topPad, end: bottomPad };
    const next = clampOffset(focusOffset({ x: fx, y: fy }, z, view, topPad + (view.height - topPad - bottomPad) / 2), view, mapPx, pad);
    if (reduceMotion) {
      offset.setValue(next);
      return undefined;
    }
    const anim = Animated.timing(offset, { toValue: next, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [fx, fy, z, view, mapPx, topPad, bottomPad, offset, reduceMotion]);

  const responder = useMemo(() => {
    const touch = { x: 0, y: 0, pinch: 0 };
    const pad = { start: topPad, end: bottomPad };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (e, g) => e.nativeEvent.touches.length > 1 || Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onMoveShouldSetPanResponderCapture: (e, g) => e.nativeEvent.touches.length > 1 || Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderGrant: () => {
        touch.pinch = 0;
        offset.stopAnimation(v => {
          touch.x = v.x;
          touch.y = v.y;
        });
      },
      onPanResponderMove: (e, g) => {
        const touches = e.nativeEvent.touches;
        if (touches.length > 1) {
          const d = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
          if (!touch.pinch) {
            touch.pinch = d;
            return;
          }
          const ratio = d / touch.pinch;
          if (ratio > 1.3 || ratio < 0.75) {
            touch.pinch = d;
            onZoom(ratio > 1 ? 1 : -1);
          }
          return;
        }
        if (touch.pinch || !view) return;
        offset.setValue(clampOffset({ x: touch.x + g.dx, y: touch.y + g.dy }, view, mapPx, pad));
      },
      onPanResponderTerminationRequest: () => false,
    });
  }, [offset, view, mapPx, topPad, bottomPad, onZoom]);

  const [translate] = useState(() => offset.getTranslateTransform());

  const ringList = home
    ? rings.map(l => ({
        key: l.number,
        r: l.radiusKm * unitsPerKm,
        on: l.number <= levelNow,
        color: levelColor(t, l.number),
        label: `Level ${l.number} · ${l.radiusKm} km`,
        top: (home.y - l.radiusKm * unitsPerKm) * z - 9,
      }))
    : [];

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: m.sea, overflow: 'hidden' }]}
      onLayout={e => setView({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      {...responder.panHandlers}
    >
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: mapPx.width, height: mapPx.height, transform: translate }}>
        <Svg
          width={mapPx.width}
          height={mapPx.height}
          viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Rect x={0} y={0} width={MAP_SIZE.width} height={MAP_SIZE.height} fill={m.ground} />
          <Polygon points={WATER.ocean} fill={m.sea} />
          <Polygon points={WATER.lagoon} fill={m.sea} />
          <Polygon points={WATER.creek} fill={m.sea} />
          <Polygon points={WATER.ologe} fill={m.sea} />
          <Polygon points={WATER.island} fill={m.ground} />
          {ROADS.map(r => (
            <Polyline
              key={r.name}
              points={r.points}
              fill="none"
              stroke={m.road}
              strokeWidth={Math.round(5 / z)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {ringList.map(r => (
            <Circle
              key={r.key}
              cx={home.x}
              cy={home.y}
              r={r.r}
              fill="none"
              stroke={r.on ? r.color : t.text3}
              strokeWidth={Math.round(1.6 / z)}
              strokeDasharray={`${Math.round(6 / z)} ${Math.round(5 / z)}`}
              opacity={0.7}
            />
          ))}
        </Svg>
        {WATER_LABELS.map(w => (
          <Text key={w.name} pointerEvents="none" style={[styles.water, { left: w.x * z - 60, top: w.y * z - 8, color: m.labelSoft }]}>
            {w.name}
          </Text>
        ))}
        {zoom === 0
          ? REGIONS.map(r => (
              <Text key={r.name} pointerEvents="none" style={[styles.region, { left: r.x * z - 60, top: r.y * z - 8, color: m.label }]}>
                {r.name}
              </Text>
            ))
          : null}
        {ringList.map(r => (
          <View key={r.key} pointerEvents="none" style={[styles.ringLabelBox, { left: home.x * z - 50, top: r.top }]}>
            <View style={[styles.ringLabelRow, { backgroundColor: t.surface }]}>
              <View style={[styles.ringDot, { backgroundColor: r.on ? r.color : t.starOff }]} />
              <Text style={[styles.ringLabel, { color: r.on ? t.text : t.text3 }]}>{r.label}</Text>
            </View>
          </View>
        ))}
        {areas.map(a => {
          const sel = selId === a.id;
          const isHome = home && home.id === a.id;
          const showName = sel || zoom >= 3 || (zoom >= 1 && !a.locked) || isHome;
          const dot = a.locked ? t.starOff : levelColor(t, a.level);
          return (
            <PressScale
              key={a.id}
              onPress={() => onArea(a)}
              accessibilityLabel={`${a.name}, level ${a.level}${a.locked ? ', locked' : ''}`}
              style={[styles.areaPin, { left: a.x * z - 7, top: a.y * z - 7 }]}
            >
              <View style={styles.areaRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: dot, borderColor: t.surface, shadowColor: sel ? t.pink : 'transparent' },
                    sel ? styles.dotSel : null,
                  ]}
                />
                {showName ? (
                  <Text style={[styles.areaName, { backgroundColor: t.surface, color: a.locked ? t.text3 : t.text }]}>{a.name}</Text>
                ) : null}
                {a.locked ? (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path d={LOCK} stroke={t.text3} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : null}
                {a.visited > 0 ? <Text style={[styles.doneText, { color: t.gold }]}>{a.visited}★</Text> : null}
              </View>
            </PressScale>
          );
        })}
        {home ? (
          <View pointerEvents="none" style={[styles.home, { left: home.x * z - 14, top: home.y * z - 30 }]}>
            <Svg width={28} height={26} viewBox="0 0 38 36">
              <Rect x={4} y={16} width={30} height={20} rx={3} fill={m.homeWall} />
              <Path d="M0 18 L19 2 L38 18 Z" fill={t.pink} />
              <Rect x={15} y={24} width={8} height={12} rx={2} fill={m.homeDoor} />
            </Svg>
          </View>
        ) : null}
        {pos ? <MapWalker t={t} m={m} z={z} pos={pos} legMs={legMs} ride={ride} moving={walking} reduceMotion={reduceMotion} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  water: { position: 'absolute', width: 120, textAlign: 'center', fontSize: ds(9), fontWeight: '800', letterSpacing: 3 },
  region: { position: 'absolute', width: 120, textAlign: 'center', fontSize: ds(10), fontWeight: '800', letterSpacing: 2 },
  ringLabelBox: { position: 'absolute', width: 100, alignItems: 'center' },
  ringLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  ringDot: { width: 6, height: 6, borderRadius: 3 },
  ringLabel: { fontSize: ds(8.5), fontWeight: '800' },
  areaPin: { position: 'absolute', zIndex: 1 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5 },
  dotSel: { shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
  areaName: { fontSize: ds(9.5), fontWeight: '800', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 7, overflow: 'hidden' },
  doneText: { fontSize: ds(9), fontWeight: '800' },
  home: { position: 'absolute', width: 28, zIndex: 1 },
  me: { width: 36, height: 36, borderRadius: 18, borderWidth: 2.5, overflow: 'hidden' },
  pin: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ride: {
    position: 'absolute',
    right: -14,
    top: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
