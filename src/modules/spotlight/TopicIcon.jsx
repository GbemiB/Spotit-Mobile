import { Animated, Easing, View } from 'react-native';
import { useEffect } from 'react';
import Svg, { Path, Circle, Ellipse, Rect, Text as SvgText } from 'react-native-svg';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { useLoopValue } from './SpotlightFx.jsx';

export function kf(v, T, frames) {
  const input = [];
  const output = [];
  frames.forEach(([ms, val]) => {
    const x = Math.min(ms / T, 1);
    if (input.length && x <= input[input.length - 1]) return;
    input.push(x);
    output.push(val);
  });
  if (input[0] !== 0) {
    input.unshift(0);
    output.unshift(output[0]);
  }
  if (input[input.length - 1] !== 1) {
    input.push(1);
    output.push(output[output.length - 1]);
  }
  return v.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' });
}

function kfDeg(v, T, frames) {
  return kf(
    v,
    T,
    frames.map(([ms, d]) => [ms, `${d}deg`]),
  );
}

function wave(v, a, b) {
  return v.interpolate({ inputRange: [0, 1], outputRange: [a, b] });
}

export function useTap(play, T, reduceMotion) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!play || reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: T, easing: Easing.linear, useNativeDriver: true });
    anim.start(() => v.setValue(0));
    return () => anim.stop();
  }, [play, T, reduceMotion, v]);
  return v;
}

function Part({ s, o = [24, 24], style, children, layers }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: 0, top: 0, width: s, height: s, transformOrigin: `${(o[0] / 48) * 100}% ${(o[1] / 48) * 100}%` },
        style,
      ]}
    >
      {children ? (
        <Svg width={s} height={s} viewBox="0 0 48 48">
          {children}
        </Svg>
      ) : null}
      {layers}
    </Animated.View>
  );
}

