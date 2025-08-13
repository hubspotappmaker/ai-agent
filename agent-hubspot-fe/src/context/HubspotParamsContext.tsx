import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { To } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

type HubspotParams = {
  type?: string;
  objectId?: string;
  portalId?: string;
};

type HubspotParamsContextValue = {
  params: HubspotParams;
  setParams: (p: HubspotParams) => void;
  appendParamsToPath: (to: To | string) => To | string;
  navigateWithParams: (to: To | string, options?: { replace?: boolean; state?: unknown }) => void;
};

const STORAGE_KEY = 'hubspot.params';
const REQUIRED_KEYS: Array<keyof HubspotParams> = ['type', 'objectId', 'portalId'];

const HubspotParamsContext = createContext<HubspotParamsContextValue | undefined>(undefined);

export const HubspotParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasReplacedRef = useRef(false);

  const readParamsFromSearch = useCallback((search: string): HubspotParams => {
    const sp = new URLSearchParams(search || '');
    return {
      type: sp.get('type') || undefined,
      objectId: sp.get('objectId') || undefined,
      portalId: sp.get('portalId') || undefined,
    };
  }, []);

  const [params, setParams] = useState<HubspotParams>(() => {
    const fromUrl = readParamsFromSearch(typeof window !== 'undefined' ? window.location.search : '');
    const hasAllFromUrl = REQUIRED_KEYS.every((k) => !!fromUrl[k]);
    if (hasAllFromUrl) return fromUrl;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as HubspotParams | null;
      return stored || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const current = readParamsFromSearch(location.search);
    const merged: HubspotParams = { ...params, ...current };
    const changed = REQUIRED_KEYS.some((k) => params[k] !== merged[k]);
    if (changed) setParams(merged);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }, [location.search]);

  useEffect(() => {
    if (hasReplacedRef.current) return;
    const searchParams = new URLSearchParams(location.search);
    const missing = REQUIRED_KEYS.filter((k) => !searchParams.get(k));
    if (missing.length && REQUIRED_KEYS.every((k) => params[k])) {
      REQUIRED_KEYS.forEach((k) => {
        if (!searchParams.get(k) && params[k]) searchParams.set(k, String(params[k]));
      });
      hasReplacedRef.current = true;
      navigate({ pathname: location.pathname, search: `?${searchParams.toString()}` }, { replace: true });
    }
  }, [location.pathname, location.search, params]);

  const buildMergedSearch = useCallback(
    (target: string): string => {
      const url = new URL(target, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const existing = new URLSearchParams(url.search);
      REQUIRED_KEYS.forEach((k) => {
        if (params[k]) existing.set(k, String(params[k]));
      });
      const query = existing.toString();
      return query ? `?${query}` : '';
    },
    [params]
  );

  const appendParamsToPath = useCallback<HubspotParamsContextValue['appendParamsToPath']>((to) => {
    if (typeof to === 'string') {
      const [path] = to.split('?');
      return `${path}${buildMergedSearch(to)}`;
    }
    if (typeof to === 'object') {
      const pathname = (to as any).pathname ?? location.pathname;
      const search = buildMergedSearch(`${pathname}${(to as any).search || ''}`);
      return { ...to, pathname, search } as To;
    }
    return to;
  }, [buildMergedSearch, location.pathname]);

  const navigateWithParams = useCallback<HubspotParamsContextValue['navigateWithParams']>((to, options) => {
    navigate(appendParamsToPath(to) as To, options);
  }, [appendParamsToPath, navigate]);

  const value = useMemo<HubspotParamsContextValue>(() => ({
    params,
    setParams,
    appendParamsToPath,
    navigateWithParams,
  }), [params, appendParamsToPath, navigateWithParams]);

  return (
    <HubspotParamsContext.Provider value={value}>
      {children}
    </HubspotParamsContext.Provider>
  );
};

export const useHubspotParams = (): HubspotParamsContextValue => {
  const ctx = useContext(HubspotParamsContext);
  if (!ctx) throw new Error('useHubspotParams must be used within HubspotParamsProvider');
  return ctx;
};


