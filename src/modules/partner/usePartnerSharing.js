import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import * as partnerApi from '../../shared/api/partner.js';
export default function usePartnerSharing() {
  const { state, dispatch } = useApp();
  const { accessToken } = state;
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useCallback((icon, text) => dispatch({ type: A.SHOW_TOAST, icon, text }), [dispatch]);
  const load = useCallback(() => {
    partnerApi
      .getPartnerStatus(accessToken)
      .then(setStatus)
      .catch(() => {});
  }, [accessToken]);
  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') load();
    });
    return () => sub.remove();
  }, [load]);
  async function run(task) {
    if (busy) return false;
    setBusy(true);
    try {
      await task();
      return true;
    } catch (e) {
      toast('🌸', e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function invite(email) {
    return run(async () => {
      const next = await partnerApi.invitePartner(email, accessToken);
      setStatus(next);
      toast('💌', `Invite sent to ${next.inviteEmail}`);
    });
  }
  function resend() {
    return run(async () => {
      const next = await partnerApi.resendPartnerInvite(accessToken);
      setStatus(next);
      toast('💌', `A new code is on its way to ${next.inviteEmail}`);
    });
  }
  function cancel() {
    return run(async () => {
      await partnerApi.cancelPartnerInvite(accessToken);
      load();
      toast('🌸', 'Invite cancelled.');
    });
  }
  function stop() {
    return run(async () => {
      await partnerApi.stopPartnerSharing(accessToken);
      load();
      toast('🌸', 'Sharing stopped.');
    });
  }
  return { status, busy, load, invite, resend, cancel, stop };
}
