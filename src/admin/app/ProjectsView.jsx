import { useState } from 'react';
import { api } from './api';
import Uploader from './Uploader';
import * as S from './AdminApp.styled';

function ProjectsView({ projects, onChanged }) {
  const [openId, setOpenId] = useState(null);

  return (
    <>
      <S.H2>Projects</S.H2>
      <S.Hint>
        Edit the text that appears on each project page, reorder or remove photos,
        and publish drafts. Unpublished projects are invisible on the live site.
      </S.Hint>

      {projects.map((project) => (
        <S.Card key={project.id}>
          <S.Row>
            <strong style={{ fontWeight: 500 }}>{project.title}</strong>
            <span style={{ fontSize: 12, color: project.published ? '#6fbf73' : '#c9a227' }}>
              {project.published ? 'Live' : 'Draft'}
            </span>
            <span style={{ fontSize: 12, color: '#6a6a6a' }}>
              {project.photos?.length ?? 0} item{(project.photos?.length ?? 0) === 1 ? '' : 's'}
            </span>
            <S.Spacer />
            <S.Button
              $variant="ghost"
              onClick={() => setOpenId(openId === project.id ? null : project.id)}
            >
              {openId === project.id ? 'Close' : 'Edit'}
            </S.Button>
          </S.Row>

          {openId === project.id && (
            <ProjectEditor project={project} onChanged={onChanged} />
          )}
        </S.Card>
      ))}
    </>
  );
}

function ProjectEditor({ project, onChanged }) {
  const [form, setForm] = useState({
    title: project.title ?? '',
    description: project.description ?? '',
    dateLabel: project.date_label ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const photos = [...(project.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.updateProject({ id: project.id, ...form });
      setMessage('Saved.');
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async () => {
    try {
      await api.updateProject({ id: project.id, published: !project.published });
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const move = async (index, delta) => {
    const next = [...photos];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    await api.reorderPhotos(next.map((p) => p.id));
    onChanged();
  };

  const removePhoto = async (photo) => {
    await api.deletePhoto(photo.id);
    onChanged();
  };

  const removeProject = async () => {
    if (!window.confirm(`Delete "${project.title}" and all of its photos? This cannot be undone.`)) return;
    try {
      await api.deleteProject(project.id);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: 20, borderTop: '1px solid #222', paddingTop: 20 }}>
      <S.Field>
        <span>Title</span>
        <S.Input value={form.title} onChange={set('title')} />
      </S.Field>
      <S.Field>
        <span>Subtitle on the Work page</span>
        <S.Input value={form.description} onChange={set('description')} placeholder="COLLECTIONS: 8" />
      </S.Field>
      <S.Field>
        <span>Date, shown top right in the gallery pop-up</span>
        <S.Input value={form.dateLabel} onChange={set('dateLabel')} placeholder="PRESENT" />
      </S.Field>
      <S.Row>
        <S.Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</S.Button>
        <S.Button $variant="ghost" onClick={togglePublished}>
          {project.published ? 'Unpublish' : 'Publish'}
        </S.Button>
        <S.Spacer />
        <S.Danger as="button" onClick={removeProject}>Delete project</S.Danger>
      </S.Row>

      {message && <S.Note>{message}</S.Note>}
      {error && <S.Note $error>{error}</S.Note>}

      <div style={{ marginTop: 28 }}>
        <S.Field as="div"><span>Photos</span></S.Field>
        <Uploader
          folder={project.slug}
          preset="gallery"
          label="Drop more photos for this project"
          onUploaded={async (result) => {
            await api.addPhoto({
              projectId: project.id,
              jpg: result.jpg,
              webp: result.webp,
              width: result.width,
              height: result.height,
            });
            onChanged();
          }}
        />

        <S.Hint>
          The caption under each photo is the line that appears beside it in the
          gallery pop-up. It saves as soon as you click away.
        </S.Hint>

        <S.Grid>
          {photos.map((photo, index) => (
            <S.Thumb key={photo.id}>
              {photo.url_jpg ? (
                <img src={photo.url_webp ?? photo.url_jpg} alt={photo.alt ?? ''} loading="lazy" />
              ) : (
                <div style={{ padding: 12, fontSize: 12, color: '#8a8a8a' }}>
                  YouTube · {photo.youtube_id}
                </div>
              )}
              <PhotoCaption photo={photo} onChanged={onChanged} onError={setError} />
              <S.ThumbBar>
                <span>
                  <S.IconButton onClick={() => move(index, -1)} disabled={index === 0}>←</S.IconButton>
                  <S.IconButton onClick={() => move(index, 1)} disabled={index === photos.length - 1}>→</S.IconButton>
                </span>
                <S.IconButton onClick={() => removePhoto(photo)} title="Remove">✕</S.IconButton>
              </S.ThumbBar>
            </S.Thumb>
          ))}
        </S.Grid>
      </div>
    </div>
  );
}

/** One photo's caption. Saved on blur, and only when it actually changed. */
function PhotoCaption({ photo, onChanged, onError }) {
  const saved = photo.caption ?? '';
  const [value, setValue] = useState(saved);
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    if (value === saved || saving) return;
    setSaving(true);
    try {
      await api.updatePhoto({ id: photo.id, caption: value });
      onChanged();
    } catch (err) {
      setValue(saved);
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      disabled={saving}
      placeholder="Caption"
      style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, fontSize: 12 }}
    />
  );
}

export default ProjectsView;