function line(p, width = 2.2, color) {
  return { stroke: color || p.ink, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
}

function pop(tap, T, start) {
  return kf(tap, T, [
    [0, 1],
    [start, 1],
    [start + 210, 1.16],
    [start + 400, 0.96],
    [start + 600, 1],
  ]);
}

function CycleIcon({ s, p, tap, rm }) {
  const T = 1100;
  const idle = useLoopValue(16000, rm, { linear: true });
  const lap = kf(tap, T, [
    [0, 0],
    [600, 1.06],
    [850, 0.98],
    [1100, 1],
  ]);
  const rotate = Animated.add(idle, lap).interpolate({ inputRange: [0, 2], outputRange: ['0deg', '720deg'] });
  const ring = kf(tap, T, [
    [0, 1],
    [400, 1.05],
    [900, 1],
  ]);
  const drop = 'M24 16.5c3.4 3.9 5.4 6.6 5.4 9.2a5.4 5.4 0 0 1-10.8 0c0-2.6 2-5.3 5.4-9.2z';
  return (
    <>
      <Part s={s} style={{ transform: [{ scale: ring }] }}>
        <Circle cx={24} cy={24} r={18.5} fill={p.soft} opacity={0.55} />
        <Circle cx={24} cy={24} r={14} stroke={p.surface} strokeWidth={7} fill="none" />
        <Circle cx={24} cy={24} r={14} stroke={p.soft} strokeWidth={5} fill="none" />
        <Circle
          cx={24}
          cy={24}
          r={14}
          stroke={p.ink}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="14.95 73.01"
          strokeDashoffset={21.99}
        />
        <Circle
          cx={24}
          cy={24}
          r={14}
          stroke={p.mid}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="11.43 76.53"
          strokeDashoffset={-14.07}
        />
      </Part>
      <Part s={s} o={[24, 26]} style={{ transform: [{ scale: pop(tap, T, 150) }] }}>
        <Path d={drop} fill={p.mid} />
        <Path d={drop} {...line(p)} />
        <Ellipse cx={21.8} cy={25.6} rx={1.1} ry={2} fill={p.hl} />
      </Part>
      <Part s={s} style={{ transform: [{ rotate }] }}>
        <Circle cx={24} cy={10} r={4.2} fill={p.surface} stroke={p.ink} strokeWidth={2.2} />
        <Circle cx={24} cy={10} r={1.6} fill={p.ink} />
      </Part>
    </>
  );
}

function MythIcon({ s, p, tap, rm }) {
  const T = 1600;
  const typing = useLoopValue(1600, rm, { linear: true });
  const sway = useLoopValue(5000, rm);
  const flip = kf(tap, T, [
    [0, 1],
    [360, 0.02],
    [900, 1],
  ]);
  const qm = kf(tap, T, [
    [0, 1],
    [355, 1],
    [365, 0],
    [1450, 0],
    [1600, 1],
  ]);
  const tick = kf(tap, T, [
    [0, 0],
    [355, 0],
    [365, 1],
    [1250, 1],
    [1450, 0],
  ]);
  const rays = kf(tap, T, [
    [0, 0],
    [350, 0],
    [630, 1],
    [1050, 0],
  ]);
  const raysScale = kf(tap, T, [
    [0, 0.5],
    [350, 0.5],
    [1050, 1.25],
    [1100, 0.5],
  ]);
  const bubble = 'M5 18a6 6 0 0 1 6-6h17a6 6 0 0 1 6 6v11a6 6 0 0 1-6 6H17l-7 6v-6.3A6 6 0 0 1 5 29z';
  const back = 'M27 6h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-1v3.5L34.5 20H27a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z';
  const dot = (i, cx) => {
    const a = i * 0.12;
    const range = [0, a + 0.001, a + 0.15, a + 0.3, 1];
    return (
      <Part
        key={cx}
        s={s}
        style={{
          opacity: typing.interpolate({ inputRange: range, outputRange: [0.45, 0.45, 1, 0.45, 0.45] }),
          transform: [{ translateY: typing.interpolate({ inputRange: range, outputRange: [0, 0, (-1.6 * s) / 48, 0, 0] }) }],
        }}
      >
        <Circle cx={cx} cy={13} r={1.4} fill={p.surface} />
      </Part>
    );
  };
  return (
    <>
      <Part s={s} o={[41, 9]} style={{ opacity: rays, transform: [{ scale: raysScale }] }}>
        <Path d="M41 9.5l3-2.5M42.5 16.5h4M37 5l.8-3.6" {...line(p)} />
      </Part>
      <Part s={s}>
        <Path d={back} fill={p.mid} />
        <Path d={back} {...line(p, 1.6)} />
      </Part>
      {dot(0, 29)}
      {dot(1, 33)}
      {dot(2, 37)}
      <Part
        s={s}
        o={[11, 40]}
        style={{ transform: [{ rotate: wave(sway, '-3deg', '3deg') }] }}
        layers={
          <Part
            s={s}
            o={[19.5, 26]}
            style={{ transform: [{ scaleX: flip }] }}
            layers={
              <>
                <Part s={s} style={{ opacity: qm }}>
                  <Path d="M16 20.5a3.6 3.6 0 1 1 5 3.3c-1 .5-1.5 1.2-1.5 2.4" {...line(p, 2.6)} />
                  <Circle cx={19.5} cy={30.2} r={1.7} fill={p.ink} />
                </Part>
                <Part s={s} style={{ opacity: tick }}>
                  <Path d="M13.5 24l4.3 4.3 7.7-8" {...line(p, 3)} />
                </Part>
              </>
            }
          >
            <Path d={bubble} fill={p.soft} />
            <Path d="M8 18a4 4 0 0 1 4-4h6c-4 1-7 4-8 9H8z" fill={p.surface} opacity={0.55} />
            <Path d={bubble} {...line(p)} />
          </Part>
        }
      />
    </>
  );
}

function SproutIcon({ s, p, tap, rm }) {
  const T = 2100;
  const sway = useLoopValue(4000, rm);
  const grow = kf(tap, T, [
    [0, 1],
    [400, 1.18],
    [700, 0.96],
    [1000, 1],
  ]);
  const bloomOp = kf(tap, T, [
    [0, 0],
    [250, 0],
    [790, 1],
    [1600, 1],
    [2050, 0],
  ]);
  const bloomScale = kf(tap, T, [
    [0, 0.01],
    [250, 0.01],
    [790, 1.1],
    [1600, 1],
    [2050, 0.8],
    [2100, 0.01],
  ]);
  const spin = kfDeg(tap, T, [
    [0, 0],
    [250, 0],
    [2050, 360],
  ]);
  const leaf1 = 'M24 24c-1-6.5-6.5-9.6-13-8.5.2 6.4 5.6 9.6 13 8.5z';
  const leaf2 = 'M24 19.5c1-5.4 5.3-8.4 10.7-7.5-.2 5.3-4.4 8.3-10.7 7.5z';
  const petals = [
    [24, 4.6],
    [28.2, 7.6],
    [26.6, 12.5],
    [21.4, 12.5],
    [19.8, 7.6],
  ];
  return (
    <>
      <Part s={s} o={[24, 9]} style={{ opacity: bloomOp, transform: [{ scale: bloomScale }, { rotate: spin }] }}>
        {petals.map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.9} fill={p.mid} />
        ))}
        <Circle cx={24} cy={9} r={2.4} fill={p.ink} />
        <Circle cx={23.3} cy={8.3} r={0.7} fill={p.hl} />
      </Part>
      <Part
        s={s}
        o={[24, 32]}
        style={{ transform: [{ scaleY: grow }] }}
        layers={
          <>
            <Part s={s} o={[24, 24]} style={{ transform: [{ rotate: wave(sway, '0deg', '-6deg') }] }}>
              <Path d={leaf1} fill={p.soft} />
              <Path d={leaf1} {...line(p)} />
              <Path d="M23 23c-3-2.8-6-4.6-9.5-5.6" {...line(p, 1.6)} />
            </Part>
            <Part s={s} o={[24, 19.5]} style={{ transform: [{ rotate: wave(sway, '0deg', '6deg') }] }}>
              <Path d={leaf2} fill={p.mid} />
              <Path d={leaf2} {...line(p)} />
            </Part>
          </>
        }
      >
        <Path d="M24 32V15" {...line(p)} />
      </Part>
      <Part s={s}>
        <Path d="M13.5 31h21l-2.6 11.2a2 2 0 0 1-2 1.6H18.1a2 2 0 0 1-2-1.6z" fill={p.soft} />
        <Rect x={12} y={30} width={24} height={4.6} fill={p.mid} />
        <Path d="M12.5 30h23v4.6h-23zM14.4 34.6l2.1 7.8a2 2 0 0 0 2 1.4h11a2 2 0 0 0 2-1.4l2.1-7.8" {...line(p)} />
        <Path d="M17.5 37.5l.8 3.4" {...line(p, 1.8, p.hl)} />
      </Part>
    </>
  );
}

