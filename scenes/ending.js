// ============================================================
// ENDING ANIMATION — Blaze salva a princesa no castelo de fava
// Cenas: chegada → resgate → beijo → viagem para casa → créditos
// ============================================================

const Ending = (() => {

  // ---- estado interno ----
  let canvas, ctx, raf, t, scene, sceneT, done;
  let hearts = [];
  let fireParticles = [];
  let stars = [];
  let cloudX = 0;
  let onDone = null; // callback chamado quando acabar

  // paleta de cores reutilizável
  const C = {
    sky1: '#0a0a2a', sky2: '#1a0a3a',
    skyDay1: '#87ceeb', skyDay2: '#d4f0ff',
    sunset1: '#ff6b35', sunset2: '#ffd700',
    ground: '#2d5016', groundDark: '#1a2e0a',
    castle: '#4a3728', castleDark: '#2d1f15',
    lava: '#ff4400', lavaBright: '#ff8800',
    hero: '#ff6600', heroDark: '#cc4400',
    princess: '#ff69b4', princessLight: '#ffb6c1',
    heart: '#ff1493',
    white: '#ffffff',
    gold: '#ffd700',
    treeGreen: '#2d5016', treeDark: '#1a3009',
    houseBrown: '#8b6914', houseRoof: '#cc3300',
    cloud: 'rgba(255,255,255,0.85)',
  };

  // ---- CENAS ----
  // 0: Castelo de lava ao fundo, Blaze corre em direção
  // 1: Blaze derruba a porta, entra
  // 2: Resgata a princesa (ela aparece, ele a segura)
  // 3: Saem juntos do castelo enquanto ele explode
  // 4: Campo aberto, beijo, corações flutuando
  // 5: Caminham de mãos dadas em direção ao sol poente
  // 6: Chegam em casa aconchegante
  // 7: Créditos finais pixel art
  const SCENE_DURATION = [220, 160, 200, 220, 300, 280, 260, 300];

  function init(c, callback) {
    canvas   = c;
    ctx      = canvas.getContext('2d');
    t        = 0;
    scene    = 0;
    sceneT   = 0;
    done     = false;
    onDone   = callback || (() => {});
    hearts   = [];
    fireParticles = [];
    stars    = initStars();
    cloudX   = 0;
  }

  function initStars() {
    const s = [];
    for (let i = 0; i < 80; i++) {
      s.push({
        x: Math.random() * 960,
        y: Math.random() * 300,
        r: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2
      });
    }
    return s;
  }

  function spawnHeart(x, y) {
    hearts.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 1.5 + 1),
      life: 1,
      size: Math.random() * 10 + 8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.08 + 0.04,
    });
  }

  function spawnFire(x, y) {
    for (let i = 0; i < 3; i++) {
      fireParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 3 + 1),
        life: 1,
        size: Math.random() * 12 + 4,
        hue: Math.random() * 40, // 0=red, 40=orange
      });
    }
  }

  // ---- update ----
  function update() {
    t++;
    sceneT++;
    cloudX += 0.3;

    // avança de cena
    if (sceneT >= SCENE_DURATION[scene]) {
      scene++;
      sceneT = 0;
      hearts = [];
      if (scene >= SCENE_DURATION.length) {
        done = true;
        return;
      }
    }

    // corações na cena do beijo
    if (scene === 4 && t % 18 === 0) {
      spawnHeart(480 + (Math.random() - 0.5) * 80, 280);
    }
    // corações ao caminhar
    if (scene === 5 && t % 30 === 0) {
      spawnHeart(420 + Math.random() * 80, 300);
    }

    // fogo no castelo
    if (scene <= 3) {
      spawnFire(600 + Math.random() * 160, 120 + Math.random() * 80);
      spawnFire(580 + Math.random() * 20,  60 + Math.random() * 40);
    }

    // partículas de fogo
    for (let i = fireParticles.length - 1; i >= 0; i--) {
      const f = fireParticles[i];
      f.x   += f.vx;
      f.y   += f.vy;
      f.life -= 0.035;
      if (f.life <= 0) fireParticles.splice(i, 1);
    }

    // corações
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.x   += h.vx + Math.sin(h.wobble) * 0.5;
      h.y   += h.vy;
      h.wobble += h.wobbleSpeed;
      h.life   -= 0.008;
      if (h.life <= 0) hearts.splice(i, 1);
    }
  }

  // ---- draw ----
  function draw() {
    const W = 960, H = 540;
    ctx.clearRect(0, 0, W, H);

    const p = Math.min(sceneT / SCENE_DURATION[scene], 1); // progresso 0..1 da cena

    switch (scene) {
      case 0: drawScene0(W, H, p); break;
      case 1: drawScene1(W, H, p); break;
      case 2: drawScene2(W, H, p); break;
      case 3: drawScene3(W, H, p); break;
      case 4: drawScene4(W, H, p); break;
      case 5: drawScene5(W, H, p); break;
      case 6: drawScene6(W, H, p); break;
      case 7: drawScene7(W, H, p); break;
    }

    // fade in no início de cada cena
    if (sceneT < 30) {
      ctx.fillStyle = `rgba(0,0,0,${1 - sceneT / 30})`;
      ctx.fillRect(0, 0, W, H);
    }
    // fade out no final
    if (sceneT > SCENE_DURATION[scene] - 30) {
      const fadeP = (sceneT - (SCENE_DURATION[scene] - 30)) / 30;
      ctx.fillStyle = `rgba(0,0,0,${fadeP})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ============================================================
  // CENA 0 — Castelo ao fundo, Blaze chega correndo
  // ============================================================
  function drawScene0(W, H, p) {
    // Céu noturno avermelhado pelo vulcão
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0010');
    sky.addColorStop(0.6, '#2a0810');
    sky.addColorStop(1,   '#5a1a00');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(0.7);
    drawLavaGlow(W, H);
    drawCastle(W, H, 0);
    drawFireParticles();
    drawLavaRiver(W, H);
    drawGroundDark(W, H);

    // Blaze vem correndo da esquerda
    const bx = -60 + p * 380;
    drawBlaze(bx, H - 140, 1, 'run', t);

    // Texto narrativo
    drawSubtitle('Blaze chegou ao castelo do inimigo...', p, W, H);
  }

  // ============================================================
  // CENA 1 — Blaze derruba a porta e entra
  // ============================================================
  function drawScene1(W, H, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0010');
    sky.addColorStop(1, '#3a0800');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawLavaGlow(W, H);
    drawCastle(W, H, 0);
    drawFireParticles();
    drawLavaRiver(W, H);
    drawGroundDark(W, H);

    // Blaze parado na porta, chutando
    const kick = Math.sin(t * 0.3) * (p < 0.5 ? 1 : 0);
    drawBlaze(300, H - 140, 1, p < 0.5 ? 'run' : 'idle', t);

    // Porta sendo destruída
    if (p > 0.4) {
      const shards = Math.floor((p - 0.4) / 0.6 * 8);
      ctx.fillStyle = '#5a3010';
      for (let i = 0; i < shards; i++) {
        const sx = 540 + Math.cos(i * 1.2) * (p - 0.4) * 120;
        const sy = H - 180 + Math.sin(i * 0.9) * (p - 0.4) * 80;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(i * 0.5 + p * 3);
        ctx.fillRect(-8, -5, 16, 10);
        ctx.restore();
      }
      // Flash de impacto
      if (p > 0.38 && p < 0.5) {
        ctx.fillStyle = `rgba(255,200,0,${(0.5 - p) * 4})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // Efeito de luz saindo da porta aberta
    if (p > 0.5) {
      const g = ctx.createRadialGradient(545, H - 160, 0, 545, H - 160, 120);
      g.addColorStop(0, `rgba(255,180,0,${(p - 0.5) * 0.6})`);
      g.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    drawSubtitle('Ele destruiu a porta sem hesitar!', p, W, H);
  }

  // ============================================================
  // CENA 2 — Interior do castelo, Blaze encontra a princesa
  // ============================================================
  function drawScene2(W, H, p) {
    // Interior escuro
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0005');
    bg.addColorStop(1, '#1a0510');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Paredes do castelo
    ctx.fillStyle = '#2a1810';
    ctx.fillRect(0, H - 120, W, 120);
    ctx.fillStyle = '#1a0c08';
    ctx.fillRect(0, H - 125, W, 8);

    // Tochas na parede
    drawTorch(200, H - 200);
    drawTorch(760, H - 200);

    // Gaiola / prisão onde a princesa está
    if (p < 0.4) {
      drawCage(550, H - 200);
      drawPrincess(560, H - 185, false, t);
    }

    // Blaze entra correndo
    const bx = p < 0.3 ? -60 + (p / 0.3) * 340 : 280;
    drawBlaze(bx, H - 135, 1, p < 0.3 ? 'run' : 'idle', t);

    // Blaze quebra a gaiola
    if (p > 0.4 && p < 0.6) {
      const breakP = (p - 0.4) / 0.2;
      // barras voando
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 4;
        ctx.save();
        ctx.translate(550 + Math.cos(i) * breakP * 80, H - 160 + Math.sin(i * 1.3) * breakP * 60);
        ctx.rotate(breakP * i);
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.restore();
      }
      // Flash
      ctx.fillStyle = `rgba(255,255,100,${(0.2 - Math.abs(p - 0.5)) * 3})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Princesa livre, Blaze a abraça
    if (p >= 0.6) {
      const meetP = Math.min((p - 0.6) / 0.3, 1);
      drawPrincess(500 + meetP * 40, H - 185, true, t);
      drawBlaze(280 + meetP * 180, H - 135, 1, meetP < 1 ? 'run' : 'idle', t);
      if (meetP >= 1) {
        // pequeno coração acima
        spawnHeartOnce(490, H - 220, 'scene2');
        drawSmallHearts(480, H - 230, p);
      }
    }

    drawSubtitle(p < 0.6 ? 'A princesa estava aprisionada!' : 'Blaze a libertou!', p, W, H);
  }

  // ============================================================
  // CENA 3 — Saem do castelo explodindo
  // ============================================================
  function drawScene3(W, H, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0010');
    sky.addColorStop(1, `hsl(${10 + p * 20}, 80%, ${5 + p * 10}%)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(1 - p * 0.5);

    // Castelo explodindo
    const shake = p > 0.3 ? Math.sin(t * 0.8) * (p - 0.3) * 8 : 0;
    ctx.save();
    ctx.translate(shake, 0);
    drawCastle(W, H, p * 0.5);
    ctx.restore();

    // Explosões no castelo
    if (p > 0.3) {
      for (let i = 0; i < 5; i++) {
        const ep = (p - 0.3) / 0.7;
        const ex = 500 + Math.cos(i * 1.4 + t * 0.1) * 120;
        const ey = 80 + Math.sin(i * 0.9) * 60;
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 30 * ep);
        g.addColorStop(0, `rgba(255,255,100,${ep * 0.9})`);
        g.addColorStop(0.5, `rgba(255,80,0,${ep * 0.6})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ex, ey, 30 * ep, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawFireParticles();
    drawLavaRiver(W, H);
    drawGroundDark(W, H);

    // Blaze carrega a princesa no colo correndo
    const runX = p * 520 + 50;
    drawBlaze(runX, H - 140, 1, 'run', t);
    drawPrincessCarried(runX + 10, H - 175, t);

    // Debris caindo
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#5a3010';
      ctx.save();
      ctx.translate(
        (540 + i * 40 - p * 200 * (i % 3 + 1) * 0.3),
        H - 300 + p * 200 * (i % 4 + 1) * 0.5
      );
      ctx.rotate(t * 0.05 * (i % 2 === 0 ? 1 : -1));
      ctx.fillRect(-6, -4, 12, 8);
      ctx.restore();
    }

    drawSubtitle('Eles fugiram enquanto o castelo desmoronava!', p, W, H);
  }

  // ============================================================
  // CENA 4 — Campo aberto, beijo, corações
  // ============================================================
  function drawScene4(W, H, p) {
    // Amanhecer / aurora
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, `hsl(220, 60%, ${20 + p * 30}%)`);
    sky.addColorStop(0.5, `hsl(${200 + p * 60}, 70%, ${40 + p * 20}%)`);
    sky.addColorStop(1, `hsl(${30 + p * 30}, 90%, ${60 + p * 10}%)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(Math.max(0, 0.6 - p * 1.5));
    drawClouds(W, H, cloudX, 0.6 + p * 0.4);
    drawSun(W, H, p * 0.4); // sol nascendo
    drawGreenGround(W, H);
    drawTrees(W, H, cloudX * 0.3);

    // Flores no chão
    drawFlowers(W, H);

    // Os dois juntos parados
    const bx = 400, by = H - 135;
    const px2 = 450, py2 = H - 180;

    drawBlaze(bx, by, 1, 'idle', t);
    drawPrincess(px2, py2, true, t);

    // Beijo — aproximação
    if (p > 0.3) {
      const kissP = Math.min((p - 0.3) / 0.2, 1);
      // leve inclinação / aproximação
      drawBlazeKiss(bx + kissP * 20, by, kissP);
    }

    // Corações flutuando
    drawHearts();

    // Brilhos ao redor
    if (p > 0.3) {
      for (let i = 0; i < 6; i++) {
        const a = t * 0.03 + (i / 6) * Math.PI * 2;
        const r = 80 + Math.sin(t * 0.05 + i) * 20;
        ctx.fillStyle = `rgba(255,200,200,${0.3 + Math.sin(t * 0.08 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(430 + Math.cos(a) * r, H - 180 + Math.sin(a) * r * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawSubtitle(p < 0.5 ? 'Finalmente, juntos e em paz...' : '💋 O amor que venceu tudo! 💋', p, W, H);
  }

  // ============================================================
  // CENA 5 — Caminham de mãos dadas em direção ao sol poente
  // ============================================================
  function drawScene5(W, H, p) {
    // Pôr do sol dourado
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a1060');
    sky.addColorStop(0.3, '#ff6b35');
    sky.addColorStop(0.6, '#ffd700');
    sky.addColorStop(1, '#ff8c00');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Sol grande e dourado
    const sunY = H - 180 - p * 40;
    const gSun = ctx.createRadialGradient(W / 2, sunY, 0, W / 2, sunY, 120);
    gSun.addColorStop(0, 'rgba(255,255,200,1)');
    gSun.addColorStop(0.4, 'rgba(255,220,0,0.9)');
    gSun.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = gSun;
    ctx.beginPath();
    ctx.arc(W / 2, sunY, 120, 0, Math.PI * 2);
    ctx.fill();

    drawClouds(W, H, cloudX * 0.5, 0.8);
    drawGreenGround(W, H);
    drawTrees(W, H, cloudX * 0.2);

    // Silhuetas caminhando em direção ao sol
    const walkX = 200 + p * 260;
    drawSilhouetteCouple(walkX, H - 100, p);

    // Rastro de pegadas
    for (let i = 0; i < Math.floor(p * 20); i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.15 - i * 0.007})`;
      ctx.beginPath();
      ctx.ellipse(180 + i * 14, H - 75, 5, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHearts();
    drawSubtitle('De mãos dadas, rumo a um novo amanhecer...', p, W, H);
  }

  // ============================================================
  // CENA 6 — Chegam em casa aconchegante
  // ============================================================
  function drawScene6(W, H, p) {
    // Noite estrelada tranquila
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#000520');
    sky.addColorStop(1, '#0a1040');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(1);
    drawMoon(W, H);
    drawClouds(W, H, cloudX * 0.2, 0.3);

    // Colinas suaves
    ctx.fillStyle = '#1a3009';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.quadraticCurveTo(250, H - 80, 500, H - 40);
    ctx.quadraticCurveTo(750, H - 90, W, H - 50);
    ctx.lineTo(W, H);
    ctx.fill();

    // Casa aconchegante
    drawCozyHouse(W, H, p);

    // Os dois chegando
    const arriveX = p < 0.6 ? 100 + (p / 0.6) * 380 : 480;
    const arriveState = p < 0.6 ? 'run' : 'idle';
    drawBlaze(arriveX, H - 115, 1, arriveState, t);
    drawPrincess(arriveX + 40, H - 150, true, t);

    // Luz quente saindo da janela da casa
    if (p > 0.4) {
      const g = ctx.createRadialGradient(680, H - 130, 0, 680, H - 130, 150);
      g.addColorStop(0, `rgba(255,200,80,${(p - 0.4) * 0.4})`);
      g.addColorStop(1, 'rgba(255,150,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Fumaça saindo da chaminé
    if (p > 0.5) {
      drawSmoke(690, H - 240, p);
    }

    drawHearts();
    drawSubtitle(p < 0.6 ? 'Finalmente, chegaram em casa...' : 'Eles viveram felizes para sempre! 🏠❤️', p, W, H);
  }

  // ============================================================
  // CENA 7 — Créditos finais com pixel art
  // ============================================================
  function drawScene7(W, H, p) {
    // Fundo gradiente animado
    const sky = ctx.createLinearGradient(0, 0, W, H);
    sky.addColorStop(0, `hsl(${220 + t * 0.2}, 70%, 10%)`);
    sky.addColorStop(1, `hsl(${280 + t * 0.2}, 70%, 5%)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(1);

    // Partículas de brilho
    for (let i = 0; i < 12; i++) {
      const a = t * 0.01 + (i / 12) * Math.PI * 2;
      const r = 180 + Math.sin(t * 0.02 + i) * 40;
      const alpha = 0.2 + Math.sin(t * 0.04 + i) * 0.15;
      ctx.fillStyle = `rgba(255,200,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r * 0.6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blaze e princesa pixelados centralizados
    ctx.save();
    const scale = 2 + Math.sin(t * 0.03) * 0.05;
    ctx.translate(W / 2 - 40, H / 2 - 60);
    ctx.scale(scale, scale);
    drawBlaze(0, 0, 1, 'idle', t);
    ctx.restore();

    ctx.save();
    ctx.translate(W / 2 + 10, H / 2 - 80);
    ctx.scale(scale, scale);
    drawPrincess(0, 0, true, t);
    ctx.restore();

    // Coração pulsando entre eles
    const heartSize = 20 + Math.sin(t * 0.08) * 5;
    drawBigHeart(W / 2 + 40, H / 2 - 80, heartSize);

    // Título
    ctx.save();
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.gold;
    ctx.shadowColor = C.gold;
    ctx.shadowBlur = 20;
    const titleAlpha = Math.min(p * 4, 1);
    ctx.globalAlpha = titleAlpha;
    ctx.fillText('BLAZEDASH', W / 2, 80);
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff99cc';
    ctx.shadowColor = '#ff99cc';
    ctx.fillText('Uma história de coragem e amor', W / 2, 115);
    ctx.restore();

    // Créditos rolando
    const credits = [
      { label: 'Herói',       value: 'BLAZE' },
      { label: 'Princesa',    value: 'AURORA' },
      { label: 'Vilão',       value: 'LAVA DEMON' },
      { label: 'Criado com',  value: 'HTML + JS + ❤️' },
    ];
    credits.forEach((c, i) => {
      const y = 380 + i * 34;
      const alpha = Math.min(Math.max((p * 7 - i * 0.8), 0), 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(200,200,255,0.7)';
      ctx.fillText(c.label + ':', W / 2 - 10, y);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(c.value, W / 2 + 10, y);
      ctx.restore();
    });

    // FIM — aparece perto do final
    if (p > 0.7) {
      const endAlpha = (p - 0.7) / 0.3;
      ctx.save();
      ctx.globalAlpha = endAlpha;
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.shadowColor = C.white;
      ctx.shadowBlur = 15;
      ctx.fillText('★  FIM  ★', W / 2, H - 60);
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Obrigado por jogar!', W / 2, H - 30);
      ctx.restore();
    }

    // Corações decorativos finais
    if (t % 25 === 0 && p > 0.2) {
      spawnHeart(Math.random() * W, H - 50);
    }
    drawHearts();
  }

  // ============================================================
  // DRAWERS — sub-rotinas de desenho
  // ============================================================

  function drawStars(alpha) {
    for (const s of stars) {
      const tw = 0.5 + Math.sin(t * 0.04 + s.twinkle) * 0.5;
      ctx.fillStyle = `rgba(255,255,255,${tw * alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMoon(W, H) {
    ctx.fillStyle = '#fffde0';
    ctx.shadowColor = '#fffde0';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(820, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    // cratera
    ctx.fillStyle = '#ede8b0';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(808, 68, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(832, 82, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLavaGlow(W, H) {
    const g = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 400);
    g.addColorStop(0, 'rgba(255,80,0,0.4)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCastle(W, H, destroyP) {
    const cx = 520, cy = H - 130;
    const shake = destroyP > 0 ? Math.sin(t * 0.6) * destroyP * 6 : 0;

    ctx.save();
    ctx.translate(shake, 0);

    // Torre principal
    ctx.fillStyle = destroyP > 0.3 ? '#3a2018' : C.castle;
    ctx.fillRect(cx - 60, cy - 160, 120, 160);

    // Torres laterais
    ctx.fillRect(cx - 100, cy - 120, 50, 120);
    ctx.fillRect(cx + 50, cy - 120, 50, 120);

    // Ameias
    ctx.fillStyle = destroyP > 0.3 ? '#2a1510' : C.castleDark;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx - 55 + i * 28, cy - 175, 18, 20);
    }
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(cx - 98 + i * 22, cy - 135, 14, 16);
      ctx.fillRect(cx + 52 + i * 22, cy - 135, 14, 16);
    }

    // Janelas com luz
    const winGlow = `rgba(255,${150 - destroyP * 50},0,${0.8 - destroyP * 0.5})`;
    ctx.fillStyle = winGlow;
    ctx.fillRect(cx - 14, cy - 140, 28, 32);
    ctx.fillRect(cx - 88, cy - 100, 18, 22);
    ctx.fillRect(cx + 70, cy - 100, 18, 22);

    // Cruz de luz na janela
    ctx.fillStyle = 'rgba(255,255,100,0.4)';
    ctx.fillRect(cx - 2, cy - 140, 4, 32);
    ctx.fillRect(cx - 14, cy - 128, 28, 4);

    // Porta
    ctx.fillStyle = '#1a0c06';
    ctx.fillRect(cx - 16, cy - 55, 32, 55);
    ctx.beginPath();
    ctx.arc(cx, cy - 55, 16, Math.PI, 0);
    ctx.fill();

    // Rachaduras se destruindo
    if (destroyP > 0.2) {
      ctx.strokeStyle = `rgba(0,0,0,${destroyP * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 160);
      ctx.lineTo(cx - 10, cy - 100);
      ctx.lineTo(cx + 20, cy - 80);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy - 140);
      ctx.lineTo(cx + 10, cy - 90);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawFireParticles() {
    for (const f of fireParticles) {
      const r = Math.floor(255 * f.life);
      const g = Math.floor(f.hue * 3 * f.life);
      ctx.fillStyle = `rgba(${r},${g},0,${f.life * 0.8})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * f.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLavaRiver(W, H) {
    const g = ctx.createLinearGradient(0, H - 30, 0, H);
    g.addColorStop(0, '#ff4400');
    g.addColorStop(1, '#cc2200');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 30, W, 30);
    // brilho animado
    ctx.fillStyle = 'rgba(255,180,0,0.3)';
    for (let i = 0; i < W; i += 40) {
      const wave = Math.sin(t * 0.08 + i * 0.05) * 6;
      ctx.fillRect(i, H - 30 + wave, 20, 8);
    }
  }

  function drawGroundDark(W, H) {
    ctx.fillStyle = '#1a0c06';
    ctx.fillRect(0, H - 30, W, 30);
  }

  function drawGreenGround(W, H) {
    // Chão com gradiente
    const g = ctx.createLinearGradient(0, H - 80, 0, H);
    g.addColorStop(0, '#3a6b20');
    g.addColorStop(0.3, '#2d5016');
    g.addColorStop(1, '#1a2e0a');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 80, W, 80);
    // linha de grama
    ctx.fillStyle = '#4a8a28';
    for (let i = 0; i < 960; i += 8) {
      const h = 4 + Math.sin(i * 0.3 + t * 0.02) * 3;
      ctx.fillRect(i, H - 80, 4, h);
    }
  }

  function drawTrees(W, H, offset) {
    const positions = [80, 180, 700, 820, 900];
    for (const bx of positions) {
      const tx = ((bx - offset) % (W + 100) + W + 100) % (W + 100) - 50;
      // tronco
      ctx.fillStyle = '#5a3010';
      ctx.fillRect(tx - 6, H - 130, 12, 55);
      // copa
      ctx.fillStyle = C.treeGreen;
      ctx.beginPath();
      ctx.moveTo(tx, H - 200); ctx.lineTo(tx - 35, H - 130); ctx.lineTo(tx + 35, H - 130);
      ctx.fill();
      ctx.fillStyle = '#3a8a1a';
      ctx.beginPath();
      ctx.moveTo(tx, H - 230); ctx.lineTo(tx - 28, H - 155); ctx.lineTo(tx + 28, H - 155);
      ctx.fill();
    }
  }

  function drawFlowers(W, H) {
    const flowerPos = [150, 250, 550, 650, 780, 850];
    for (const fx of flowerPos) {
      ctx.fillStyle = '#ff69b4';
      ctx.beginPath();
      ctx.arc(fx, H - 82, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx + 6, H - 85, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(fx + 3, H - 82, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawClouds(W, H, offset, alpha) {
    const cloudData = [[100, 80, 90], [350, 55, 70], [620, 70, 110], [830, 50, 80]];
    for (const [bx, cy2, cw] of cloudData) {
      const cx2 = ((bx + offset * 0.5) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, cw, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx2 - cw * 0.3, cy2 + 8, cw * 0.6, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx2 + cw * 0.3, cy2 + 5, cw * 0.5, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSun(W, H, p2) {
    const sy = H - 60 - p2 * 300;
    const g = ctx.createRadialGradient(W / 2, sy, 0, W / 2, sy, 80);
    g.addColorStop(0, 'rgba(255,255,200,0.95)');
    g.addColorStop(0.4, 'rgba(255,200,50,0.7)');
    g.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(W / 2, sy, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTorch(x, y) {
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(x - 3, y, 6, 20);
    ctx.fillStyle = '#8a5020';
    ctx.fillRect(x - 5, y - 5, 10, 8);
    // chama
    const flick = Math.sin(t * 0.2 + x) * 4;
    ctx.fillStyle = `rgba(255,${120 + flick * 5},0,0.9)`;
    ctx.beginPath();
    ctx.arc(x, y - 10 + flick * 0.5, 7, 0, Math.PI * 2);
    ctx.fill();
    // luz
    const g = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 60);
    g.addColorStop(0, 'rgba(255,150,0,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 60, y - 70, 120, 120);
  }

  function drawCage(x, y) {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    // barras verticais
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 14, y); ctx.lineTo(x + i * 14, y + 60);
      ctx.stroke();
    }
    // barras horizontais
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 56, y);
    ctx.moveTo(x, y + 60); ctx.lineTo(x + 56, y + 60);
    ctx.stroke();
  }

  function drawCozyHouse(W, H, p2) {
    const hx = 580, hy = H - 130;
    // Parede
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(hx, hy - 100, 160, 100);
    // Telhado
    ctx.fillStyle = '#cc3300';
    ctx.beginPath();
    ctx.moveTo(hx - 20, hy - 100);
    ctx.lineTo(hx + 80, hy - 175);
    ctx.lineTo(hx + 180, hy - 100);
    ctx.fill();
    // Porta
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(hx + 65, hy - 50, 30, 50);
    ctx.beginPath();
    ctx.arc(hx + 80, hy - 50, 15, Math.PI, 0);
    ctx.fill();
    // Janelas acesas
    ctx.fillStyle = '#ffdd80';
    ctx.fillRect(hx + 10, hy - 80, 30, 24);
    ctx.fillRect(hx + 118, hy - 80, 30, 24);
    // Luz da janela
    const winG = ctx.createRadialGradient(hx + 25, hy - 68, 0, hx + 25, hy - 68, 80);
    winG.addColorStop(0, `rgba(255,220,80,${0.4 * p2})`);
    winG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = winG;
    ctx.fillRect(hx - 60, hy - 150, 180, 180);
    // Chaminé
    ctx.fillStyle = '#664422';
    ctx.fillRect(hx + 100, hy - 190, 24, 50);
  }

  function drawSmoke(x, y, p2) {
    for (let i = 0; i < 4; i++) {
      const sy = y - i * 18 - ((t * 0.5) % 18);
      const alpha = (0.4 - i * 0.08) * p2;
      const size = 8 + i * 4;
      ctx.fillStyle = `rgba(180,180,180,${alpha})`;
      ctx.beginPath();
      ctx.arc(x + Math.sin(i + t * 0.02) * 8, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- Personagens ----

  function drawBlaze(x, y, dir, state, frame) {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.save();
    if (dir < 0) {
      ctx.translate(px + 12, py + 16); ctx.scale(-1, 1); ctx.translate(-12, -16);
    } else {
      ctx.translate(px, py);
    }
    const bob = state === 'run' ? Math.sin(frame * 0.4) * 2 : 0;
    // corpo
    ctx.fillStyle = '#ff6600'; ctx.fillRect(4, 8 + bob, 16, 14);
    // cabeça
    ctx.fillStyle = '#ff8833'; ctx.fillRect(2, bob, 20, 12);
    // olhos
    ctx.fillStyle = '#001133'; ctx.fillRect(14, 2 + bob, 4, 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(15, 2 + bob, 2, 2);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(12, 2 + bob, 2, 2);
    // espinhos
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(0, bob, 4, 6);
    ctx.fillRect(2, -2 + bob, 4, 4);
    ctx.fillRect(6, -4 + bob, 4, 5);
    // pernas
    const leg = state === 'run' ? Math.sin(frame * 0.4) * 5 : 0;
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(4, 22 + bob, 7, 6);
    ctx.fillRect(13, 22 - leg + bob, 7, 6);
    // sapatos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 27 + bob, 10, 5);
    ctx.fillRect(11, 27 - leg + bob, 10, 5);
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(2, 30 + bob, 10, 2);
    ctx.fillRect(11, 30 - leg + bob, 10, 2);
    ctx.restore();
  }

  function drawBlazeKiss(x, y, leanP) {
    // versão levemente inclinada
    ctx.save();
    ctx.translate(x + 12, y + 16);
    ctx.rotate(leanP * 0.3);
    ctx.translate(-12, -16);
    drawBlaze(0, 0, 1, 'idle', t);
    ctx.restore();
  }

  function drawPrincess(x, y, happy, frame) {
    const px = Math.floor(x), py = Math.floor(y);
    const bob = happy ? Math.sin(frame * 0.06) * 1.5 : 0;
    ctx.save();
    ctx.translate(px, py);
    // vestido
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(2, 14 + bob, 18, 18);
    // barra do vestido triangular
    ctx.beginPath();
    ctx.moveTo(2, 32 + bob); ctx.lineTo(-4, 42 + bob);
    ctx.lineTo(24, 42 + bob); ctx.lineTo(18, 32 + bob);
    ctx.fill();
    // corpo
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(4, 8 + bob, 14, 10);
    // cabeça
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(3, bob, 16, 12);
    // cabelo
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(1, -2 + bob, 20, 5);
    ctx.fillRect(1, -2 + bob, 4, 16);
    ctx.fillRect(17, -2 + bob, 4, 14);
    // tranças
    ctx.fillRect(-1, 5 + bob, 4, 20);
    ctx.fillRect(19, 5 + bob, 4, 18);
    // olhos
    ctx.fillStyle = '#4a2060';
    ctx.fillRect(6, 3 + bob, 3, 3);
    ctx.fillRect(13, 3 + bob, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3 + bob, 1, 1);
    ctx.fillRect(14, 3 + bob, 1, 1);
    // boca
    ctx.fillStyle = happy ? '#ff4488' : '#cc3366';
    ctx.fillRect(7, 8 + bob, 8, happy ? 3 : 2);
    // coroa
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(2, -6 + bob, 18, 5);
    ctx.fillRect(2, -10 + bob, 3, 6);
    ctx.fillRect(9, -12 + bob, 4, 8);
    ctx.fillRect(17, -10 + bob, 3, 6);
    // pérolas da coroa
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(4, -7 + bob, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -9 + bob, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, -7 + bob, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawPrincessCarried(x, y, frame) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.rotate(-0.4); // inclinada sendo carregada
    drawPrincess(0, 0, true, frame);
    ctx.restore();
  }

  function drawSilhouetteCouple(x, y, p2) {
    // silhuetas simples caminhando
    const bob = Math.sin(t * 0.15) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    // ele
    ctx.fillRect(x - 20, y - 60 + bob, 16, 35);
    ctx.beginPath(); ctx.arc(x - 12, y - 68 + bob, 10, 0, Math.PI * 2); ctx.fill();
    // ela (mais baixa)
    ctx.fillRect(x + 6, y - 50 + bob, 14, 28);
    ctx.beginPath(); ctx.arc(x + 13, y - 58 + bob, 8, 0, Math.PI * 2); ctx.fill();
    // vestido
    ctx.beginPath();
    ctx.moveTo(x + 5, y - 22 + bob);
    ctx.lineTo(x, y + bob);
    ctx.lineTo(x + 26, y + bob);
    ctx.lineTo(x + 21, y - 22 + bob);
    ctx.fill();
    // mãos dadas
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 35 + bob);
    ctx.lineTo(x + 8, y - 35 + bob);
    ctx.stroke();
  }

  // ---- UI de desenho ----

  function drawHearts() {
    for (const h of hearts) {
      ctx.save();
      ctx.globalAlpha = h.life;
      drawBigHeart(h.x, h.y, h.size * h.life);
      ctx.restore();
    }
  }

  function drawBigHeart(x, y, size) {
    ctx.save();
    ctx.fillStyle = C.heart;
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = size * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y - size * 0.3, x - size, y - size * 0.3, x - size, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y + size * 0.9, x, y + size * 1.3, x, y + size * 1.3);
    ctx.bezierCurveTo(x, y + size * 1.3, x + size, y + size * 0.9, x + size, y + size * 0.3);
    ctx.bezierCurveTo(x + size, y - size * 0.3, x, y - size * 0.3, x, y + size * 0.3);
    ctx.fill();
    ctx.restore();
  }

  function drawSmallHearts(x, y, p2) {
    for (let i = 0; i < 3; i++) {
      const hy2 = y - i * 14 - ((t * 0.3) % 14);
      const a = 0.7 - (i / 3) * 0.5;
      ctx.save();
      ctx.globalAlpha = a * p2;
      drawBigHeart(x + i * 12, hy2, 6);
      ctx.restore();
    }
  }

  // flag para spawnHeart único por cena
  const _onceFlags = {};
  function spawnHeartOnce(x, y, key) {
    if (!_onceFlags[key]) {
      _onceFlags[key] = true;
      spawnHeart(x, y);
    }
  }

  function drawSubtitle(text, p2, W, H) {
    const alpha = p2 < 0.1 ? p2 * 10 : p2 > 0.85 ? (1 - p2) * 6.6 : 1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(40, H - 65, W - 80, 38);
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(text, W / 2, H - 40);
    ctx.restore();
  }

  // ============================================================
  // API pública
  // ============================================================
  function start(canvasEl, callback) {
    init(canvasEl, callback);
    tick();
  }

  function tick() {
    update();
    draw();
    if (done) {
      cancelAnimationFrame(raf);
      if (onDone) onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
  }

  return { start, stop };
})();
