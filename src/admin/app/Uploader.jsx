import { useCallback, useRef, useState } from 'react';
import { uploadPhoto } from './api';
import * as S from './AdminApp.styled';

/**
 * Drag-and-drop (or click) uploader. Files are processed one at a time so a
 * large batch cannot open a dozen simultaneous connections; each finished
 * upload is reported immediately via onUploaded so the caller can attach it.
 */
function Uploader({ folder, preset = 'gallery', onUploaded, label }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);

  const run = useCallback(async (files) => {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(tiff?|heic)$/i.test(f.name));
    if (list.length === 0) {
      setError('Those files do not look like images.');
      return;
    }

    setQueue(list.map((f) => ({ name: f.name, progress: 0, done: false })));

    for (let i = 0; i < list.length; i++) {
      try {
        const result = await uploadPhoto(list[i], {
          folder,
          preset,
          onProgress: (p) =>
            setQueue((q) => q.map((item, idx) => (idx === i ? { ...item, progress: p } : item))),
        });
        setQueue((q) => q.map((item, idx) => (idx === i ? { ...item, progress: 1, done: true } : item)));
        await onUploaded(result, list[i]);
      } catch (err) {
        setError(`${list[i].name}: ${err.message}`);
        setQueue((q) => q.map((item, idx) => (idx === i ? { ...item, failed: true } : item)));
      }
    }

    // Leave the finished list up briefly so she can see it completed.
    setTimeout(() => setQueue([]), 1500);
  }, [folder, preset, onUploaded]);

  return (
    <>
      <S.Drop
        $over={over}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          run(e.dataTransfer.files);
        }}
      >
        {label ?? 'Drop photos here, or click to choose'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.tif,.tiff"
          multiple
          hidden
          onChange={(e) => { run(e.target.files); e.target.value = ''; }}
        />
      </S.Drop>

      {queue.map((item) => (
        <div key={item.name} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: item.failed ? '#ff6b6b' : '#8a8a8a' }}>
            {item.name} {item.done ? '· processed' : item.failed ? '· failed' : ''}
          </div>
          <S.Progress $value={item.progress}><div /></S.Progress>
        </div>
      ))}

      {error && <S.Note $error>{error}</S.Note>}
    </>
  );
}

export default Uploader;