function BottleIcon({ s, p, tap, rm }) {
  const T = 1500;
  const u = s / 48;
  const warm = useLoopValue(3600, rm);
  const steam = useLoopValue(3600, rm, { linear: true, delay: 1000 });
  const wisp = start => ({
    opacity: kf(tap, T, [
      [0, 0],
      [start, 0],
      [start + 385, 0.9],
      [start + 1100, 0],
    ]),
    transform: [
      {
        translateY: kf(tap, T, [
          [0, 3 * u],
          [start, 3 * u],
          [start + 1100, -9 * u],
          [start + 1150, 3 * u],
        ]),
      },
    ],
  });
  const sx = kf(tap, T, [
    [0, 1],
    [210, 1.08],
    [420, 0.97],
    [700, 1],
  ]);
  const sy = kf(tap, T, [
    [0, 1],
    [210, 0.9],
    [420, 1.04],
    [700, 1],
  ]);
  const body = 'M16 16.2h16a5 5 0 0 1 5 5V37a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7V21.2a5 5 0 0 1 5-5z';
  const knit =
    'M11.5 23.5c2.2-1.4 4.2-1.4 6.3 0s4.2 1.4 6.2 0 4.2-1.4 6.3 0 4.1 1.4 6.2 0M11.5 39c2.2-1.4 4.2-1.4 6.3 0s4.2 1.4 6.2 0 4.2-1.4 6.3 0 4.1 1.4 6.2 0';
  return (
    <>
      <Part s={s} o={[24, 30]} style={{ opacity: wave(warm, 0.45, 0.8), transform: [{ scale: wave(warm, 0.92, 1.06) }] }}>
        <Circle cx={24} cy={30} r={17} fill={p.soft} />
      </Part>
      <Part s={s} style={wisp(100)}>
        <Path d="M17 10c-2-2 2-3.2 0-5.4" {...line(p, 1.6)} />
      </Part>
      <Part
        s={s}
        style={{
          opacity: steam.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.9, 0] }),
          transform: [{ translateY: wave(steam, 3 * u, -9 * u) }],
        }}
      >
        <Path d="M24 8.6c-2-2 2-3.2 0-5.4" {...line(p, 1.6)} />
      </Part>
      <Part s={s} style={wisp(300)}>
        <Path d="M31 10c-2-2 2-3.2 0-5.4" {...line(p, 1.6)} />
      </Part>
      <Part
        s={s}
        o={[24, 44]}
        style={{ transform: [{ scaleX: sx }, { scaleY: sy }] }}
        layers={
          <Part s={s} o={[24, 31.5]} style={{ transform: [{ scale: pop(tap, T, 200) }] }}>
            <Path d="M24 36.5s-5.6-3.3-5.6-7a3.1 3.1 0 0 1 5.6-1.8 3.1 3.1 0 0 1 5.6 1.8c0 3.7-5.6 7-5.6 7z" fill={p.ink} />
            <Circle cx={21.3} cy={29.3} r={0.9} fill={p.hl} />
          </Part>
        }
      >
        <Rect x={19.5} y={12} width={9} height={4.2} fill={p.mid} />
        <Path d="M19.5 12h9v4.2h-9zM18 12h12" {...line(p)} />
        <Path d={body} fill={p.soft} />
        <Path d={knit} {...line(p, 1.6, p.mid)} />
        <Path d={body} {...line(p)} />
        <Path d="M14.5 27v5" {...line(p, 1.8, p.hl)} />
      </Part>
    </>
  );
}

