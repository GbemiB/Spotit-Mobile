import { View, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { SHOP_PRODUCT_ICONS } from '../../shared/constants/rewards.js';
import { formatDisplayDate, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import Card from '../../components/ui/Card.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import * as billingApi from '../../shared/api/billing.js';
import * as rewardsApi from '../../shared/api/rewards.js';
import * as shopApi from '../../shared/api/shop.js';
function shopView(products) {
  return products.map(p => ({
    ...p,
    icon: SHOP_PRODUCT_ICONS[p.id] || '🎁',
    ctaLabel: p.locked
      ? p.lockReason === 'level_too_low'
        ? `Unlocks at ${p.minLevel}`
        : p.lockReason === 'premium_required'
          ? 'Premium only'
          : 'Redeemed'
      : `Redeem · ${p.cost} SP`,
  }));
}
function ShopRow({ product, onRedeem, busy, colors, s }) {
  const active = !product.locked;
  return (
    <View style={[s.shopRow, product.locked && { opacity: 0.55 }]}>
      <View style={s.shopIconWrap}>
        <Text style={{ fontSize: 20 }}>{product.icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.shopName}>{product.name}</Text>
        <Text style={s.shopSub}>
          {product.cost} SP{product.premiumOnly ? ' · Premium' : ''}
        </Text>
      </View>
      <Pressable onPress={() => active && !busy && onRedeem(product)} style={[s.shopCta, active ? s.shopCtaActive : s.shopCtaInactive]}>
        <Text style={[s.shopCtaTx, { color: active ? colors.white : colors.textDisabled }]}>{busy ? '…' : product.ctaLabel}</Text>
      </Pressable>
    </View>
  );
}
function ChallengeRow({ challenge, onClaim, busy, s }) {
  const { title, reward, done, total, completed, claimed } = challenge;
  const pct = Math.min(100, Math.round((done / total) * 100));
  return (
    <Card style={s.challengeCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.challengeTitle}>{title}</Text>
        <Text style={s.challengeReward}>+{reward} SP</Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <ProgressBar value={pct / 100} height={7} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <Text style={s.challengeProgress}>
          {done} of {total} complete
        </Text>
        {completed && !claimed && (
          <Pressable onPress={() => !busy && onClaim(challenge)} style={s.challengeClaimBtn}>
            <Text style={s.challengeClaimTx}>{busy ? '…' : 'Claim'}</Text>
          </Pressable>
        )}
        {claimed && <Text style={s.challengeClaimedTx}>Claimed ✓</Text>}
      </View>
    </Card>
  );
}
function HistoryRow({ entry, last, colors, s }) {
  return (
    <View style={[s.historyRow, last && { borderBottomWidth: 0 }]}>
      <View style={s.historyIconWrap}>
        <Text style={{ fontSize: 13 }}>{entry.icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.historyLabel}>{entry.label}</Text>
        <Text style={s.historyDate}>{entry.date}</Text>
      </View>
      <Text style={[s.historyDelta, { color: entry.delta < 0 ? colors.error : colors.success }]}>
        {entry.delta > 0 ? '+' : ''}
        {entry.delta} SP
      </Text>
    </View>
  );
}
const BADGE_ICONS = {
  first_flow: '🌸',
  cycle_veteran: '🗓️',
  know_your_body: '🧠',
  week_warrior: '🔥',
  ovulation_oracle: '🔮',
  health_nerd: '📚',
};
function BadgeCard({ badge, colors, s }) {
  const earned = badge.earned;
  return (
    <View style={[s.badge, { opacity: earned ? 1 : 0.4 }]}>
      <View style={[s.badgeIconWrap, { backgroundColor: earned ? colors.primarySoft : '#F3EDEA' }]}>
        <Text style={{ fontSize: 20 }}>{BADGE_ICONS[badge.id] || '🏅'}</Text>
      </View>
      <Text style={s.badgeLabel}>{badge.name}</Text>
    </View>
  );
}
export default function RewardsScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { femPoints, streak, isPremium, autoRenew, history, badges, challenges, shopProducts, lastClaimedDate, accessToken, levels } =
    state;
  const insets = useSafeAreaInsets();
  const [billingLoading, setBillingLoading] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);
  const [claimingChallengeId, setClaimingChallengeId] = useState(null);
  const alreadyClaimedToday = lastClaimedDate === todayISO();
  async function handleDailyClaim() {
    if (claimLoading || alreadyClaimedToday) return;
    setClaimLoading(true);
    try {
      const data = await rewardsApi.dailyClaim(accessToken);
      dispatch({ type: A.DAILY_CLAIM_RESULT, ...data });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setClaimLoading(false);
    }
  }
  async function handleWatchAd() {
    if (adLoading) return;
    setAdLoading(true);
    try {
      const data = await rewardsApi.watchAd(
        { adNetwork: 'dev-mock', adUnitId: 'dev-mock-unit', verificationToken: 'dev-mock-token' },
        accessToken,
      );
      dispatch({ type: A.AD_WATCH_RESULT, ...data });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setAdLoading(false);
    }
  }
  async function handleRedeem(product) {
    if (redeemingId) return;
    setRedeemingId(product.id);
    try {
      const data = await shopApi.redeem(product.id, accessToken);
      dispatch({
        type: A.REDEEM_RESULT,
        productId: product.id,
        productName: product.name,
        pointsSpent: data.pointsSpent,
        newBalance: data.newBalance,
      });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setRedeemingId(null);
    }
  }
  async function handleClaimChallenge(challenge) {
    if (claimingChallengeId) return;
    setClaimingChallengeId(challenge.id);
    try {
      const data = await rewardsApi.claimChallenge(challenge.id, accessToken);
      dispatch({
        type: A.CHALLENGE_CLAIM_RESULT,
        challengeId: challenge.id,
        pointsAwarded: data.pointsAwarded,
        newBalance: data.newBalance,
      });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setClaimingChallengeId(null);
    }
  }
  async function handleSubscribe() {
    if (billingLoading) return;
    setBillingLoading(true);
    try {
      const data = await billingApi.subscribe(
        { planId: 'premium_monthly', platform: Platform.OS, receipt: 'dev-mock-receipt' },
        accessToken,
      );
      dispatch({
        type: A.SUBSCRIPTION_UPDATED,
        isPremium: data.isPremium,
        plan: data.plan,
        renewsAt: data.renewsAt,
        autoRenew: data.autoRenew,
        toast: { icon: '👑', text: 'Premium unlocked' },
      });
    } catch (e) {
      dispatch({
        type: A.SUBSCRIPTION_UPDATED,
        isPremium,
        plan: state.plan,
        renewsAt: state.renewsAt,
        autoRenew,
        toast: { icon: '🌸', text: e.message },
      });
    } finally {
      setBillingLoading(false);
    }
  }
  async function handleCancelRenewal() {
    if (billingLoading) return;
    setBillingLoading(true);
    try {
      const data = await billingApi.cancel(accessToken);
      dispatch({
        type: A.SUBSCRIPTION_UPDATED,
        isPremium: data.isPremium,
        plan: state.plan,
        renewsAt: data.accessUntil,
        autoRenew: data.autoRenew,
        toast: { icon: '✓', text: 'Auto-renew turned off' },
      });
    } catch (e) {
      dispatch({
        type: A.SUBSCRIPTION_UPDATED,
        isPremium,
        plan: state.plan,
        renewsAt: state.renewsAt,
        autoRenew,
        toast: { icon: '🌸', text: e.message },
      });
    } finally {
      setBillingLoading(false);
    }
  }
  const level = levelInfo(femPoints, levels);
  const shopRows = shopView(shopProducts);
  const earnedBadgeCount = badges.filter(b => b.earned).length;
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Rewards</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <LinearGradient colors={['#E2647C', '#C8466A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <Text style={s.heroFlower}>🌸</Text>
            <Text style={s.heroLabel}>Current level</Text>
            <Text style={s.heroLevel}>{level.name}</Text>
            <Text style={s.heroPoints}>{femPoints.toLocaleString()} Spotit points</Text>
            <View style={{ marginTop: 16 }}>
              <ProgressBar value={level.pct} color={colors.white} trackColor="rgba(255,255,255,0.25)" height={8} />
            </View>
            <Text style={s.heroProgress}>
              {level.next ? `${(level.hi - femPoints).toLocaleString()} SP to ${level.next.name}` : 'Max level reached'}
            </Text>
            <View style={s.heroStatsRow}>
              <View>
                <Text style={s.heroStatNum}>{streak}</Text>
                <Text style={s.heroStatLbl}>Day streak 🔥</Text>
              </View>
              <View>
                <Text style={s.heroStatNum}>{earnedBadgeCount}</Text>
                <Text style={s.heroStatLbl}>Badges earned</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <Pressable
            onPress={handleDailyClaim}
            disabled={claimLoading || alreadyClaimedToday}
            style={[s.adRow, alreadyClaimedToday && { opacity: 0.55 }]}
          >
            <View style={s.adIconWrap}>
              <Text style={{ fontSize: 16 }}>🎁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rewardTitle}>Daily check-in</Text>
              <Text style={s.rewardDesc}>{alreadyClaimedToday ? 'Come back tomorrow' : 'Claim your daily bonus'}</Text>
            </View>
            <Text style={s.adCta}>{alreadyClaimedToday ? '✓' : claimLoading ? '…' : 'Claim'}</Text>
          </Pressable>
        </View>

  

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={s.sectionTitle}>Redeem for skincare</Text>
          <Text style={s.shopIntro}>
            Trade your Spotit points for free beauty & self-care products. Some items need a higher level or Premium.
          </Text>

          {isPremium ? (
            <Pressable
              onPress={autoRenew ? handleCancelRenewal : undefined}
              disabled={billingLoading}
              style={[s.premiumBanner, { justifyContent: 'space-between' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 13 }}>👑</Text>
                <Text style={s.premiumTx}>Premium active — all rewards unlocked</Text>
              </View>
              {autoRenew && <Text style={s.premiumCta}>{billingLoading ? '…' : 'Turn off'}</Text>}
            </Pressable>
          ) : (
            <Pressable onPress={handleSubscribe} disabled={billingLoading} style={[s.premiumBanner, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 13 }}>👑</Text>
                <Text style={s.premiumTx}>Go Premium to unlock every reward</Text>
              </View>
              <Text style={s.premiumCta}>{billingLoading ? 'Subscribing…' : 'Subscribe →'}</Text>
            </Pressable>
          )}

          <View style={{ gap: 10 }}>
            {shopRows.map(p => (
              <ShopRow key={p.id} product={p} onRedeem={handleRedeem} busy={redeemingId === p.id} colors={colors} s={s} />
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={s.sectionTitle}>Badges</Text>
          <View style={s.badgeGrid}>
            {badges.map(b => (
              <BadgeCard key={b.id} badge={b} colors={colors} s={s} />
            ))}
          </View>
        </View>

        {challenges.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={s.sectionTitle}>Weekly challenges</Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              {challenges.map(c => (
                <ChallengeRow key={c.id} challenge={c} onClaim={handleClaimChallenge} busy={claimingChallengeId === c.id} s={s} />
              ))}
            </View>
          </View>
        )}

        {history.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={s.sectionTitle}>Points history</Text>
            <Card style={{ padding: 0, marginTop: 12, overflow: 'hidden' }}>
              {history.map((h, i) => (
                <HistoryRow
                  key={i}
                  entry={{ ...h, date: formatDisplayDate(h.date) }}
                  last={i === history.length - 1}
                  colors={colors}
                  s={s}
                />
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
    hero: { position: 'relative', borderRadius: 28, padding: 22, overflow: 'hidden' },
    heroFlower: { position: 'absolute', top: -30, right: -20, fontSize: 118, opacity: 0.14 },
    heroLabel: { fontSize: 10.5, opacity: 0.85, fontWeight: '600', color: c.white },
    heroLevel: { fontFamily: FONT.serif, fontSize: 30, marginTop: 15, color: c.white },
    heroPoints: { fontSize: 11, opacity: 0.9, marginTop: 2, color: c.white },
    heroProgress: { fontSize: 9.5, opacity: 0.85, marginTop: 7, color: c.white },
    heroStatsRow: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.22)',
    },
    heroStatNum: { fontSize: 17, fontWeight: '700', color: c.white },
    heroStatLbl: { fontSize: 9, opacity: 0.85, color: c.white, marginTop: 2 },
    rewardTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
    rewardDesc: { fontSize: 10, color: c.textMuted, lineHeight: 18 },
    adRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.primarySoftBorder,
      borderStyle: 'dashed',
      borderRadius: 20,
      padding: 15,
    },
    adIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: c.tertiarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    adCta: { fontSize: 11, fontWeight: '700', color: c.primaryDark },
    premiumBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.textPrimary,
      borderRadius: 16,
      padding: 12,
      marginTop: 12,
      marginBottom: 12,
    },
    premiumTx: { fontSize: 10.5, fontWeight: '700', color: c.white, flexShrink: 1 },
    premiumCta: { fontSize: 9.5, fontWeight: '700', color: c.primaryLight },
    shopIntro: { fontSize: 10, color: c.textMuted, lineHeight: 18, marginTop: 4, marginBottom: 4 },
    shopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 20,
      padding: 14,
    },
    shopIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.tertiarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shopName: { fontSize: 11.5, fontWeight: '700', color: c.textPrimary },
    shopSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2 },
    shopCta: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 },
    shopCtaActive: { backgroundColor: c.primary },
    shopCtaInactive: { backgroundColor: c.border },
    shopCtaTx: { fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
    challengeCard: { padding: 16 },
    challengeTitle: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
    challengeReward: { fontSize: 10, fontWeight: '700', color: c.primaryDark },
    challengeProgress: { fontSize: 9.5, color: c.textMuted, marginTop: 6 },
    challengeClaimBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: c.primary },
    challengeClaimTx: { fontSize: 9.5, fontWeight: '700', color: c.white },
    challengeClaimedTx: { fontSize: 9.5, fontWeight: '700', color: c.success },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    historyIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.tertiarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyLabel: { fontSize: 11, fontWeight: '600', color: c.textPrimary },
    historyDate: { fontSize: 9, color: c.textMuted, marginTop: 1 },
    historyDelta: { fontSize: 11, fontWeight: '700' },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    badge: { width: '30%', alignItems: 'center' },
    badgeIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
    badgeLabel: { fontSize: 9, fontWeight: '600', marginTop: 8, textAlign: 'center', lineHeight: 15, color: c.textSecondary },
  });
}
