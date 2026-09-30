import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import AddPhotosView from './AddPhotosView';
import ProjectsView from './ProjectsView';
import ReelView from './ReelView';
import AboutView from './AboutView';
import DevicesView from './DevicesView';
import * as S from './AdminApp.styled';

const TABS = [
  { id: 'add', label: 'Add photos' },
  { id: 'projects', label: 'Projects' },
  { id: 'reel', label: 'Home reel' },
  { id: 'about', label: 'About' },
  { id: 'devices', label: 'Devices' },
];

/**
 * Everything in this directory is emitted into /admin-assets/, which
 * middleware.js 404s without a valid session — so this code is never delivered
 * to a signed-out visitor. The real protection is still server-side: every
 * endpoint it calls verifies the session independently.
 */
function AdminApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('add');
  const [state, setState] = useState({ status: 'loading', projects: [], reel: [], devices: [] });

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      if (!me.authenticated) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const [{ projects }, { reel }] = await Promise.all([
        api.listProjects(),
        api.listReel(),
      ]);
      setState({ status: 'ready', projects, reel, devices: me.devices ?? [] });
    } catch (err) {
      setState((s) => ({ ...s, status: 'error', error: err.message }));
    }
  }, [navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const signOut = async () => {
    await api.logout();
    navigate('/admin/login', { replace: true });
  };

  if (state.status === 'loading') {
    return <S.Shell><S.Main><S.Hint>Loading…</S.Hint></S.Main></S.Shell>;
  }

  if (state.status === 'error') {
    return (
      <S.Shell>
        <S.Main>
          <S.H2>Something went wrong</S.H2>
          <S.Note $error>{state.error}</S.Note>
          <S.Row style={{ marginTop: 16 }}>
            <S.Button onClick={refresh}>Try again</S.Button>
          </S.Row>
        </S.Main>
      </S.Shell>
    );
  }

  return (
    <S.Shell>
      <S.AdminReset />
      <S.Bar>
        {TABS.map((t) => (
          <S.Tab key={t.id} $active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </S.Tab>
        ))}
        <S.Spacer />
        <S.Tab onClick={signOut}>Sign out</S.Tab>
      </S.Bar>

      <S.Main>
        {tab === 'add' && <AddPhotosView projects={state.projects} onChanged={refresh} />}
        {tab === 'projects' && <ProjectsView projects={state.projects} onChanged={refresh} />}
        {tab === 'reel' && <ReelView projects={state.projects} reel={state.reel} onChanged={refresh} />}
        {tab === 'about' && <AboutView />}
        {tab === 'devices' && <DevicesView devices={state.devices} onChanged={refresh} />}
      </S.Main>
    </S.Shell>
  );
}

export default AdminApp;