function MoleculeIcon({ s, p, tap, rm }) {
  const T = 1300;
  const rock = useLoopValue(7000, rm);
  const n1 = useLoopValue(3200, rm);
  const n2 = useLoopValue(3200, rm, { delay: 1000 });
  const n3 = useLoopValue(3200, rm, { delay: 2000 });
  const spin = kfDeg(tap, T, [
    [0, 0],
    [700, 380],
    [950, 355],
    [1150, 360],
  ]);
  const lit = (start, cx, cy) => (
    <Part
      key={`lit-${cx}`}
      s={s}
      o={[cx, cy]}
      style={{
        opacity: kf(tap, T, [
          [0, 0],
          [start, 0],
          [start + 180, 1],
          [start + 450, 0],
        ]),
        transform: [
          {
            scale: kf(tap, T, [
              [0, 0.6],
              [start, 0.6],
              [start + 180, 1.5],
              [start + 450, 1.9],
              [start + 460, 0.6],
            ]),
          },
        ],
      }}
    >
      <Circle cx={cx} cy={cy} r={6} fill={p.mid} />
    </Part>
  );
  const hex = 'M24 14.5l8.2 4.75v9.5L24 33.5l-8.2-4.75v-9.5z';
  return (
    <Part
      s={s}
      style={{ transform: [{ rotate: wave(rock, '-7deg', '7deg') }] }}
      layers={
        <Part
          s={s}
          style={{ transform: [{ rotate: spin }] }}
          layers={
            <>
              {lit(550, 24, 7)}
              {lit(700, 38.6, 32.5)}
              {lit(850, 9.4, 32.5)}
              <Part s={s} o={[24, 7]} style={{ transform: [{ scale: wave(n1, 1, 1.12) }] }}>
                <Circle cx={24} cy={7} r={3.6} fill={p.ink} />
                <Circle cx={22.9} cy={5.9} r={1} fill={p.hl} />
              </Part>
              <Part s={s} o={[38.6, 32.5]} style={{ transform: [{ scale: wave(n2, 1, 1.12) }] }}>
                <Circle cx={38.6} cy={32.5} r={4.2} fill={p.mid} />
                <Circle cx={38.6} cy={32.5} r={4.2} {...line(p)} />
                <Circle cx={37.3} cy={31.2} r={1} fill={p.hl} />
              </Part>
              <Part s={s} o={[9.4, 32.5]} style={{ transform: [{ scale: wave(n3, 1, 1.12) }] }}>
                <Circle cx={9.4} cy={32.5} r={3.4} fill={p.soft} />
                <Circle cx={9.4} cy={32.5} r={3.4} {...line(p)} />
              </Part>
            </>
          }
        >
          <Path d={hex} fill={p.soft} />
          <Path d={`${hex}M24 14.5V8.5M32.2 28.75l5.2 3M15.8 28.75l-5.2 3`} {...line(p)} />
          <Circle cx={24} cy={24} r={3.4} fill={p.surface} />
          <Circle cx={24} cy={24} r={3.4} {...line(p, 1.6)} />
        </Part>
      }
    />
  );
}

