import { useState } from 'react';
import { api } from './api';
import * as S from './AdminApp.styled';

/**
 * Passkey management. Adding a device works by generating a one-time link and
 * opening it on the new machine — the passkey itself is created there, in that
 * device's secure hardware, and never travels.
 */
function DevicesView({ devices, onChanged }) {
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const createLink = async () => {
    setBusy(true);
    setError(null);
    try {
      const { token, expiresInMinutes } = await api.createInvite('');
      setLink({
        url: `${window.location.origin}/admin/login?invite=${token}`,
        expiresInMinutes,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this device? It will no longer be able to sign in.')) return;
    try {
      await api.removeDevice(id);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <S.H2>Devices</S.H2>
      <S.Hint>
        Each device you sign in from keeps its own passkey. On Apple devices, iCloud
        Keychain usually shares it across your Mac, iPhone, and iPad automatically —
        so you may only ever need to do this once.
      </S.Hint>

      {devices.map((device) => (
        <S.Card key={device.id}>
          <S.Row>
            <div>
              <div>{device.name}{device.current && ' · this device'}</div>
              <div style={{ fontSize: 12, color: '#6a6a6a', marginTop: 4 }}>
                Added {new Date(device.createdAt).toLocaleDateString()}
                {device.lastUsedAt && ` · last used ${new Date(device.lastUsedAt).toLocaleDateString()}`}
              </div>
            </div>
            <S.Spacer />
            <S.IconButton onClick={() => remove(device.id)} style={{ color: '#d97a7a' }}>
              Remove
            </S.IconButton>
          </S.Row>
        </S.Card>
      ))}

      <div style={{ marginTop: 24 }}>
        <S.Button onClick={createLink} disabled={busy}>
          {busy ? 'Creating…' : 'Add another device'}
        </S.Button>

        {link && (
          <>
            <S.Note>
              Open this link on the new device and sign in there. It works once, and
              expires in {link.expiresInMinutes} minutes.
            </S.Note>
            <S.Code>{link.url}</S.Code>
            <S.Row style={{ marginTop: 10 }}>
              <S.Button $variant="ghost" onClick={() => navigator.clipboard?.writeText(link.url)}>
                Copy link
              </S.Button>
            </S.Row>
          </>
        )}
      </div>

      {error && <S.Note $error>{error}</S.Note>}
    </>
  );
}

export default DevicesView;
