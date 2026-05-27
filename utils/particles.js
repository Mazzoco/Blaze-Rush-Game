// ============================================================
// PARTICLE SYSTEM
// ============================================================

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, opts = {}) {
    const count = opts.count || 6;
    for (let i = 0; i < count; i++) {
      const angle = opts.angle !== undefined
        ? opts.angle + MathUtils.rand(-opts.spread || -Math.PI, opts.spread || Math.PI)
        : MathUtils.rand(0, Math.PI * 2);
      const speed = MathUtils.rand(opts.minSpeed || 1, opts.maxSpeed || 4);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: MathUtils.rand(opts.minDecay || 0.03, opts.maxDecay || 0.07),
        size: MathUtils.rand(opts.minSize || 2, opts.maxSize || 6),
        color: opts.color || '#ffffff',
        gravity: opts.gravity !== undefined ? opts.gravity : 0.1,
        shape: opts.shape || 'circle'
      });
    }
  }

  spawnJump(x, y) {
    this.spawn(x, y + 10, {
      count: 8, color: '#aaffee', minSpeed: 1, maxSpeed: 3,
      angle: -Math.PI / 2, spread: Math.PI / 3,
      minSize: 2, maxSize: 5, gravity: 0.05
    });
  }

  spawnImpact(x, y, color = '#ffdd00') {
    this.spawn(x, y, {
      count: 12, color, minSpeed: 2, maxSpeed: 6,
      minSize: 2, maxSize: 7, gravity: 0.15
    });
  }

  spawnRing(x, y) {
    this.spawn(x, y, {
      count: 6, color: '#ffd700', minSpeed: 1, maxSpeed: 3,
      minSize: 2, maxSize: 4, gravity: 0.05
    });
  }

  spawnDash(x, y, dir) {
    this.spawn(x, y, {
      count: 5, color: '#ff6600',
      angle: dir > 0 ? Math.PI : 0, spread: Math.PI / 4,
      minSpeed: 2, maxSpeed: 5, gravity: 0, minDecay: 0.08, maxDecay: 0.15
    });
  }

  spawnSnow(x, y) {
    this.spawn(x, y, {
      count: 3, color: '#ccffff', minSpeed: 0.5, maxSpeed: 2,
      angle: Math.PI / 2, spread: Math.PI / 4,
      minSize: 1, maxSize: 3, gravity: 0.02, minDecay: 0.01, maxDecay: 0.03
    });
  }

  spawnFire(x, y) {
    this.spawn(x, y, {
      count: 4, color: ['#ff4400', '#ff8800', '#ffcc00'][MathUtils.randInt(0, 2)],
      angle: -Math.PI / 2, spread: Math.PI / 4,
      minSpeed: 1, maxSpeed: 3, gravity: -0.05,
      minSize: 2, maxSize: 6, minDecay: 0.04, maxDecay: 0.08
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx, camX, camY) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camX, p.y - camY, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear() { this.particles = []; }
}