function sparklePath(x, y, r) {
  const a = r * 0.15;
  const b = r * 0.65;
  return `M${x} ${y - r}c${a} ${b} ${b - a} ${r - a} ${r} ${r}c${-(r - b + a)} ${a} ${-(r - a)} ${b - a} ${-r} ${r}c${-a} ${-b} ${-(b - a)} ${-(r - a)} ${-r} ${-r}c${r - b + a} ${-a} ${r - a} ${-(b - a)} ${r} ${-r}z`;
}

function MirrorIcon({ s, p, tap, rm }) {
  const T = 1100;
  const u = s / 48;
  const t1 = useLoopValue(2800, rm);
  const t2 = useLoopValue(2800, rm, { delay: 900 });
  const t3 = useLoopValue(2800, rm, { delay: 1800 });
  const popS = pop(tap, T, 300);
  const tilt = kfDeg(tap, T, [
    [0, 0],
    [315, -12],
    [600, 2],
    [800, 0],
  ]);
  const sheenX = kf(tap, T, [
    [0, -18 * u],
    [100, -18 * u],
    [1000, 18 * u],
    [1050, -18 * u],
  ]);
  const sheenOp = kf(tap, T, [
    [0, 0],
    [100, 0],
    [325, 0.95],
    [1000, 0],
  ]);
  const sparkle = (v, x, y, r, color) => (
    <Part
      key={`${x}-${y}`}
      s={s}
      o={[x, y]}
      style={{
        opacity: wave(v, 0.55, 1),
        transform: [{ scale: Animated.multiply(wave(v, 0.7, 1.1), popS) }, { rotate: wave(v, '0deg', '20deg') }],
      }}
    >
      <Path d={sparklePath(x, y, r)} fill={color} />
    </Part>
  );
  return (
    <>
      <Part
        s={s}
        o={[34, 36]}
        style={{ transform: [{ rotate: tilt }] }}
        layers={
          <>
            <View
              style={{
                position: 'absolute',
                left: 10 * u,
                top: 10 * u,
                width: 20 * u,
                height: 20 * u,
                borderRadius: 10 * u,
                overflow: 'hidden',
              }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 7.5 * u,
                  top: -8 * u,
                  width: 5 * u,
                  height: 36 * u,
                  backgroundColor: p.surface,
                  opacity: sheenOp,
                  transform: [{ translateX: sheenX }, { rotate: '25deg' }],
                }}
              />
            </View>
            <Part s={s}>
              <Circle cx={20} cy={20} r={10} {...line(p, 1.6)} />
            </Part>
          </>
        }
      >
        <Path d="M28.5 28.5l9.5 9.5" stroke={p.ink} strokeWidth={6.4} strokeLinecap="round" />
        <Path d="M28.5 28.5l9.5 9.5" stroke={p.mid} strokeWidth={2.6} strokeLinecap="round" />
        <Circle cx={20} cy={20} r={13.5} fill={p.mid} />
        <Circle cx={20} cy={20} r={13.5} {...line(p)} />
        <Circle cx={20} cy={20} r={10} fill={p.surface} />
        <Circle cx={20} cy={20} r={10} fill={p.soft} opacity={0.7} />
        <Path d="M12 16a9 9 0 0 1 7-6.5l-1 3a6 6 0 0 0-3.5 4z" fill={p.surface} opacity={0.8} />
      </Part>
      {sparkle(t1, 40, 8.5, 4, p.ink)}
      {sparkle(t2, 7, 38.9, 2.9, p.mid)}
      {sparkle(t3, 43, 23.3, 2.3, p.ink)}
    </>
  );
}

