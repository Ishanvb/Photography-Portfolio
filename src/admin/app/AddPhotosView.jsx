import { useCallback, useMemo, useState } from 'react';
import { api } from './api';
import Uploader from './Uploader';
import * as S from './AdminApp.styled';

const NEW_PROJECT = '__new__';
const REEL = '__reel__';

/**
 * The primary form: pick a destination, drop photos, done.
 * Destinations are the home reel, any existing project, or a brand new project
 * created inline.
 */
function AddPhotosView({ projects, onChanged }) {
  const [destination, setDestination] = useState(projects[0]?.id ?? REEL);
  const [newTitle, setNewTitle] = useState('');
  const [added, setAdded] = useState(0);
  const [error, setError] = useState(null);
  // Holds the project created for this batch so several files land in one project.
  const [pendingProject, setPendingProject] = useState(null);

  const isReel = destination === REEL;
  const isNew = destination === NEW_PROJECT;

  const target = useMemo(
    () => projects.find((p) => p.id === destination) ?? null,
    [projects, destination]
  );

  const folder = isReel
    ? 'reel'
    : (pendingProject?.slug ?? target?.slug ?? 'uploads');

  const ensureProject = useCallback(async () => {
    if (!isNew) return target;
    if (pendingProject) return pendingProject;
    const { project } = await api.createProject({ title: newTitle.trim() });
    setPendingProject(project);
    return project;
  }, [isNew, target, pendingProject, newTitle]);

  const handleUploaded = useCallback(async (result) => {
    setError(null);
    try {
      if (isReel) {
        await api.addReelItem({ jpg: result.jpg, webp: result.webp, title: '' });
      } else {
        const project = await ensureProject();
        if (!project) throw new Error('Pick a project first');
        await api.addPhoto({
          projectId: project.id,
          jpg: result.jpg,
          webp: result.webp,
          width: result.width,
          height: result.height,
        });
      }
      setAdded((n) => n + 1);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }, [isReel, ensureProject, onChanged]);

  const blocked = isNew && !pendingProject && newTitle.trim().length === 0;

  return (
    <>
      <S.H2>Add photos</S.H2>
      <S.Hint>
        Photos are resized and converted automatically — upload them straight from
        your camera or Lightroom export, at full resolution.
      </S.Hint>

      <S.Field>
        <span>Where should these go?</span>
        <S.Select
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setPendingProject(null);
            setAdded(0);
          }}
        >
          <option value={REEL}>Home page reel</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}{p.published ? '' : ' (draft)'}
            </option>
          ))}
          <option value={NEW_PROJECT}>+ New project…</option>
        </S.Select>
      </S.Field>

      {isNew && (
        <S.Field>
          <span>New project name</span>
          <S.Input
            value={pendingProject?.title ?? newTitle}
            disabled={Boolean(pendingProject)}
            placeholder="e.g. Winter Editorial"
            onChange={(e) => setNewTitle(e.target.value)}
          />
          {pendingProject && (
            <S.Note>
              Created as a draft. Add a description and publish it from the Projects tab.
            </S.Note>
          )}
        </S.Field>
      )}

      {blocked ? (
        <S.Drop as="div" style={{ opacity: 0.4, cursor: 'default' }}>
          Name the project first
        </S.Drop>
      ) : (
        <Uploader
          folder={folder}
          preset={isReel ? 'reel' : 'gallery'}
          onUploaded={handleUploaded}
        />
      )}

      {added > 0 && (
        <S.Note>
          {added} photo{added === 1 ? '' : 's'} added. They appear on the site within a minute.
        </S.Note>
      )}
      {error && <S.Note $error>{error}</S.Note>}
    </>
  );
}

export default AddPhotosView;
