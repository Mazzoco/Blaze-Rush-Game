// ============================================================
// BLAZEDASH — MAIN GAME ENGINE
// ============================================================

// ---- Constants ----
const CANVAS_W = 960;
const CANVAS_H = 540;
const RING_RADIUS = 8;
const CHECKPOINT_W = 24;
const CHECKPOINT_H = 44;

// ---- Game State ----
const GameState = {
  score: 0,
  rings: 0,
  lives: 3,
  currentLevel: 0,
  unlockedLevels: [true, false, false, false],
  totalTime: 0,
  highScores: [],
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('blazedash') || '{}');
      if (d.unlockedLevels) this.unlockedLevels = d.unlockedLevels;
      if (d.highScores)     this.highScores     = d.highScores;
    } catch(e) {}
  },
  save() {
    try {
      localStorage.setItem('blazedash', JSON.stringify({
        unlockedLevels: this.unlockedLevels,
        highScores: this.highScores
      }));
    } catch(e) {}
  },
  addScore(entry) {
    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    this.save();
  }
};

// ---- Player ----
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 32;
    this.vx = 0;
    this.vy = 0;
    this.dir = 1;
    this.onGround = false;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.state = 'idle';   // idle | run | jump | djump | dash | hurt
    this.frame = 0;
    this.animTimer = 0;
    this.invTimer = 0;
    this.hurtTimer = 0;
    this.hp = 5;
    this.maxHp = 5;
    this.dashEnergy = 100;
    this.maxDashEnergy = 100;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dead = false;
    // Physics
    this.WALK_SPEED  = 3.5;
    this.RUN_SPEED   = 6.5;
    this.DASH_SPEED  = 13;
    this.JUMP_FORCE  = -11.5;
    this.DJUMP_FORCE = -11;
    this.GRAVITY     = 0.55;
    this.FRICTION    = 0.82;
    this.ICE_FRICTION= 0.97;
    this.onIce = false;
  }

  jump(isDouble) {

  // DOUBLE JUMP
  if (isDouble) {

    this.vy = this.DJUMP_FORCE;
    this.state = 'djump';

    // partículas APENAS no segundo pulo
    Game.particles.spawnImpact(
      this.x + this.w / 2,
      this.y + this.h / 2,
      '#cccccc'
    );

  } 
  
  // PRIMEIRO PULO
  else {

    this.vy = this.JUMP_FORCE;
    this.state = 'jump';

  }

  // conta os pulos usados
  this.jumpCount++;

  Audio.sfx.jump();
}

  dash(dir) {
    if (this.dashEnergy < 30 || this.dashCooldown > 0) return;
    this.dashing = true;
    this.dashTimer = 15;
    this.dashCooldown = 40;
    this.vx = dir * this.DASH_SPEED;
    this.vy = 0;          // zero vertical velocity so dash travels in a straight line
    this.dashEnergy -= 30;
    this.state = 'dash';
    Audio.sfx.dash();
    Game.particles.spawnDash(this.x + this.w / 2, this.y + this.h / 2, dir);
  }

  takeDamage() {
    if (this.invTimer > 0 || this.dead) return;
    this.hp--;
    this.invTimer = 90;
    this.hurtTimer = 20;
    this.vx = -this.dir * 5;
    this.vy = -7;
    this.state = 'hurt';
    Audio.sfx.hit();
    Game.particles.spawnImpact(this.x + this.w / 2, this.y + this.h / 2, '#ff4444');

    if (this.hp <= 0) {
      this.dead = true;
      Audio.sfx.die();
    }
  }

  update(level, keys) {
    if (this.dead) return;
    this.frame++;
    if (this.invTimer > 0)    this.invTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.hurtTimer > 0)    this.hurtTimer--;

    // Regen dash energy
    if (!this.dashing && this.dashEnergy < this.maxDashEnergy) {
      this.dashEnergy = Math.min(this.maxDashEnergy, this.dashEnergy + 0.4);
    }

    // Input
    const left  = keys['ArrowLeft']  || keys['KeyA'];
    const right = keys['ArrowRight'] || keys['KeyD'];
    const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['KeyZ'];
    const dashK = keys['ShiftLeft']  || keys['ShiftRight'] || keys['KeyX'];
    const run   = keys['ShiftLeft']  || keys['ShiftRight'];

    if (this.hurtTimer > 0) {
      // No control during hurt
    } else if (this.dashing) {
      this.dashTimer--;
      if (this.dashTimer <= 0) {
        this.dashing = false;
        this.vx *= 0.5;
      }
    } else {
      // Horizontal movement
      const spd = run ? this.RUN_SPEED : this.WALK_SPEED;
      if (left)  { this.vx -= 1.2; this.dir = -1; }
      if (right) { this.vx += 1.2; this.dir =  1; }

      const fric = this.onIce ? this.ICE_FRICTION : this.FRICTION;
      this.vx *= fric;
      this.vx = MathUtils.clamp(this.vx, -spd, spd);

      // Dash trigger (tap X or Shift)
      if (dashK && !this._dashPrev && this.dashCooldown <= 0) {
        this.dash(this.dir);
      }
    }
    this._dashPrev = dashK;