function MoodIcon({ s, p, tap, rm }) {
  const T = 1800;
  const u = s / 48;
  const blink = useLoopValue(5000, rm, { linear: true });
  const flat = kf(tap, T, [
    [0, 1],
    [620, 1],
    [640, 0],
    [1450, 0],
    [1650, 1],
  ]);
  const smile = kf(tap, T, [
    [0, 0],
    [620, 0],
    [720, 1],
    [1440, 1],
    [1700, 0],
  ]);
  const heart = start => ({
    opacity: kf(tap, T, [
      [0, 0],
      [start, 0],
      [start + 360, 1],
      [start + 1200, 0],
    ]),
    transform: [
      {
        translateY: kf(tap, T, [
          [0, 2 * u],
          [start, 2 * u],
          [start + 360, -3 * u],
          [start + 1200, -12 * u],
          [start + 1250, 2 * u],
        ]),
      },
    ],
  });
  return (
    <>
      <Part s={s} style={heart(200)}>
        <Path d="M36 11s-3-1.8-3-3.8a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2-3 3.8-3 3.8z" fill={p.ink} />
      </Part>
      <Part s={s} style={heart(400)}>
        <Path d="M12 9s-2.4-1.4-2.4-3a1.4 1.4 0 0 1 2.4-.8 1.4 1.4 0 0 1 2.4.8c0 1.6-2.4 3-2.4 3z" fill={p.mid} />
      </Part>
      <Part
        s={s}
        o={[24, 26]}
        style={{ transform: [{ scale: pop(tap, T, 0) }] }}
        layers={
          <>
            <Part
              s={s}
              o={[24, 25]}
              style={{
                transform: [{ scaleY: blink.interpolate({ inputRange: [0, 0.9, 0.94, 0.98, 1], outputRange: [1, 1, 0.12, 1, 1] }) }],
              }}
            >
              <Ellipse cx={18.5} cy={25} rx={2} ry={2.5} fill={p.ink} />
              <Ellipse cx={29.5} cy={25} rx={2} ry={2.5} fill={p.ink} />
              <Circle cx={19.1} cy={24.1} r={0.7} fill={p.hl} />
              <Circle cx={30.1} cy={24.1} r={0.7} fill={p.hl} />
            </Part>
            <Part s={s} style={{ opacity: flat }}>
              <Path d="M19 33.5c3-1.6 7 1.6 10 0" {...line(p)} />
            </Part>
            <Part s={s} style={{ opacity: smile }}>
              <Ellipse cx={14.8} cy={31} rx={3} ry={1.8} fill={p.primary} opacity={0.35} />
              <Ellipse cx={33.2} cy={31} rx={3} ry={1.8} fill={p.primary} opacity={0.35} />
              <Path d="M18 32c3 4.5 9 4.5 12 0" {...line(p)} />
            </Part>
          </>
        }
      >
        <Circle cx={24} cy={26} r={16} fill={p.soft} />
        <Path d="M10.5 22a14.5 14.5 0 0 1 18-10.5c-4 .2-7 2.2-8.5 5.3-2.6-1.7-6-1.3-9.5 5.2z" fill={p.mid} />
        <Circle cx={24} cy={26} r={16} {...line(p)} />
        <Ellipse cx={15.5} cy={20} rx={1.3} ry={2} fill={p.hl} />
      </Part>
    </>
  );
}

