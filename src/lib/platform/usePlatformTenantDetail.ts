import { useCallback, useRef, useState } from 'react';

import { GET_PLATFORM_SUBSCRIPTION_BY_TENANT, GET_PLATFORM_TENANT } from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { PlatformSubscriptionRow, TenantProfile } from '@/lib/api/types';

export function usePlatformTenantDetail(): {
  /** True once a row is selected until the sheet closes (covers the frame before the request starts). */
  isDetailSessionOpen: boolean;
  detail: TenantProfile | null;
  isLoading: boolean;
  error: string | null;
  subscription: PlatformSubscriptionRow | null;
  isSubscriptionLoading: boolean;
  subscriptionError: string | null;
  openDetail: (tenantId: string) => void;
  closeDetail: () => void;
  reload: () => void;
} {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TenantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PlatformSubscriptionRow | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const runFetch = useCallback((id: string) => {
    const seq = ++requestSeqRef.current;
    setIsLoading(true);
    setIsSubscriptionLoading(true);
    setError(null);
    setSubscriptionError(null);
    setDetail(null);
    setSubscription(null);

    void (async () => {
      await Promise.all([
        GET_PLATFORM_TENANT(id)
          .then((res) => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setDetail(res.data.data);
            setError(null);
          })
          .catch((reason: unknown) => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setDetail(null);
            setError(getApiErrorMessage(reason, 'Unable to load organization'));
          })
          .finally(() => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setIsLoading(false);
          }),
        GET_PLATFORM_SUBSCRIPTION_BY_TENANT(id)
          .then((res) => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setSubscription(res.data.data);
            setSubscriptionError(null);
          })
          .catch((reason: unknown) => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setSubscription(null);
            setSubscriptionError(getApiErrorMessage(reason, 'Unable to load billing'));
          })
          .finally(() => {
            if (requestSeqRef.current !== seq) {
              return;
            }
            setIsSubscriptionLoading(false);
          }),
      ]);
    })();
  }, []);

  const openDetail = useCallback(
    (id: string) => {
      setTenantId(id);
      runFetch(id);
    },
    [runFetch],
  );

  const closeDetail = useCallback(() => {
    requestSeqRef.current += 1;
    setTenantId(null);
    setDetail(null);
    setIsLoading(false);
    setError(null);
    setSubscription(null);
    setIsSubscriptionLoading(false);
    setSubscriptionError(null);
  }, []);

  const reload = useCallback(() => {
    if (tenantId === null) {
      return;
    }
    runFetch(tenantId);
  }, [tenantId, runFetch]);

  return {
    isDetailSessionOpen: tenantId !== null,
    detail,
    isLoading,
    error,
    subscription,
    isSubscriptionLoading,
    subscriptionError,
    openDetail,
    closeDetail,
    reload,
  };
}
