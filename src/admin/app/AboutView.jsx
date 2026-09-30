import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import * as S from './AdminApp.styled';

/**
 * The About page: the paragraph, and the two lists beside it.
 *
 * The paragraph is stored in two halves because the page renders them
 * differently — the opening sentence is the bright one, the rest sits behind
 * it. The lists are ordered, so each row can be moved or removed.
 */
function AboutView() {
  const [state, setState] = useState({ status: 'loading' });
  const [error, setError] = useState(null);
  const [reloads, setReloads] = useState(0);

  // Children ask for a reload rather than calling the fetch themselves, so the
  // request always belongs to an effect that can disown it on the way out.
  const reload = useCallback(() => setReloads((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { about, lines } = await api.getAbout();
        if (alive) setState({ status: 'ready', about, lines });
      } catch (err) {
        if (alive) setState({ status: 'error', error: err.message });
      }
    })();
    return () => { alive = false; };
  }, [reloads]);

  if (state.status === 'loading') return <S.Hint>Loading…</S.Hint>;
  if (state.status === 'error') return <S.Note $error>{state.error}</S.Note>;

  const listOf = (kind) =>
    state.lines.filter((l) => l.kind === kind).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <S.H2>About</S.H2>
      <S.Hint>
        Everything on the About page. Text boxes save as soon as you click away.
      </S.Hint>

      {error && <S.Note $error>{error}</S.Note>}

      <S.Card>
        <Paragraph about={state.about} onChanged={reload} onError={setError} />
      </S.Card>

      <S.Card>
        <Lines
          kind="bio"
          title="Biography"
          hint="The list that scrolls in first, one line at a time. A line usually reads “Label : Value”."
          lines={listOf('bio')}
          onChanged={reload}
          onError={setError}
        />
      </S.Card>

      <S.Card>
        <Lines
          kind="work"
          title="Work"
          hint="The list that follows the biography."
          lines={listOf('work')}
          onChanged={reload}
          onError={setError}
        />
      </S.Card>
    </>
  );
}

/** The two halves of the paragraph. */
function Paragraph({ about, onChanged, onError }) {
  const [form, setForm] = useState({ intro: about.intro ?? '', body: about.body ?? '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.saveAboutText(form);
      setMessage('Saved.');
      onChanged();
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <S.Field>
        <span>Opening sentence — the bright one at the start of the paragraph</span>
        <S.Input value={form.intro} onChange={set('intro')} />
      </S.Field>
      <S.Field>
        <span>The rest of the paragraph</span>
        <S.Input
          as="textarea"
          rows={7}
          value={form.body}
          onChange={set('body')}
          style={{ resize: 'vertical', lineHeight: 1.6, minHeight: 140 }}
        />
      </S.Field>
      <S.Row>
        <S.Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save paragraph'}
        </S.Button>
        {message && <S.Note>{message}</S.Note>}
      </S.Row>
    </>
  );
}

/** One ordered list — biography or work. */
function Lines({ kind, title, hint, lines, onChanged, onError }) {
  const move = async (index, delta) => {
    const next = [...lines];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    try {
      await api.reorderAboutLines(kind, next.map((l) => l.id));
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  };

  const add = async () => {
    try {
      await api.addAboutLine(kind);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  };

  const remove = async (line) => {
    if (!window.confirm(`Remove “${line.text || 'this empty line'}”?`)) return;
    try {
      await api.deleteAboutLine(line.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <>
      <S.Field as="div"><span>{title}</span></S.Field>
      <S.Hint>{hint}</S.Hint>

      {lines.map((line, index) => (
        <S.Row key={line.id}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <LineText line={line} onChanged={onChanged} onError={onError} />
          </div>
          <span>
            <S.IconButton onClick={() => move(index, -1)} disabled={index === 0}>↑</S.IconButton>
            <S.IconButton onClick={() => move(index, 1)} disabled={index === lines.length - 1}>↓</S.IconButton>
          </span>
          <S.IconButton onClick={() => remove(line)} title="Remove">✕</S.IconButton>
        </S.Row>
      ))}

      <S.Row>
        <S.Button $variant="ghost" onClick={add}>Add another line</S.Button>
      </S.Row>
    </>
  );
}

/**
 * One line's text. Left uncontrolled and saved on blur, so a reorder or a
 * reload can replace the value underneath without the field having to mirror
 * it into state of its own.
 */
function LineText({ line, onChanged, onError }) {
  const commit = async (event) => {
    const text = event.target.value;
    if (text === (line.text ?? '')) return;
    try {
      await api.updateAboutLine(line.id, text);
      onChanged();
    } catch (err) {
      event.target.value = line.text ?? '';
      onError(err.message);
    }
  };

  return (
    <S.Input
      key={line.text}
      defaultValue={line.text ?? ''}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      placeholder="Hometown : Austin, TX"
    />
  );
}

export default AboutView;