// Jump input
if (jump && !this._jumpPrev) {
  // Primeiro pulo
  if (this.onGround) {
    this.jumpCount = 0;
    this.jump(false);
  }
  // Double jump
  else if (this.jumpCount < this.maxJumps) {
    this.jump(true);
  }
}
// salva estado anterior do botão
this._jumpPrev = jump;

    // Gravity — suppressed during dash so it travels in a straight line
    if (!this.dashing) {
      this.vy += this.GRAVITY;
      this.vy = Math.min(this.vy, 20);
    }

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Clamp to level
    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x + this.w > level.width) { this.x = level.width - this.w; this.vx = 0; }

    // Platform collision — ONE-WAY: player can jump through from below,
    // only lands when falling downward onto the top surface.
    this.onGround = false;
    this.onIce = false;
    for (const plat of level.platforms) {
      if (!MathUtils.rectOverlap(this.x, this.y, this.w, this.h, plat.x, plat.y, plat.w, plat.h)) continue;

      // Only resolve TOP collision (one-way platforms):
      // player must be moving downward AND the player's feet in the previous
      // frame were at or above the platform top.
      const prevFeetY = this.y + this.h - this.vy; // feet Y before this frame's move
      if (this.vy >= 0 && prevFeetY <= plat.y + 6) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.onGround = true;
        if (plat.ice) this.onIce = true;
        if (this.jumpCount > 0) Audio.sfx.land();
        this.jumpCount = 0;
      }
      // Side collisions only against the level left/right world boundary
      // (skip side push so player can always jump through platforms)
    }

    // Update state for animation
    if (!this.dashing && this.hurtTimer <= 0) {
      if (!this.onGround) {
        this.state = this.jumpCount >= 2 ? 'djump' : 'jump';
      } else if (Math.abs(this.vx) > 0.5) {
        this.state = Math.abs(this.vx) > 5 ? 'run' : 'walk';
      } else {
        this.state = 'idle';
      }
    }

    // Lava floor kill
    if (level.lavaFloor && this.y > CANVAS_H + 50) {
      this.takeDamage();
      if (!this.dead) {
        this.y = Game.checkpointX ? 300 : level.playerStart.y;
        this.x = Game.checkpointX || level.playerStart.x;
        this.vy = 0; this.vx = 0;
      }
    }
    if (this.y > 1500) this.dead = true;
  }

  draw(ctx, camX, camY) {
    Renderer.drawPlayer(
      ctx,
      this.x - camX,
      this.y - camY,
      this.w, this.h,
      this.state, this.dir, this.frame, this.invTimer
    );
  }
}

