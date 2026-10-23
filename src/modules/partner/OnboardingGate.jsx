import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../shared/store/AppContext.jsx';
import { useTheme } from '../../shared/styles/index.js';
import OnboardingScreen from '../onboarding/OnboardingScreen.jsx';
import PartnerJoinScreen from './PartnerJoinScreen.jsx';
import { getPartnerStatus } from '../../shared/api/partner.js';
import { setupRoute } from '../../shared/utils/partner.js';
export default function OnboardingGate() {
  const { state } = useApp();
  const { colors } = useTheme();
  const { accessToken } = state;
  const [status, setStatus] = useState(undefined);
  const [ownCycle, setOwnCycle] = useState(false);
  useEffect(() => {
    let live = true;
    getPartnerStatus(accessToken)
      .then(data => live && setStatus(data))
      .catch(() => live && setStatus(null));
    return () => {
      live = false;
    };
  }, [accessToken]);
  const route = setupRoute(status, ownCycle);
  if (route === 'checking') {
    return <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }} />;
  }
  if (route === 'join') {
    return <PartnerJoinScreen ownerFirstName={status.ownerFirstName} onOwnCycle={() => setOwnCycle(true)} />;
  }
  return <OnboardingScreen />;
}
