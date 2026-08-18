import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import * as S from './AdminLogin.styled';

/**
 * The only publicly reachable admin surface.
 *
 * Deliberately contains no management UI and no content — just the passkey
 * prompt — so the chunk that ships to an unauthenticated visitor reveals
 * nothing beyond the existence of a sign-in page.
 *
 * Three ways in:
 *  - normal sign-in with an already-registered passkey
 *  - ?invite=…    a one-time link generated from a device that is already signed in
 *  - ?bootstrap=… the very first passkey, valid only while zero credentials exist
 */
function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const invite = params.get('invite');
  const bootstrap = params.get('bootstrap');
  const isEnrolling = Boolean(invite || bootstrap);

  const post = async (action, body) => {
    const res = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
    return data;
  };

  const signIn = useCallback(async () => {
    setError(null);
    setStatus('working');
    try {
      const options = await post('login-options');
      const assertion = await startAuthentication({ optionsJSON: options });
      await post('login-verify', assertion);
      navigate('/admin', { replace: true });
    } catch (err) {
      setStatus('idle');
      // A cancelled Touch ID prompt is a normal action, not a failure worth shouting about.
      if (err?.name === 'NotAllowedError') return;
      setError(err.message ?? 'Could not sign in');
    }
  }, [navigate]);

  const enroll = useCallback(async () => {
    setError(null);
    setStatus('working');
    try {
      const deviceName = defaultDeviceName();
      const options = await post('register-options', { invite, bootstrap, deviceName });
      const attestation = await startRegistration({ optionsJSON: options });
      await post('register-verify', attestation);
      navigate('/admin', { replace: true });
    } catch (err) {
      setStatus('idle');
      if (err?.name === 'NotAllowedError') return;
      setError(err.message ?? 'Could not register this device');
    }
  }, [invite, bootstrap, navigate]);

  // If she is already signed in, skip straight through.
  useEffect(() => {
    if (isEnrolling) return;
    let cancelled = false;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.authenticated) navigate('/admin', { replace: true });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isEnrolling, navigate]);

  const busy = status === 'working';

  return (
    <S.Page>
      <S.Card>
        <S.Title>{isEnrolling ? 'Set up this device' : 'Sign in'}</S.Title>
        <S.Body>
          {isEnrolling
            ? 'This will save a passkey to this device. From now on you can sign in here with Touch ID, Face ID, or your device PIN.'
            : 'Use Touch ID, Face ID, or your device PIN.'}
        </S.Body>

        <S.Button onClick={isEnrolling ? enroll : signIn} disabled={busy}>
          {busy ? 'Waiting…' : isEnrolling ? 'Register this device' : 'Continue'}
        </S.Button>

        {error && <S.Error>{error}</S.Error>}
      </S.Card>
    </S.Page>
  );
}

/** A human-recognisable label so devices can be told apart in the list later. */
function defaultDeviceName() {
  const ua = navigator.userAgent;
  const platform =
    /iPhone/.test(ua) ? 'iPhone' :
    /iPad/.test(ua) ? 'iPad' :
    /Android/.test(ua) ? 'Android' :
    /Mac/.test(ua) ? 'Mac' :
    /Windows/.test(ua) ? 'Windows PC' : 'Device';
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Safari\//.test(ua) ? 'Safari' :
    /Firefox\//.test(ua) ? 'Firefox' : 'Browser';
  return `${platform} · ${browser}`;
}

export default AdminLogin;
