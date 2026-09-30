import { useState } from 'react';
import { api } from './api';
import Uploader from './Uploader';
import * as S from './AdminApp.styled';

/**
 * The home page reel. Each item can point at a project, and optionally at a
 * specific photo within it, which is what the click-through on the home page uses.
 */
function ReelView({ projects, reel, onChanged }) {
  // Local copy so a reorder can render instantly; the parent refresh is the
  // source of truth and overwrites it as soon as the request lands.
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const items = pending ?? reel;

  const patch = async (id, body) => {
    try {
      await api.updateReelItem({ id, ...body });
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const move = async (index, delta) => {
    const next = [...items];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setPending(next);
    await api.reorderReel(next.map((i) => i.id));
    setPending(null);
    onChanged();
  };

  const remove = async (id) => {
    await api.deleteReelItem(id);
    onChanged();
  };

  return (
    <>
      <S.H2>Home reel</S.H2>
      <S.Hint>
        The scrolling strip on the home page. Order here is the order on the site.
      </S.Hint>

      <Uploader
        folder="reel"
        preset="reel"
        label="Drop a photo to add to the reel"
        onUploaded={async (result) => {
          await api.addReelItem({ jpg: result.jpg, webp: result.webp });
          onChanged();
        }}
      />

      {error && <S.Note $error>{error}</S.Note>}

      <div style={{ marginTop: 24 }}>
        {items.map((item, index) => (
          <S.Card key={item.id}>
            <S.Row style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 120, flexShrink: 0 }}>
                <S.Thumb>
                  <img src={item.url_webp ?? item.url_jpg} alt={item.title} loading="lazy" />
                </S.Thumb>
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <S.Field>
                  <span>Title, used as the photo's description for screen readers</span>
                  <S.Input
                    defaultValue={item.title}
                    onBlur={(e) => e.target.value !== item.title && patch(item.id, { title: e.target.value })}
                  />
                </S.Field>
                <S.Field>
                  <span>Clicking this opens</span>
                  <S.Select
                    value={item.target_slug ?? ''}
                    onChange={(e) => patch(item.id, { targetSlug: e.target.value || null })}
                  >
                    <option value="">Nothing</option>
                    {projects.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.title}</option>
                    ))}
                  </S.Select>
                </S.Field>
              </div>
            </S.Row>

            <S.Row>
              <S.IconButton onClick={() => move(index, -1)} disabled={index === 0}>← earlier</S.IconButton>
              <S.IconButton onClick={() => move(index, 1)} disabled={index === items.length - 1}>later →</S.IconButton>
              <S.Spacer />
              <S.IconButton onClick={() => remove(item.id)} style={{ color: '#d97a7a' }}>Remove</S.IconButton>
            </S.Row>
          </S.Card>
        ))}
      </div>
    </>
  );
}

export default ReelView;
