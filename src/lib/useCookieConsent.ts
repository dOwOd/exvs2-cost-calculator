/**
 * Cookie同意状態管理フック
 * コンポーネント間の同期にカスタムイベントを使用
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import type { CookieConsentStatus } from './cookieConsent';
import {
  getCookieConsent,
  setCookieConsent,
  resetCookieConsent,
} from './cookieConsent';

const CONSENT_CHANGE_EVENT = 'cookie-consent-change';

export const useCookieConsent = () => {
  const [status, setStatus] = useState<CookieConsentStatus>('undecided');

  // 初期化
  useEffect(() => {
    setStatus(getCookieConsent());
  }, []);

  // 他コンポーネントからの変更を監視
  useEffect(() => {
    const handleChange = () => {
      setStatus(getCookieConsent());
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
  }, []);

  const grant = useCallback(() => {
    setCookieConsent('granted');
    setStatus('granted');
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  const deny = useCallback(() => {
    setCookieConsent('denied');
    setStatus('denied');
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  const reset = useCallback(() => {
    resetCookieConsent();
    setStatus('undecided');
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  return {
    status,
    grant,
    deny,
    reset,
  };
};
