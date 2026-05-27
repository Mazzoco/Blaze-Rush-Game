// ============================================================
// MATH UTILITIES
// ============================================================

const MathUtils = {
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
  rand: (min, max) => Math.random() * (max - min) + min,
  randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  sign: (v) => v < 0 ? -1 : v > 0 ? 1 : 0,

  rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  },

  // AABB collision response
  rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
    if (!this.rectOverlap(ax, ay, aw, ah, bx, by, bw, bh)) return null;
    const overlapX = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
    const overlapY = Math.min(ay + ah, by + bh) - Math.max(ay, by);
    if (overlapX < overlapY) return { axis: 'x', depth: overlapX };
    return { axis: 'y', depth: overlapY };
  }
};