// ============================================================
// BOSS CLASSES — 4 bosses with unique patterns
// ============================================================

class Boss {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.w = 80;
    this.h = 80;
    this.vx = 0;
    this.vy = 0;
    this.maxHp = 4;
    this.hp = this.maxHp;
    this.alive = true;
    this.frame = 0;
    this.phase = 'idle';
    this.phaseTimer = 0;
    this.invTimer = 0;
    this.projectiles = [];
    this.dir = -1;
    this.onGround = false;
    this.startX = x;
    this.setupByType();
  }

  setupByType() {
    switch (this.type) {
      case 'forest':
        this.color = '#2d5016'; this.eyeColor = '#ff4400';
        this.name = 'FOREST TITAN';
        this.attackPatterns = ['charge', 'seeds'];
        break;
      case 'cave':
        this.color = '#334455'; this.eyeColor = '#00ffff';
        this.name = 'CRYSTAL KING';
        this.attackPatterns = ['rocks', 'jump'];
        break;
      case 'ice':
        this.color = '#aaddff'; this.eyeColor = '#000066';
        this.name = 'FROST LORD';
        this.attackPatterns = ['freeze', 'slide'];
        break;
      case 'lava':
        this.color = '#880000'; this.eyeColor = '#ffff00';
        this.name = 'LAVA DEMON';
        this.attackPatterns = ['fireball', 'wave'];
        break;
    }
  }

  takeDamage(particles) {
    if (this.invTimer > 0) return false;
    this.hp--;
    this.invTimer = 60;
    Audio.sfx.bossHit();
    particles.spawnImpact(this.x + this.w / 2, this.y, '#ffffff');
    if (this.hp <= 0) {
      this.alive = false;
      Audio.sfx.victory();
      particles.spawnImpact(this.x + this.w / 2, this.y + this.h / 2, '#ffdd00');
      particles.spawnImpact(this.x + this.w / 2, this.y + this.h / 2, '#ff4400');
    }
    return true;
  }

  update(platforms, player, particles) {
    if (!this.alive) return;
    this.frame++;
    if (this.invTimer > 0) this.invTimer--;
    this.phaseTimer++;

    // Gravity
    this.vy += 0.5;
    this.y += this.vy;
    this.x += this.vx;

    // Platform collision
    this.onGround = false;
    for (const plat of platforms) {
      if (!MathUtils.rectOverlap(this.x, this.y, this.w, this.h, plat.x, plat.y, plat.w, plat.h)) continue;
      const col = MathUtils.rectCollide(this.x, this.y, this.w, this.h, plat.x, plat.y, plat.w, plat.h);
      if (!col) continue;
      if (col.axis === 'y' && this.vy >= 0) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.onGround = true;
      } else if (col.axis === 'x') {
        this.vx *= -1;
        this.x += this.vx * 2;
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.1;
      p.life--;
      if (p.life <= 0 || p.y > 2000) this.projectiles.splice(i, 1);
    }

    // AI patterns
    const dx = player.x - this.x;
    this.dir = dx > 0 ? 1 : -1;

    this.runPattern(player, particles);

    // ---- Hard arena clamp — boss NEVER leaves its arena ----
    // Arena is defined as a 700px wide zone centred on startX
    const arenaLeft  = this.startX - 400;
    const arenaRight = this.startX + 300;
    if (this.x < arenaLeft) {
      this.x  = arenaLeft;
      this.vx = Math.abs(this.vx); // bounce right
    }
    if (this.x + this.w > arenaRight) {
      this.x  = arenaRight - this.w;
      this.vx = -Math.abs(this.vx); // bounce left
    }
  }

  runPattern(player, particles) {
    switch (this.type) {
      case 'forest': this.patternForest(player, particles); break;
      case 'cave':   this.patternCave(player, particles); break;
      case 'ice':    this.patternIce(player, particles); break;
      case 'lava':   this.patternLava(player, particles); break;
    }
  }

  // ---- FOREST BOSS: charge + seeds ----
  patternForest(player, particles) {
    if (this.phaseTimer < 100) {
      this.vx *= 0.85; // idle
    } else if (this.phaseTimer < 220) {
      // Charge
      this.vx = this.dir * 2.5;
    } else if (this.phaseTimer === 120) {
      // Fire seeds
      for (let i = -2; i <= 2; i++) {
        this.projectiles.push({
          x: this.x + this.w / 2, y: this.y + 20,
          vx: i * 1.5 + this.dir * 2, vy: -6,
          gravity: 0.2, life: 160,
          color: '#44aa00', r: 5, damage: true, type: 'seed'
        });
      }
      Audio.sfx.projectile();
    } else if (this.phaseTimer > 360) {
      this.phaseTimer = 0;
      this.vx = 0;
    }
  }

  // ---- CAVE BOSS: rocks + jumps ----
  patternCave(player, particles) {
    if (this.phaseTimer === 40) {
      // Stomp — rain rocks
      for (let i = 0; i < 4; i++) {
        this.projectiles.push({
          x: player.x + MathUtils.rand(-200, 200), y: -50,
          vx: 0, vy: 1, gravity: 0.3, life: 200,
          color: '#667788', r: 12, damage: true, type: 'rock'
        });
      }
      Audio.sfx.projectile();
    } else if (this.phaseTimer === 100 && this.onGround) {
      // Jump
      this.vy = -18;
      Audio.sfx.bossRoar();
    } else if (this.phaseTimer > 200) {
      this.phaseTimer = 0;
    }
    // Drift toward player
    const dx = player.x - (this.x + this.w / 2);
    this.vx = MathUtils.lerp(this.vx, MathUtils.clamp(dx * 0.02, -3, 3), 0.05);
  }

  // ---- ICE BOSS: freeze projectiles + ice slide ----
  patternIce(player, particles) {
    if (this.phaseTimer % 80 === 0) {
      // Shoot ice shard
      const ang = Math.atan2(player.y - this.y, player.x - this.x);
      this.projectiles.push({
        x: this.x + this.w / 2, y: this.y + 20,
        vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5,
        gravity: 0, life: 100,
        color: '#88ccff', r: 7, damage: true, type: 'ice'
      });
      Audio.sfx.projectile();
    }
    if (this.phaseTimer === 120) {
      // Slide
      this.vx = this.dir * 7;
    }
    if (this.phaseTimer > 200) {
      this.phaseTimer = 0;
      this.vx *= 0.9;
    }
    this.vx *= 0.96;
  }

  // ---- LAVA BOSS: fireballs + lava wave ----
  patternLava(player, particles) {
    if (this.phaseTimer % 60 === 0) {
      // Fire arc of fireballs
      for (let i = 0; i < 3; i++) {
        const ang = -Math.PI / 2 + (i - 1) * 0.4;
        this.projectiles.push({
          x: this.x + this.w / 2, y: this.y,
          vx: Math.cos(ang) * 5 + this.dir * 2, vy: Math.sin(ang) * 5,
          gravity: 0.15, life: 120,
          color: '#ff4400', r: 8, damage: true, type: 'fire'
        });
      }
      particles.spawnFire(this.x + this.w / 2, this.y);
      Audio.sfx.projectile();
    }
    // Hover and drift
    const dx = player.x - (this.x + this.w / 2);
    this.vx = MathUtils.lerp(this.vx, MathUtils.clamp(dx * 0.015, -2.5, 2.5), 0.04);
    if (!this.onGround) this.vy = Math.min(this.vy, 2); // float
  }

  draw(ctx, camX, camY) {
    if (!this.alive) return;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY);
    const flicker = this.invTimer > 0 && Math.floor(this.invTimer / 4) % 2 === 0;
    if (flicker) return;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + this.w / 2, py + this.h + 4, this.w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(px, py, this.w, this.h);

    // Outline
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, this.w - 2, this.h - 2);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(px + 4, py + 4, this.w - 8, 16);

    // Eyes (big glowing)
    const angry = this.hp < this.maxHp / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 12, py + 20, 18, 14);
    ctx.fillRect(px + this.w - 30, py + 20, 18, 14);
    ctx.fillStyle = this.eyeColor;
    ctx.fillRect(px + 14, py + 22, 14, 10);
    ctx.fillRect(px + this.w - 28, py + 22, 14, 10);
    // Pupil
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 18, py + 24, 6, 6);
    ctx.fillRect(px + this.w - 24, py + 24, 6, 6);

    if (angry) {
      // Angry brows
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 10, py + 16); ctx.lineTo(px + 30, py + 20);
      ctx.moveTo(px + this.w - 10, py + 16); ctx.lineTo(px + this.w - 30, py + 20);
      ctx.stroke();
    }

    // Type decorations
    if (this.type === 'forest') {
      // Leafy crown
      ctx.fillStyle = '#3d7a20';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(px + 10 + i * 15, py - 10 + Math.sin(this.frame * 0.05 + i) * 4, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'cave') {
      // Crystal spikes on top
      ctx.fillStyle = '#6699cc';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const cx = px + 10 + i * 20;
        ctx.moveTo(cx, py - 20); ctx.lineTo(cx - 8, py); ctx.lineTo(cx + 8, py);
        ctx.fill();
      }
    } else if (this.type === 'ice') {
      // Frost aura
      ctx.strokeStyle = 'rgba(150, 220, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px + this.w / 2, py + this.h / 2, this.w / 2 + 10 + Math.sin(this.frame * 0.1) * 5, this.h / 2 + 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'lava') {
      // Fire crown
      const flick = Math.sin(this.frame * 0.2) * 5;
      ctx.fillStyle = '#ff4400';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const fx = px + 8 + i * 16;
        ctx.moveTo(fx, py - 15 - flick + i % 2 * 8);
        ctx.lineTo(fx - 8, py);
        ctx.lineTo(fx + 8, py);
        ctx.fill();
      }
    }

    // Mouth
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 20, py + 52, this.w - 40, 8);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(px + 22, py + 54, 8, 4);
    ctx.fillRect(px + this.w - 30, py + 54, 8, 4);

    ctx.restore();

    // Draw projectiles
    for (const p of this.projectiles) {
      const ppx = Math.floor(p.x - camX);
      const ppy = Math.floor(p.y - camY);
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ppx, ppy, p.r, 0, Math.PI * 2);
      ctx.fill();
      // Inner glow
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(ppx - p.r * 0.3, ppy - p.r * 0.3, p.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  checkProjectileHit(px, py, pw, ph) {
    for (const p of this.projectiles) {
      if (MathUtils.dist(p.x, p.y, px + pw / 2, py + ph / 2) < p.r + pw / 2) return true;
    }
    return false;
  }
}