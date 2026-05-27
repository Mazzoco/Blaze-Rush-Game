// ============================================================
// ENEMY CLASSES
// ============================================================

class Enemy {
  constructor(x, y, type, theme) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.theme = theme;
    this.w = 28;
    this.h = 28;
    this.vx = 0;
    this.vy = 0;
    this.dir = -1;
    this.speed = 1.5;
    this.alive = true;
    this.frame = 0;
    this.dead = false;
    this.deadTimer = 0;
    this.patrolLeft = x - 80;
    this.patrolRight = x + 80;
    this.onGround = false;
    this.setupByType();
  }

  setupByType() {
    switch (this.type) {
      case 'bug':      this.speed = 1.2; this.color = '#44aa44'; this.eyeColor = '#ff0000'; break;
      case 'mushroom': this.speed = 0.8; this.color = '#cc3333'; this.eyeColor = '#ffffff'; this.w = 32; this.h = 32; break;
      case 'bat':      this.speed = 2;   this.color = '#553366'; this.eyeColor = '#ff8800'; this.flying = true; break;
      case 'crystal':  this.speed = 1.5; this.color = '#4488cc'; this.eyeColor = '#00ffff'; break;
      case 'mole':     this.speed = 1.0; this.color = '#886655'; this.eyeColor = '#ffcc00'; break;
      case 'snowman':  this.speed = 1.0; this.color = '#ccddff'; this.eyeColor = '#333333'; break;
      case 'yeti':     this.speed = 1.8; this.color = '#aabbcc'; this.eyeColor = '#ff4444'; this.w = 36; this.h = 36; break;
      case 'demon':    this.speed = 2.0; this.color = '#cc2200'; this.eyeColor = '#ffff00'; break;
      case 'fireling': this.speed = 1.5; this.color = '#ff4400'; this.eyeColor = '#ffffff'; break;
      default:         this.speed = 1.5; this.color = '#888888'; this.eyeColor = '#ffffff';
    }
    if (this.flying) {
      this.baseY = this.y;
      this.flyAmp = 30;
    }
  }

  update(platforms, player) {
    if (this.dead) {
      this.deadTimer++;
      this.vy += 0.5;
      this.y += this.vy;
      return;
    }

    this.frame++;

    if (this.flying) {
      // Flying patrol
      this.x += this.dir * this.speed;
      this.y = this.baseY + Math.sin(this.frame * 0.05) * this.flyAmp;
      if (this.x <= this.patrolLeft || this.x >= this.patrolRight) this.dir *= -1;
      return;
    }

    // Gravity
    this.vy += 0.4;
    this.x += this.dir * this.speed;
    this.y += this.vy;

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
      } else if (col.axis === 'y') {
        this.y = plat.y + plat.h;
        this.vy = 0;
      } else {
        this.dir *= -1;
        this.x += this.dir * (col.depth + 1);
      }
    }

    // Patrol bounds
    if (this.x <= this.patrolLeft) { this.dir = 1; this.x = this.patrolLeft; }
    if (this.x + this.w >= this.patrolRight) { this.dir = -1; this.x = this.patrolRight - this.w; }

    // Fall off platform check
    if (this.onGround) {
      const nextX = this.x + this.dir * (this.speed + 4);
      let edgeSafe = false;
      for (const plat of platforms) {
        if (nextX + this.w > plat.x && nextX < plat.x + plat.w &&
            this.y + this.h >= plat.y && this.y + this.h <= plat.y + plat.h + 2) {
          edgeSafe = true; break;
        }
      }
      if (!edgeSafe) this.dir *= -1;
    }

    // Out of world
    if (this.y > 2000) this.alive = false;
  }

  draw(ctx, camX, camY) {
    if (!this.alive) return;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY);

    if (this.dead) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - this.deadTimer / 20);
      ctx.restore();
      return;
    }

    ctx.save();
    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(px, py, this.w, this.h);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(px + 2, py + 2, this.w - 4, 4);

    // Eyes
    const eyeX = this.dir > 0 ? px + this.w - 10 : px + 4;
    ctx.fillStyle = '#000';
    ctx.fillRect(eyeX, py + 6, 8, 7);
    ctx.fillStyle = this.eyeColor;
    ctx.fillRect(eyeX + 1, py + 7, 5, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(eyeX + 3, py + 7, 2, 2);

    // Type-specific details
    if (this.type === 'mushroom') {
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.ellipse(px + this.w / 2, py - 2, this.w / 2, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px + 8, py - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + this.w - 8, py - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'bat' || this.flying) {
      const wingFlap = Math.sin(this.frame * 0.3) * 12;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(px, py + 8);
      ctx.lineTo(px - 20, py - wingFlap);
      ctx.lineTo(px + this.w / 2, py + 4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + this.w, py + 8);
      ctx.lineTo(px + this.w + 20, py - wingFlap);
      ctx.lineTo(px + this.w / 2, py + 4);
      ctx.fill();
    } else if (this.type === 'snowman') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px + this.w / 2, py - 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(px + this.w / 2 + 4, py + 0, 8, 4);
    } else if (this.type === 'fireling') {
      const fFlick = Math.sin(this.frame * 0.3) * 3;
      ctx.fillStyle = `rgba(255, ${100 + fFlick * 10}, 0, 0.6)`;
      ctx.beginPath();
      ctx.ellipse(px + this.w / 2, py, this.w / 3, 14 + fFlick, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'demon') {
      // Horns
      ctx.fillStyle = '#880000';
      ctx.fillRect(px + 2, py - 8, 5, 10);
      ctx.fillRect(px + this.w - 7, py - 8, 5, 10);
    }

    ctx.restore();
  }

  stomp() {
    this.dead = true;
    this.alive = false;
    this.vy = -6;
  }
}