function MoonIcon({ s, p, tap, rm }) {
  const T = 1900;
  const u = s / 48;
  const sway = useLoopValue(6000, rm);
  const drift = useLoopValue(5000, rm);
  const star = useLoopValue(3200, rm);
  const rockT = kfDeg(tap, T, [
    [0, 0],
    [330, -14],
    [715, 8],
    [1100, 0],
  ]);
  const z = (start, x, y, size, color) => (
    <Part
      key={x}
      s={s}
      o={[x + 2, y - 2]}
      style={{
        opacity: kf(tap, T, [
          [0, 0],
          [start, 0],
          [start + 390, 1],
          [start + 1300, 0],
        ]),
        transform: [
          {
            translateX: kf(tap, T, [
              [0, 0],
              [start, 0],
              [start + 1300, 6 * u],
            ]),
          },
          {
            translateY: kf(tap, T, [
              [0, 4 * u],
              [start, 4 * u],
              [start + 1300, -12 * u],
            ]),
          },
          {
            scale: kf(tap, T, [
              [0, 0.6],
              [start, 0.6],
              [start + 1300, 1.1],
            ]),
          },
        ],
      }}
    >
      <SvgText x={x} y={y} fontWeight="800" fontSize={size} fill={color}>
        z
      </SvgText>
    </Part>
  );
  const moon = 'M29 10.9A14 14 0 1 0 35.2 27.8 11 11 0 0 1 29 10.9z';
  const cloud = 'M26 42a4 4 0 0 1 .6-8 5.6 5.6 0 0 1 10.6-1.2A4.6 4.6 0 0 1 41.5 42z';
  return (
    <>
      {z(100, 31, 13, 8, p.ink)}
      {z(350, 36, 8.5, 6.5, p.mid)}
      {z(600, 40, 5, 5, p.ink)}
      <Part
        s={s}
        o={[22, 23]}
        style={{ transform: [{ rotate: rockT }] }}
        layers={
          <Part s={s} o={[26, 30]} style={{ transform: [{ rotate: wave(sway, '-3deg', '3deg') }] }}>
            <Path d={moon} fill={p.soft} />
            <Path d="M13 31a14 14 0 0 0 20 0c-6 2-14 2-20 0z" fill={p.mid} opacity={0.55} />
            <Path d={moon} {...line(p)} />
            <Path d="M12.5 18.5a11 11 0 0 1 3.5-4.5" {...line(p, 1.8, p.hl)} />
            <Path d="M14.5 23c1.3 1.3 3.2 1.3 4.5 0" {...line(p, 1.6)} />
            <Path d="M17 28.6c1.4 1 3.2 1 4.6 0" {...line(p, 1.6)} />
            <Ellipse cx={13} cy={26.6} rx={2} ry={1.2} fill={p.primary} opacity={0.35} />
          </Part>
        }
      />
      <Part s={s} style={{ transform: [{ translateX: wave(drift, 0, 1.6 * u) }] }}>
        <Path d={cloud} fill={p.mid} />
        <Path d={cloud} {...line(p)} />
      </Part>
      <Part
        s={s}
        o={[40, 20.9]}
        style={{
          opacity: wave(star, 0.55, 1),
          transform: [{ scale: wave(star, 0.7, 1.1) }, { rotate: wave(star, '0deg', '20deg') }],
        }}
      >
        <Path d={sparklePath(40, 20.9, 2.9)} fill={p.ink} />
      </Part>
    </>
  );
}

function BoxIcon({ s, p, tap, rm }) {
  const T = 1500;
  const u = s / 48;
  const bow = useLoopValue(4500, rm, { linear: true });
  const lidY = kf(tap, T, [
    [0, 0],
    [390, -8 * u],
    [910, -8 * u],
    [1150, 1 * u],
    [1300, 0],
  ]);
  const lidR = kfDeg(tap, T, [
    [0, 0],
    [390, -16],
    [910, -16],
    [1150, 2],
    [1300, 0],
  ]);
  const ideaOp = kf(tap, T, [
    [0, 0],
    [180, 0],
    [600, 1],
    [1080, 1],
    [1500, 0],
  ]);
  const ideaY = kf(tap, T, [
    [0, 10 * u],
    [180, 10 * u],
    [600, -2 * u],
    [1080, -2 * u],
    [1490, -4 * u],
    [1500, 10 * u],
  ]);
  const ideaS = kf(tap, T, [
    [0, 0.5],
    [180, 0.5],
    [600, 1],
    [1490, 1],
    [1500, 0.5],
  ]);
  const bowPath = 'M24 19c-2.6-4.6-8-5.2-8-2.2 0 2.6 5 2.2 8 2.2zM24 19c2.6-4.6 8-5.2 8-2.2 0 2.6-5 2.2-8 2.2z';
  return (
    <>
      <Part s={s} o={[24, 13]} style={{ opacity: ideaOp, transform: [{ translateY: ideaY }, { scale: ideaS }] }}>
        <Path d="M24 1.5v2.4M14.5 5.5l1.7 1.7M33.5 5.5l-1.7 1.7" {...line(p, 1.6)} />
        <Circle cx={24} cy={13} r={6.2} fill={p.mid} />
        <Circle cx={24} cy={13} r={6.2} {...line(p)} />
        <Path d="M21.8 19.4h4.4M22.4 13.5l1.6 1.8 1.6-1.8" {...line(p, 1.6)} />
        <Circle cx={21.8} cy={10.8} r={1.2} fill={p.hl} />
      </Part>
      <Part s={s}>
        <Path d="M11 25h26v13a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4z" fill={p.soft} />
        <Rect x={21} y={25} width={6} height={17} fill={p.mid} />
        <Path d="M11 25h26v13a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4zM21 25v17M27 25v17" {...line(p)} />
        <Path d="M14 29v6" {...line(p, 1.8, p.hl)} />
      </Part>
      <Part
        s={s}
        o={[9, 25]}
        style={{ transform: [{ translateY: lidY }, { rotate: lidR }] }}
        layers={
          <Part
            s={s}
            o={[24, 19]}
            style={{
              transform: [
                {
                  rotate: bow.interpolate({
                    inputRange: [0, 0.8, 0.86, 0.92, 1],
                    outputRange: ['0deg', '0deg', '-8deg', '6deg', '0deg'],
                  }),
                },
              ],
            }}
          >
            <Path d={bowPath} fill={p.mid} />
            <Path d={bowPath} {...line(p)} />
          </Part>
        }
      >
        <Rect x={9} y={19} width={30} height={6} fill={p.soft} />
        <Rect x={20.5} y={19} width={7} height={6} fill={p.mid} />
        <Path d="M9 19h30v6H9zM20.5 19v6M27.5 19v6" {...line(p)} />
      </Part>
    </>
  );
}

