# MariPortfolio

## Known bugs — do not reintroduce

### Work tile opens the wrong photo in the collection pop-up

**Symptom:** clicking some photos on `/work` opens `CollectionModal` on a
different photo — e.g. tile 08 (the Portrait project's hero) opened on photo 01.
It has come back more than once.

**Cause:** the Work grid and the pop-up built their photo lists separately, and
the grid opened the pop-up by *position*. The grid shows each project's
`photos` **plus its `hero`**, but the hero lives on the `projects` row
(`hero_jpg`), not in the `photos` table — so it was not in the pop-up's list,
and its index fell back to 0. Any list-shape difference (hero, cover, dedupe,
filtered YouTube entries, a photo count change in the DB) shifts indices the
same way.

**Rules:**
- Both `src/pages/Work.jsx` and `src/components/CollectionModal.jsx` build a
  project's list from `collectionOf(project)` in `src/content/photos.js`. Never
  derive a separate list in either one.
- Open a photo by its `jpg`, not by index. `photoIndex` is only for callers that
  have nothing else (the reel's `targetPhotoIndex`, an index into
  `project.photos`).
- `collectionOf` appends extras (the hero) at the end so `project.photos`
  indices — and so every reel `targetPhotoIndex` — stay valid.

**Review check when touching the grid, the modal, the reel, or the content
shape:** for every Work tile, the pop-up must open on that same `jpg`, and every
reel item with a `targetPhotoIndex` must still land on
`project.photos[targetPhotoIndex]`. Check this against `src/content/fallback.json`
and the live `/api/content`. Click-test at least one hero tile (the last tile of
each project) in the browser.
