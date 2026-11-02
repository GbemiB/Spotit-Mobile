import { useCallback, useEffect, useState } from 'react';
import * as quizApi from '../../shared/api/quiz.js';
import { toPick } from './quizLogic.js';
import { readInvite, updateInvite, mightInvite, shouldInvite, afterShown, afterLater } from './inviteLogic.js';

export default function useSpotlightInvite({ ready, userId, token, today, resumedAt }) {
  const [invite, setInvite] = useState(null);
  useEffect(() => {
    if (!ready || !userId || !token || invite) return undefined;
    let cancelled = false;
    (async () => {
      const record = await readInvite(userId);
      if (!mightInvite(record, today)) return;
      let home;
      try {
        home = await quizApi.getHome(token);
      } catch {
        return;
      }
      if (cancelled || !shouldInvite(record, home?.invite, today)) return;
      await updateInvite(userId, r => afterShown(r, today));
      if (!cancelled) setInvite({ pick: toPick(home.pick) });
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, userId, token, today, resumedAt, invite]);
  const later = useCallback(() => {
    setInvite(null);
    updateInvite(userId, afterLater);
  }, [userId]);
  const accept = useCallback(() => setInvite(null), []);
  return { invite, later, accept };
}