function BowlIcon({ s, p, tap, rm }) {
  const T = 800;
  const u = s / 48;
  const sway = useLoopValue(3800, rm);
  const hop = start => ({
    transform: [
      {
        translateY: kf(tap, T, [
          [0, 0],
          [start, 0],
          [start + 200, -7 * u],
          [start + 340, 0.8 * u],
          [start + 450, 0],
        ]),
      },
    ],
  });
  const sx = kf(tap, T, [
    [0, 1],
    [180, 1.08],
    [360, 0.97],
    [600, 1],
  ]);
  const sy = kf(tap, T, [
    [0, 1],
    [180, 0.9],
    [360, 1.04],
    [600, 1],
  ]);
  const leaf = 'M27 15c1-5.4 5.3-7.6 9.6-6.6-1 4.6-4.4 6.8-9.6 6.6z';
  const dish = 'M6.5 25h35c0 9.4-7.4 16-17.5 16S6.5 34.4 6.5 25z';
  return (
    <>
      <Part s={s} o={[27, 15]} style={{ transform: [{ rotate: wave(sway, '0deg', '6deg') }] }}>
        <Path d={leaf} fill={p.mid} />
        <Path d={`${leaf}M27.5 14.5l5.5-4.2`} {...line(p, 1.6)} />
      </Part>
      <Part s={s} style={hop(0)}>
        <Circle cx={16.5} cy={22} r={4.4} fill={p.ink} />
        <Circle cx={15.2} cy={20.7} r={1.1} fill={p.hl} />
      </Part>
      <Part s={s} style={hop(120)}>
        <Circle cx={25} cy={19} r={5} fill={p.mid} />
        <Circle cx={25} cy={19} r={5} {...line(p)} />
        <Circle cx={23.4} cy={17.4} r={1.2} fill={p.hl} />
      </Part>
      <Part s={s} style={hop(240)}>
        <Circle cx={33} cy={22.6} r={3.7} fill={p.ink} />
        <Circle cx={32} cy={21.5} r={0.9} fill={p.hl} />
      </Part>
      <Part s={s} o={[24, 41]} style={{ transform: [{ scaleX: sx }, { scaleY: sy }] }}>
        <Path d={dish} fill={p.soft} />
        <Path d="M7.6 29.5h32.8a17 17 0 0 1-1.6 3.6H9.2a17 17 0 0 1-1.6-3.6z" fill={p.mid} />
        <Path d={`${dish}M18 41.6h12`} {...line(p)} />
        <Path d="M11 28.5c.6 2.6 1.8 4.6 3.5 6.2" {...line(p, 1.8, p.hl)} />
      </Part>
    </>
  );
}

export const TOPIC_ICONS = {
  cycle: { T: 1100, C: CycleIcon },
  myth: { T: 1600, C: MythIcon },
  sprout: { T: 2100, C: SproutIcon },
  bottle: { T: 1500, C: BottleIcon },
  molecule: { T: 1300, C: MoleculeIcon },
  mirror: { T: 1100, C: MirrorIcon },
  mood: { T: 1800, C: MoodIcon },
  moon: { T: 1900, C: MoonIcon },
  box: { T: 1500, C: BoxIcon },
  bowl: { T: 800, C: BowlIcon },
};

export default function TopicIcon({ icon, size, palette, play, reduceMotion }) {
  const entry = TOPIC_ICONS[icon];
  const tap = useTap(play, entry?.T ?? 1000, reduceMotion);
  if (!entry) return null;
  const Drawing = entry.C;
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Drawing s={size} p={palette} tap={tap} rm={reduceMotion} />
    </View>
  );
}
