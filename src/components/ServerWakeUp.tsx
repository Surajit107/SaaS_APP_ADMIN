import { useEffect } from 'react';

import { wakeBackendIfNeeded } from '@/lib/api/wakeBackend';

/**
 * Mount once at the app root. Triggers a silent backend wake on first visit
 * (or after the wake TTL). Does not re-run on client-side route changes.
 */
export function ServerWakeUp() {
  useEffect(() => {
    wakeBackendIfNeeded();
  }, []);

  return null;
}
