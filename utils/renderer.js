// ============================================================
// RENDERER — pixel-art style drawing helpers
// ============================================================

const Renderer = {
  // Draw a pixelated character (Blaze)
  drawPlayer(ctx, x, y, w, h, state, dir, frame, invTimer) {
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Flicker when invincible
    if (invTimer > 0 && Math.floor(invTimer / 4) % 2 === 0) return;

    ctx.save();
    if (dir < 0) {
      ctx.translate(px + w / 2, py + h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-w / 2, -h / 2);
    } else {
      ctx.translate(px, py);
    }

    const bobY = state === 'run' ? Math.sin(frame * 0.5) * 1.5 : 0;

    // Body
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(4, 8 + bobY, 16, 14);

    // Head
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(2, 0 + bobY, 20, 12);

    // Eyes
    ctx.fillStyle = '#001133';
    ctx.fillRect(14, 2 + bobY, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 2 + bobY, 2, 2);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(12, 2 + bobY, 2, 2);

    // Spikes / hair
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(0, 0 + bobY, 4, 6);
    ctx.fillRect(2, -2 + bobY, 4, 4);
    ctx.fillRect(6, -4 + bobY, 4, 5);

    // Legs
    const legOff = state === 'run' ? Math.sin(frame * 0.5) * 4 : 0;
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(4, 22 + bobY, 7, 6);
    ctx.fillRect(13, 22 - legOff + bobY, 7, 6);

    // Shoes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 27 + bobY, 10, 5);
    ctx.fillRect(11, 27 - legOff + bobY, 10, 5);
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(2, 30 + bobY, 10, 2);
    ctx.fillRect(11, 30 - legOff + bobY, 10, 2);

    // Jump pose
    if (state === 'jump' || state === 'djump') {
      ctx.fillStyle = '#cc4400';
      ctx.fillRect(2, 20, 9, 5);
      ctx.fillRect(13, 17, 9, 5);
    }

    // Dash glow
    if (state === 'dash') {
      ctx.fillStyle = 'rgba(255, 150, 0, 0.4)';
      ctx.fillRect(-4, -2, 32, 36);
    }

    ctx.restore();
  },

  drawRing(ctx, x, y, r, frame) {
    const pulse = 0.8 + Math.sin(frame * 0.1) * 0.2;
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(x, y, r * pulse, r * 0.5 * pulse, frame * 0.05, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawCheckpoint(ctx, x, y, active, frame) {
    const color = active ? '#00ff88' : '#888888';
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - 40, 4, 40);
    // Flag
    ctx.fillStyle = active ? '#00ff44' : '#555';
    ctx.fillRect(x + 2, y - 40, 20, 12);
    if (active) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.fillRect(x - 2, y - 40, 4, 40);
      ctx.shadowBlur = 0;
    }
  },

  drawPlatform(ctx, x, y, w, h, theme) {
    const styles = {
      forest: { top: '#5d8a4a', mid: '#7a5c3c', bot: '#5a4020' },
      cave:   { top: '#6688aa', mid: '#445566', bot: '#334455' },
      ice:    { top: '#aaddff', mid: '#88bbdd', bot: '#6699bb' },
      lava:   { top: '#cc4400', mid: '#882200', bot: '#661100' }
    };
    const s = styles[theme] || styles.forest;
    ctx.fillStyle = s.bot;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = s.mid;
    ctx.fillRect(x, y, w, h - 4);
    ctx.fillStyle = s.top;
    ctx.fillRect(x, y, w, 6);
    // details
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < w; i += 16) ctx.fillRect(x + i, y + 1, 8, 2);
  },

  drawBackground(ctx, W, H, theme, frame, camX) {
    const parallax1 = camX * 0.2;
    const parallax2 = camX * 0.5;

    if (theme === 'forest') {
      // Sky gradient
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#2d6a4f');
      grd.addColorStop(1, '#74c69d');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      [[100, 60, 60, 25], [300, 40, 80, 20], [600, 70, 50, 22]].forEach(([cx, cy, cw, ch]) => {
        const bx = ((cx - parallax1) % (W + 200) + W + 200) % (W + 200) - 100;
        ctx.beginPath();
        ctx.ellipse(bx, cy, cw, ch, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // Trees BG
      ctx.fillStyle = '#1b4332';
      for (let i = 0; i < 8; i++) {
        const tx = ((i * 130 - parallax2 * 0.5) % (W + 80) + W + 80) % (W + 80) - 40;
        ctx.fillRect(tx - 6, H - 200, 12, 160);
        ctx.beginPath();
        ctx.moveTo(tx, H - 340); ctx.lineTo(tx - 40, H - 200); ctx.lineTo(tx + 40, H - 200);
        ctx.fill();
      }
    } else if (theme === 'cave') {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#0a0a1a');
      grd.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // Crystals
      ctx.fillStyle = 'rgba(100,150,255,0.3)';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 170 - parallax1) % (W + 100) + W + 100) % (W + 100) - 50;
        ctx.beginPath();
        ctx.moveTo(cx, H - 60); ctx.lineTo(cx - 12, H); ctx.lineTo(cx + 12, H);
        ctx.fill();
      }
      // Glowing dots
      for (let i = 0; i < 20; i++) {
        const gx = ((i * 50 - parallax1 * 0.3) % W + W) % W;
        const gy = 30 + (i * 73) % (H - 60);
        const pulse = 0.5 + Math.sin(frame * 0.05 + i) * 0.3;
        ctx.fillStyle = `rgba(100,200,255,${pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(gx, gy, 2 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'ice') {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#c8e6ff');
      grd.addColorStop(1, '#8ab4d4');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // Snow mountains
      ctx.fillStyle = '#e8f4ff';
      for (let i = 0; i < 4; i++) {
        const mx = ((i * 250 - parallax1) % (W + 200) + W + 200) % (W + 200) - 100;
        ctx.beginPath();
        ctx.moveTo(mx, H - 180); ctx.lineTo(mx - 100, H); ctx.lineTo(mx + 100, H);
        ctx.fill();
      }
      // Snow particles
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 31 - frame * 0.5 - parallax1 * 0.1) % W + W) % W;
        const sy = ((i * 47 + frame * 0.5) % H + H) % H;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'lava') {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#1a0000');
      grd.addColorStop(0.6, '#3a0800');
      grd.addColorStop(1, '#5a1000');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // Lava glow at bottom
      const lavGrd = ctx.createLinearGradient(0, H - 80, 0, H);
      lavGrd.addColorStop(0, 'rgba(255,80,0,0)');
      lavGrd.addColorStop(1, 'rgba(255,80,0,0.5)');
      ctx.fillStyle = lavGrd;
      ctx.fillRect(0, H - 80, W, 80);
      // Embers
      for (let i = 0; i < 15; i++) {
        const ex = ((i * 67 - parallax1 * 0.2) % W + W) % W;
        const ey = H - 20 - ((frame * 0.5 + i * 40) % (H - 40));
        const fade = 0.3 + Math.sin(frame * 0.1 + i) * 0.3;
        ctx.fillStyle = `rgba(255,${100 + i * 10},0,${fade})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // Lava animated floor strip
  drawLava(ctx, x, y, w, frame) {
    const g = ctx.createLinearGradient(0, y, 0, y + 20);
    g.addColorStop(0, '#ff6600');
    g.addColorStop(1, '#cc2200');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, 20);
    // Animated ripple
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    for (let i = 0; i < w; i += 20) {
      const h = 4 + Math.sin(frame * 0.1 + i * 0.1) * 3;
      ctx.fillRect(x + i, y, 10, h);
    }
  }
};