// src/lib/utils/shuffle.ts
// Mélange + prévention de 3 items identiques d’affilée.

export function shuffleArray<T>(arr: T[], seed = 1337): T[] {
  let a = 1664525, c = 1013904223;
  let state = seed >>> 0;
  const rand = () => {
    state = (Math.imul(a, state) + c) >>> 0;
    return state / 0xffffffff;
  };
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function preventTriples<T>(items: T[], key: (x: T) => string): T[] {
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    const n = out.length;
    if (n >= 2 && key(out[n - 1]) === k && key(out[n - 2]) === k) {
      let swapped = false;
      for (let s = n - 1; s >= 0; s--) {
        if (key(out[s]) !== k) {
          out.splice(s + 1, 0, it);
          swapped = true;
          break;
        }
      }
      if (!swapped) out.push(it);
    } else {
      out.push(it);
    }
  }
  return out;
}