// ---- Main Game Controller ----
const Game = {
  canvas: null,
  ctx: null,
  keys: {},
  prevKeys: {},
  running: false,
  paused: false,
  rafId: null,
  player: null,
  enemies: [],
  boss: null,
  rings: [],
  checkpoints: [],
  activeCPs: new Set(),
  checkpointX: 0,
  checkpointY: 0,
  particles: null,
  camX: 0,
  camY: 0,
  targetCamX: 0,
  targetCamY: 0,
  frame: 0,
  levelTimer: 0,
  bossActive: false,
  bossDefeated: false,
  stageTransition: false,
  transitionTimer: 0,
  message: '',
  messageTimer: 0,
  currentLevelData: null,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width  = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.particles = new ParticleSystem();

    // Key events
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Escape' || e.code === 'KeyP') this.togglePause();
      e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    // UI buttons
    document.getElementById('btn-start').onclick       = () => this.startGame(0);
    document.getElementById('btn-select').onclick      = () => this.showScreen('select-screen');
    document.getElementById('btn-ranking').onclick     = () => this.showRanking();
    document.getElementById('btn-back-menu').onclick   = () => this.showScreen('menu-screen');
    document.getElementById('btn-back-menu2').onclick  = () => this.showScreen('menu-screen');
    document.getElementById('btn-retry').onclick       = () => this.startGame(GameState.currentLevel);
    document.getElementById('btn-go-menu').onclick     = () => { this.stopGame(); this.showScreen('menu-screen'); Audio.playBGM('menu'); };
    document.getElementById('btn-v-menu').onclick      = () => { this.showScreen('menu-screen'); Audio.playBGM('menu'); };
    document.getElementById('btn-resume').onclick      = () => this.togglePause();
    document.getElementById('btn-quit').onclick        = () => { this.stopGame(); this.showScreen('menu-screen'); Audio.playBGM('menu'); };

    // Stage select cards
    document.querySelectorAll('.stage-card').forEach(card => {
      card.onclick = () => {
        const idx = parseInt(card.dataset.stage);
        if (GameState.unlockedLevels[idx]) this.startGame(idx);
      };
    });

    // Init audio
    Audio.init();
    GameState.load();
    this.updateStageCards();
    Audio.playBGM('menu');
    this.showScreen('menu-screen');
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  updateStageCards() {
    document.querySelectorAll('.stage-card').forEach(card => {
      const idx = parseInt(card.dataset.stage);
      if (GameState.unlockedLevels[idx]) card.classList.remove('locked');
      else card.classList.add('locked');
    });
  },

  showRanking() {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    if (GameState.highScores.length === 0) {
      list.innerHTML = '<div class="ranking-item"><span>Nenhum score ainda!</span></div>';
    } else {
      GameState.highScores.forEach((e, i) => {
        list.innerHTML += `<div class="ranking-item"><span>#${i+1} Fase ${e.level+1}</span><span>${e.score} pts</span></div>`;
      });
    }
    this.showScreen('ranking-screen');
  },

  startGame(levelIdx) {
    Audio.resume();
    GameState.currentLevel = levelIdx;
    GameState.score  = levelIdx === 0 ? 0 : GameState.score;
    GameState.rings  = levelIdx === 0 ? 0 : GameState.rings;
    GameState.lives  = levelIdx === 0 ? 3 : GameState.lives;
    this.loadLevel(levelIdx);
    this.showScreen('game-screen');
    this.running = true;
    this.paused  = false;
    document.getElementById('pause-overlay').classList.add('hidden');
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.loop();
  },

  loadLevel(idx) {
    const ld = Levels[idx];
    this.currentLevelData = ld;
    this.frame = 0;
    this.levelTimer = 0;
    this.bossActive   = false;
    this.bossDefeated = false;
    this.stageTransition = false;
    this.checkpointX  = 0;
    this.checkpointY  = 0;
    this.particles.clear();

    this.player = new Player(ld.playerStart.x, ld.playerStart.y);

    // Build enemies
    this.enemies = ld.enemies.map(e => new Enemy(e.x, e.y, e.type, ld.theme));

    // Build boss
    const bd = ld.boss;
    this.boss = new Boss(bd.x, bd.y, bd.type);

    // Build rings (with collected tracking)
    this.rings = ld.rings.map(r => ({ x: r.x, y: r.y, collected: false }));

    // Build checkpoints
    this.checkpoints = ld.checkpoints.map(cp => ({ x: cp.x, y: cp.y, active: false }));

    // Camera
    this.camX = ld.playerStart.x - CANVAS_W / 3;
    this.camY = 0;

    // HUD
    document.getElementById('hud-stage-name').textContent = ld.name;
    document.getElementById('boss-hp-container').classList.add('hidden');
    this.updateHUD();
    Audio.playBGM(ld.bgm);
  },

  stopGame() {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    Audio.stopBGM();
  },

  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    document.getElementById('pause-overlay').classList.toggle('hidden', !this.paused);
  },

  showMessage(txt, dur = 120) {
    this.message = txt;
    this.messageTimer = dur;
    const el = document.getElementById('game-message');
    el.textContent = txt;
    el.classList.remove('hidden');
  },

  updateHUD() {
    document.getElementById('lives-val').textContent = GameState.lives;
    document.getElementById('score-val').textContent = GameState.score;
    document.getElementById('rings-val').textContent = GameState.rings;
    const secs  = Math.floor(this.levelTimer / 60);
    const mins  = Math.floor(secs / 60);
    const s     = secs % 60;
    document.getElementById('timer-val').textContent = `${mins}:${s.toString().padStart(2,'0')}`;
    // Dash bar
    const pct = (this.player ? this.player.dashEnergy / this.player.maxDashEnergy : 1) * 100;
    document.getElementById('dash-fill').style.width = pct + '%';
    // Boss HP
    if (this.bossActive && this.boss && this.boss.alive) {
      document.getElementById('boss-hp-container').classList.remove('hidden');
      const bpct = (this.boss.hp / this.boss.maxHp) * 100;
      document.getElementById('boss-hp-fill').style.width = bpct + '%';
    }
  },

  // ---- MAIN LOOP ----
  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    if (!this.running || this.paused) return;
    this.update();
    this.draw();
  },

  update() {
    const ld = this.currentLevelData;
    if (!ld || !this.player) return;

    this.frame++;
    this.levelTimer++;

    // ---- Player update ----
    this.player.update(ld, this.keys);

    // ---- Activate boss when player reaches boss zone ----
    if (!this.bossActive && !this.bossDefeated) {
      if (this.player.x > ld.boss.x - 500) {
        this.bossActive = true;
        Audio.playBGM('boss');
        document.getElementById('boss-hp-container').classList.remove('hidden');
        this.showMessage(`BOSS: ${this.boss.name}!`, 150);
        Audio.sfx.bossRoar();
      }
    }

    // ---- Enemies ----
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.update(ld.platforms, this.player);

      // Player stomp on enemy
      if (!this.player.dead && this.player.invTimer === 0) {
        const py = this.player;
        if (MathUtils.rectOverlap(py.x, py.y, py.w, py.h, e.x, e.y, e.w, e.h)) {
          const bottomY = py.y + py.h;
          const eMidY   = e.y + e.h / 2;
          if (py.vy > 0 && bottomY < eMidY + 12) {
            // Stomp
            e.stomp();
            py.vy = -9;
            py.jumpCount = 0;
            GameState.score += 100;
            this.particles.spawnImpact(e.x + e.w / 2, e.y, '#ffdd00');
            Audio.sfx.stomp();
            this.showMessage('+100', 40);
          } else {
            // Lateral damage
            py.takeDamage();
          }
        }
      }
    }

    // ---- Boss ----
    if (this.bossActive && this.boss && this.boss.alive) {
      this.boss.update(ld.platforms, this.player, this.particles);

      const py = this.player;

      // Player stomp on boss HEAD (top 20px)
      if (!py.dead && py.invTimer === 0) {
        const overlapBoss = MathUtils.rectOverlap(py.x, py.y, py.w, py.h, this.boss.x, this.boss.y, this.boss.w, this.boss.h);
        if (overlapBoss) {

  const playerBottom = py.y + py.h;
  const playerCenter = py.x + py.w / 2;

  const bossTop = this.boss.y;
  const bossLeft = this.boss.x;
  const bossRight = this.boss.x + this.boss.w;

  // margem da cabeça do boss
  const stompZone = bossTop + 28;

  // player está caindo?
  const falling = py.vy > 0;

  // player está dentro da largura do boss?
  const insideBossWidth =
    playerCenter > bossLeft + 10 &&
    playerCenter < bossRight - 10;

  // ===== STOMP =====
  if (
    falling &&
    playerBottom < stompZone &&
    insideBossWidth
  ) {

    if (this.boss.takeDamage(this.particles)) {

      py.vy = -12;

      // permite continuar double jump depois do bounce
      py.jumpCount = 1;

      GameState.score += 500;

      this.showMessage('+500 BOSS HIT!', 60);

      Audio.sfx.stomp();

    }

  }

  // ===== DANO LATERAL =====
  else {

    py.takeDamage();

  }
}
        // Projectile damage
        if (py.invTimer === 0 && this.boss.checkProjectileHit(py.x, py.y, py.w, py.h)) {
          py.takeDamage();
        }
      }

      // Boss defeated
      if (!this.boss.alive) {
        this.bossDefeated = true;
        this.bossActive   = false;
        GameState.score  += 2000;
        document.getElementById('boss-hp-container').classList.add('hidden');
        this.showMessage('BOSS DERROTADO! +2000', 180);
        Audio.sfx.stageClr();
        // Unlock next level
        const next = GameState.currentLevel + 1;
        if (next < 4) {
          GameState.unlockedLevels[next] = true;
          GameState.save();
          this.updateStageCards();
        }
        // Start transition after delay
        setTimeout(() => {
          this.stageTransition = true;
          this.transitionTimer = 180;
        }, 3000);
      }
    }

    // ---- Rings ----
    for (const ring of this.rings) {
      if (ring.collected) continue;
      const py = this.player;
      if (MathUtils.dist(py.x + py.w / 2, py.y + py.h / 2, ring.x, ring.y) < RING_RADIUS + 16) {
        ring.collected = true;
        GameState.rings++;
        GameState.score += 10;
        this.particles.spawnRing(ring.x, ring.y);
        Audio.sfx.ring();
      }
    }

    // ---- Checkpoints ----
    for (const cp of this.checkpoints) {
      const py = this.player;
      if (!cp.active && MathUtils.rectOverlap(py.x, py.y, py.w, py.h, cp.x - 12, cp.y - CHECKPOINT_H, CHECKPOINT_W, CHECKPOINT_H)) {
        cp.active = true;
        this.checkpointX = cp.x;
        this.checkpointY = cp.y - this.player.h - 4;
        this.showMessage('CHECKPOINT!', 90);
        Audio.sfx.checkpoint();
        GameState.score += 50;
      }
    }

    // ---- Stage transition ----
    if (this.stageTransition) {
      this.transitionTimer--;
      if (this.transitionTimer <= 0) {
        this.stageTransition = false;
        const next = GameState.currentLevel + 1;
        if (next >= 4) {
          this.handleVictory();
        } else {
          GameState.currentLevel = next;
          GameState.addScore({ level: GameState.currentLevel - 1, score: GameState.score });
          this.loadLevel(next);
        }
      }
    }

    // ---- Player dead ----
    if (this.player.dead && !this._deathHandled) {
      this._deathHandled = true;
      setTimeout(() => {
        this._deathHandled = false;
        GameState.lives--;
        if (GameState.lives <= 0) {
          this.handleGameOver();
        } else {
          // Respawn at checkpoint or start
          const ld2 = this.currentLevelData;
          const rx  = this.checkpointX || ld2.playerStart.x;
          const ry  = this.checkpointY || ld2.playerStart.y;
          this.player = new Player(rx, ry);
          this.updateHUD();
        }
      }, 1200);
    }

    // ---- Camera ----
    const targetX = this.player.x - CANVAS_W / 3;
    const targetY = Math.max(0, this.player.y - CANVAS_H / 2);
    this.camX = MathUtils.lerp(this.camX, targetX, 0.1);
    this.camY = MathUtils.lerp(this.camY, targetY, 0.07);
    this.camX = MathUtils.clamp(this.camX, 0, ld.width - CANVAS_W);
    this.camY = MathUtils.clamp(this.camY, 0, Math.max(0, ld.height - CANVAS_H));

    // ---- Particles ----
    this.particles.update();

    // Dash trail
    if (this.player.dashing && this.frame % 3 === 0) {
      this.particles.spawnDash(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.dir);
    }

    // ---- Message timer ----
    if (this.messageTimer > 0) {
      this.messageTimer--;
      if (this.messageTimer <= 0) {
        document.getElementById('game-message').classList.add('hidden');
      }
    }

    // ---- Update HUD ----
    this.updateHUD();
  },

  draw() {
    const ctx = this.ctx;
    const ld  = this.currentLevelData;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // ---- Background ----
    Renderer.drawBackground(ctx, CANVAS_W, CANVAS_H, ld.theme, this.frame, this.camX);

    // ---- Lava floor ----
    if (ld.lavaFloor) {
      Renderer.drawLava(ctx, -this.camX, CANVAS_H - 30 - this.camY, ld.width, this.frame);
    }

    // ---- Platforms ----
    for (const plat of ld.platforms) {
      const px = plat.x - this.camX;
      const py = plat.y - this.camY;
      if (px + plat.w < 0 || px > CANVAS_W) continue;
      Renderer.drawPlatform(ctx, px, py, plat.w, plat.h, ld.theme);
      // Ice sheen
      if (plat.ice) {
        ctx.fillStyle = 'rgba(180,230,255,0.25)';
        ctx.fillRect(px, py, plat.w, 5);
      }
    }

    // ---- Checkpoints ----
    for (const cp of this.checkpoints) {
      Renderer.drawCheckpoint(ctx, cp.x - this.camX, cp.y - this.camY, cp.active, this.frame);
    }

    // ---- Rings ----
    for (const ring of this.rings) {
      if (ring.collected) continue;
      const rx = ring.x - this.camX;
      const ry = ring.y - this.camY;
      if (rx < -20 || rx > CANVAS_W + 20) continue;
      Renderer.drawRing(ctx, rx, ry, RING_RADIUS, this.frame);
    }

    // ---- Enemies ----
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const ex = e.x - this.camX;
      if (ex < -80 || ex > CANVAS_W + 80) continue;
      e.draw(ctx, this.camX, this.camY);
    }

    // ---- Boss ----
    if (this.boss && this.boss.alive) {
      this.boss.draw(ctx, this.camX, this.camY);
    }

    // ---- Player ----
    if (this.player) {
      this.player.draw(ctx, this.camX, this.camY);
    }

    // ---- Particles ----
    this.particles.draw(ctx, this.camX, this.camY);

    // ---- Goal marker (end of level) ----
    if (this.bossDefeated) {
      const gx = ld.goalX - this.camX;
      ctx.save();
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.fillRect(gx - 4, 0, 8, CANVAS_H);
      // Animated text above
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('→ PRÓXIMA FASE', gx, 200);
      ctx.restore();
    }

    // ---- Transition overlay ----
    if (this.stageTransition) {
      const alpha = 1 - (this.transitionTimer / 180);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // ---- Death overlay ----
    if (this.player && this.player.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ff2244';
      ctx.font = '20px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('VOCÊ MORREU', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText(`Vidas: ${GameState.lives - 1}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
    }
  },

  handleGameOver() {
    this.stopGame();
    document.getElementById('go-score').textContent = GameState.score;
    document.getElementById('go-rings').textContent = GameState.rings;
    GameState.addScore({ level: GameState.currentLevel, score: GameState.score });
    this.showScreen('gameover-screen');
    Audio.playBGM('gameover');
  },

  handleVictory() {
    this.stopGame();
    GameState.totalTime += this.levelTimer;
    const secs = Math.floor(GameState.totalTime / 60);
    const mins = Math.floor(secs / 60);
    const s    = secs % 60;
    document.getElementById('v-score').textContent = GameState.score;
    document.getElementById('v-rings').textContent = GameState.rings;
    document.getElementById('v-time').textContent  = `${mins}:${s.toString().padStart(2,'0')}`;
    GameState.addScore({ level: 4, score: GameState.score });
    this.showScreen('victory-screen');
    Audio.sfx.victory();
  }
};

// ---- Boot ----
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});