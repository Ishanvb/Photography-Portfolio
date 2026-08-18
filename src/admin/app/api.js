/** Thin client for /api/admin/*. Every call is session-gated server-side. */
async function call(action, { method = 'POST', body } = {}) {
  const res = await fetch(`/api/admin/${action}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export const api = {
  listProjects: () => call('projects', { method: 'GET' }),
  createProject: (body) => call('projects', { body }),
  updateProject: (body) => call('projects', { method: 'PATCH', body }),
  deleteProject: (id) => call('projects', { method: 'DELETE', body: { id } }),

  addPhoto: (body) => call('photos', { body }),
  updatePhoto: (body) => call('photos', { method: 'PATCH', body }),
  reorderPhotos: (order) => call('photos', { method: 'PATCH', body: { order } }),
  deletePhoto: (id) => call('photos', { method: 'DELETE', body: { id } }),

  listReel: () => call('reel', { method: 'GET' }),
  addReelItem: (body) => call('reel', { body }),
  updateReelItem: (body) => call('reel', { method: 'PATCH', body }),
  reorderReel: (order) => call('reel', { method: 'PATCH', body: { order } }),
  deleteReelItem: (id) => call('reel', { method: 'DELETE', body: { id } }),

  createInvite: (label) => call('devices', { body: { label } }),
  removeDevice: (id) => call('devices', { method: 'DELETE', body: { id } }),

  me: () => fetch('/api/auth/me').then((r) => r.json()),
  logout: () => fetch('/api/auth/logout', { method: 'POST' }),
};

/**
 * Uploads one photo.
 *
 * The file goes straight to Supabase Storage rather than through our own API,
 * because Vercel rejects request bodies over 4.5MB and full-resolution photos
 * routinely exceed that. Only once it has landed do we ask the server to build
 * the resized JPEG/WebP pair.
 */
export function uploadPhoto(file, { folder = 'uploads', preset = 'gallery', onProgress } = {}) {
  return call('upload-url', { body: { filename: file.name } })
    .then(({ uploadUrl, path }) =>
      putWithProgress(uploadUrl, file, onProgress).then(() => path)
    )
    .then((path) => call('derive', { body: { path, folder, preset } }));
}

/** fetch() cannot report upload progress, so the PUT goes through XHR. */
function putWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('cacheControl', '31536000');
    form.append('', file);

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error('Upload failed — check your connection'));
    xhr.send(form);
  });
}
