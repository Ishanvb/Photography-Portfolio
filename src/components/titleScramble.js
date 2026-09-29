/**
 * The title's rewrite, as pure data.
 *
 * Opening the gallery does not swap the title, it rewrites it: every letter
 * starts rolling through random glyphs and settles into its new self, roughly
 * left to right. A scattering of the still-rolling letters are boxed, and the
 * frame is nudged so that a change never reads as the title simply being wrong
 * — there are always some symbols and always some boxes on screen.
 *
 * Kept out of the component so it can be exercised without a DOM.
 */

const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SYMBOLS = '!@#$%^&*(){}[]\\|/?<>+=~;:.,';
const GLYPHS = LETTERS + SYMBOLS;

export const CHANGE_MS = 950;   // how long the whole rewrite takes
export const TICK_MS = 45;      // how often an unsettled letter rolls again

const BOX_CHANCE = 0.16;        // how often a rolling letter is boxed
export const MIN_BOXES = 3;     // however the dice fall, never fewer than this
export const MIN_SYMBOLS = 4;   // ...nor fewer symbols

const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

/** A settled run: every letter is itself, nothing rolling, nothing boxed. */
export const settled = (text) =>
  [...text].map((char) => ({ char, final: char, boxed: false }));

/**
 * When each letter stops rolling, as a fraction of the change. Mostly left to
 * right, with enough jitter that the line does not resolve like a wipe.
 */
export const settleTimes = (n) =>
  Array.from({ length: n }, (_, i) =>
    Math.min(0.97, (i / Math.max(n - 1, 1)) * 0.65 + Math.random() * 0.35)
  );

/** The run as it stands `p` of the way through the change. */
export const frameAt = (target, settleAt, p) => {
  const cells = [];
  const rolling = [];

  for (let i = 0; i < target.length; i++) {
    const final = target[i];
    if (settleAt[i] <= p) {
      cells.push({ char: final, final, boxed: false });
    } else {
      cells.push({ char: pick(GLYPHS), final, boxed: Math.random() < BOX_CHANCE });
      rolling.push(i);
    }
  }

  // Symbols are taken from one end of the shuffled run and boxes from the
  // other, so the two rarely pile onto the same letters.
  for (let k = rolling.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [rolling[k], rolling[j]] = [rolling[j], rolling[k]];
  }
  for (let k = 0; k < Math.min(MIN_SYMBOLS, rolling.length); k++) {
    cells[rolling[k]].char = pick(SYMBOLS);
  }
  let boxes = rolling.reduce((n, i) => n + (cells[i].boxed ? 1 : 0), 0);
  for (let k = rolling.length - 1; k >= 0 && boxes < MIN_BOXES; k--) {
    if (cells[rolling[k]].boxed) continue;
    cells[rolling[k]].boxed = true;
    boxes += 1;
  }

  return cells;
};
