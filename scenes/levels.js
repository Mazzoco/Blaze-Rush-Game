// ============================================================
// LEVEL DEFINITIONS — 4 phases with platforms, enemies, rings, checkpoints
// ============================================================

const Levels = [
  // ============================================================
  // FASE 1 — FLORESTA
  // ============================================================
  {
    name: 'Fase 1 - Floresta Veloz',
    theme: 'forest',
    bgm: 'forest',
    width: 6400,
    height: 800,
    playerStart: { x: 100, y: 400 },
    gravity: 0.55,
    iceSlip: false,

    platforms: [
      // Ground base
      { x: 0,    y: 560, w: 600,  h: 40 },
      { x: 650,  y: 560, w: 400,  h: 40 },
      { x: 1100, y: 560, w: 500,  h: 40 },
      { x: 1700, y: 560, w: 600,  h: 40 },
      { x: 2400, y: 560, w: 500,  h: 40 },
      { x: 3000, y: 560, w: 700,  h: 40 },
      { x: 3800, y: 560, w: 500,  h: 40 },
      { x: 4400, y: 560, w: 800,  h: 40 },
      { x: 5300, y: 560, w: 700,  h: 40 },
      { x: 6050, y: 560, w: 400,  h: 40 },
      // Mid platforms
      { x: 200,  y: 460, w: 120,  h: 20 },
      { x: 400,  y: 390, w: 140,  h: 20 },
      { x: 700,  y: 420, w: 100,  h: 20 },
      { x: 900,  y: 350, w: 120,  h: 20 },
      { x: 1150, y: 440, w: 160,  h: 20 },
      { x: 1380, y: 370, w: 130,  h: 20 },
      { x: 1600, y: 430, w: 100,  h: 20 },
      { x: 1800, y: 380, w: 150,  h: 20 },
      { x: 2050, y: 320, w: 120,  h: 20 },
      { x: 2250, y: 400, w: 140,  h: 20 },
      { x: 2500, y: 460, w: 100,  h: 20 },
      { x: 2700, y: 380, w: 160,  h: 20 },
      { x: 2900, y: 310, w: 130,  h: 20 },
      { x: 3100, y: 440, w: 120,  h: 20 },
      { x: 3300, y: 360, w: 150,  h: 20 },
      { x: 3500, y: 290, w: 120,  h: 20 },
      { x: 3700, y: 420, w: 100,  h: 20 },
      { x: 3900, y: 480, w: 130,  h: 20 },
      { x: 4100, y: 400, w: 140,  h: 20 },
      { x: 4300, y: 330, w: 160,  h: 20 },
      { x: 4600, y: 460, w: 120,  h: 20 },
      { x: 4800, y: 380, w: 100,  h: 20 },
      { x: 5000, y: 300, w: 150,  h: 20 },
      { x: 5200, y: 420, w: 130,  h: 20 },
      { x: 5500, y: 350, w: 140,  h: 20 },
      { x: 5700, y: 280, w: 120,  h: 20 },
      { x: 5900, y: 400, w: 100,  h: 20 },
      // High platforms (vertical exploration)
      { x: 300,  y: 280, w: 100,  h: 20 },
      { x: 600,  y: 220, w: 120,  h: 20 },
      { x: 850,  y: 160, w: 140,  h: 20 },
      { x: 2100, y: 200, w: 130,  h: 20 },
      { x: 3600, y: 180, w: 120,  h: 20 },
      // Boss arena floor
      { x: 5800, y: 560, w: 600,  h: 40 },
      { x: 5850, y: 400, w: 100,  h: 20 },
      { x: 6100, y: 350, w: 100,  h: 20 },
      { x: 6200, y: 280, w: 100,  h: 20 },
    ],

    enemies: [
      { x: 300,  y: 530, type: 'bug' },
      { x: 500,  y: 530, type: 'bug' },
      { x: 800,  y: 530, type: 'mushroom' },
      { x: 1200, y: 530, type: 'bug' },
      { x: 1500, y: 530, type: 'mushroom' },
      { x: 1900, y: 530, type: 'bug' },
      { x: 2200, y: 530, type: 'bug' },
      { x: 2600, y: 530, type: 'mushroom' },
      { x: 2900, y: 530, type: 'bug' },
      { x: 3200, y: 530, type: 'mushroom' },
      { x: 3500, y: 530, type: 'bug' },
      { x: 3800, y: 530, type: 'bug' },
      { x: 4100, y: 530, type: 'mushroom' },
      { x: 4400, y: 530, type: 'bug' },
      { x: 4700, y: 530, type: 'bat' },
      { x: 5000, y: 480, type: 'bat' },
      { x: 5300, y: 530, type: 'mushroom' },
      { x: 5600, y: 530, type: 'bug' },
      // Platform enemies
      { x: 400,  y: 360, type: 'bug' },
      { x: 900,  y: 320, type: 'bat' },
      { x: 2050, y: 290, type: 'bat' },
    ],

    rings: buildRingLine(150, 520, 12, 40, 0) .concat(
           buildRingLine(700, 390, 6,  40, 0))  .concat(
           buildRingLine(1200,510, 8,  40, 0))  .concat(
           buildRingLine(2000,490, 6,  40, 0))  .concat(
           buildRingLine(3000,480, 10, 40, 0))  .concat(
           buildRingLine(4400,530, 8,  40, 0))  .concat(
           buildRingLine(5300,530, 8,  40, 0))  .concat(
           buildRingArc(850,  130, 5, 80))      .concat(
           buildRingLine(300, 250, 5, 35, 0)),

    checkpoints: [
      { x: 1750, y: 520 },  // sobre ground x:1700 w:600
      { x: 3100, y: 520 },  // sobre ground x:3000 w:700
      { x: 4600, y: 520 },  // sobre ground x:4400 w:800
    ],

    boss: { x: 5900, y: 480, type: 'forest' },
    goalX: 6300
  },

  // ============================================================
  // FASE 2 — CAVERNA
  // ============================================================
  {
    name: 'Fase 2 - Caverna de Cristal',
    theme: 'cave',
    bgm: 'cave',
    width: 6400,
    height: 900,
    playerStart: { x: 100, y: 650 },
    gravity: 0.55,
    iceSlip: false,

    platforms: [
      // Ground
      { x: 0,    y: 700, w: 500,  h: 40 },
      { x: 560,  y: 700, w: 400,  h: 40 },
      { x: 1020, y: 700, w: 500,  h: 40 },
      { x: 1600, y: 700, w: 600,  h: 40 },
      { x: 2300, y: 700, w: 500,  h: 40 },
      { x: 2900, y: 700, w: 600,  h: 40 },
      { x: 3600, y: 700, w: 500,  h: 40 },
      { x: 4200, y: 700, w: 700,  h: 40 },
      { x: 5000, y: 700, w: 500,  h: 40 },
      { x: 5600, y: 700, w: 800,  h: 40 },
      // Rock shelves
      { x: 100,  y: 580, w: 150,  h: 20 },
      { x: 350,  y: 500, w: 120,  h: 20 },
      { x: 600,  y: 580, w: 140,  h: 20 },
      { x: 800,  y: 480, w: 160,  h: 20 },
      { x: 1100, y: 570, w: 120,  h: 20 },
      { x: 1300, y: 480, w: 150,  h: 20 },
      { x: 1500, y: 400, w: 130,  h: 20 },
      { x: 1700, y: 560, w: 140,  h: 20 },
      { x: 1950, y: 460, w: 120,  h: 20 },
      { x: 2150, y: 380, w: 160,  h: 20 },
      { x: 2400, y: 540, w: 130,  h: 20 },
      { x: 2600, y: 440, w: 140,  h: 20 },
      { x: 2800, y: 560, w: 120,  h: 20 },
      { x: 3000, y: 480, w: 150,  h: 20 },
      { x: 3200, y: 400, w: 130,  h: 20 },
      { x: 3400, y: 540, w: 120,  h: 20 },
      { x: 3700, y: 460, w: 160,  h: 20 },
      { x: 3900, y: 380, w: 140,  h: 20 },
      { x: 4100, y: 560, w: 120,  h: 20 },
      { x: 4400, y: 460, w: 150,  h: 20 },
      { x: 4700, y: 380, w: 130,  h: 20 },
      { x: 4900, y: 560, w: 120,  h: 20 },
      { x: 5100, y: 460, w: 140,  h: 20 },
      { x: 5300, y: 380, w: 160,  h: 20 },
      { x: 5500, y: 560, w: 120,  h: 20 },
      // Boss arena
      { x: 5700, y: 700, w: 700,  h: 40 },
      { x: 5750, y: 550, w: 100,  h: 20 },
      { x: 5950, y: 480, w: 100,  h: 20 },
      { x: 6150, y: 400, w: 100,  h: 20 },
      { x: 6050, y: 550, w: 100,  h: 20 },
    ],

    enemies: [
      { x: 200,  y: 670, type: 'crystal' },
      { x: 500,  y: 670, type: 'mole' },
      { x: 800,  y: 670, type: 'crystal' },
      { x: 1100, y: 670, type: 'mole' },
      { x: 1400, y: 670, type: 'crystal' },
      { x: 1700, y: 670, type: 'mole' },
      { x: 2000, y: 670, type: 'crystal' },
      { x: 2300, y: 670, type: 'bat' },
      { x: 2600, y: 620, type: 'bat' },
      { x: 2900, y: 670, type: 'crystal' },
      { x: 3200, y: 670, type: 'mole' },
      { x: 3500, y: 670, type: 'crystal' },
      { x: 3800, y: 670, type: 'bat' },
      { x: 4100, y: 670, type: 'mole' },
      { x: 4400, y: 670, type: 'crystal' },
      { x: 4700, y: 670, type: 'bat' },
      { x: 5000, y: 670, type: 'mole' },
      { x: 5300, y: 670, type: 'crystal' },
      { x: 5600, y: 670, type: 'mole' },
    ],

    rings: buildRingLine(100, 660, 10, 40, 0).concat(
           buildRingLine(1600,660, 10, 40, 0)).concat(
           buildRingLine(3000,660, 10, 40, 0)).concat(
           buildRingLine(4500,660, 8,  40, 0)).concat(
           buildRingLine(5600,660, 6,  40, 0)).concat(
           buildRingArc(2150, 340, 5, 80)),

    checkpoints: [
      { x: 1700, y: 660 },  // sobre ground x:1600 w:600
      { x: 3050, y: 660 },  // sobre ground x:2900 w:600
      { x: 5100, y: 660 },  // sobre ground x:5000 w:500
    ],

    boss: { x: 5900, y: 620, type: 'cave' },
    goalX: 6350
  },

  // ============================================================
  // FASE 3 — GELO
  // ============================================================
  {
    name: 'Fase 3 - Tundra Congelada',
    theme: 'ice',
    bgm: 'ice',
    width: 6400,
    height: 800,
    playerStart: { x: 100, y: 450 },
    gravity: 0.55,
    iceSlip: true,

    platforms: [
      // Ground — slippery ice
      { x: 0,    y: 560, w: 500,  h: 40, ice: true },
      { x: 550,  y: 560, w: 400,  h: 40, ice: true },
      { x: 1010, y: 560, w: 500,  h: 40, ice: true },
      { x: 1600, y: 560, w: 600,  h: 40, ice: true },
      { x: 2300, y: 560, w: 500,  h: 40, ice: true },
      { x: 2900, y: 560, w: 600,  h: 40, ice: true },
      { x: 3600, y: 560, w: 500,  h: 40, ice: true },
      { x: 4200, y: 560, w: 700,  h: 40, ice: true },
      { x: 5000, y: 560, w: 500,  h: 40, ice: true },
      { x: 5600, y: 560, w: 800,  h: 40, ice: true },
      // Ice shelves
      { x: 150,  y: 440, w: 120,  h: 20, ice: true },
      { x: 380,  y: 360, w: 140,  h: 20, ice: true },
      { x: 650,  y: 440, w: 130,  h: 20, ice: true },
      { x: 850,  y: 360, w: 120,  h: 20, ice: true },
      { x: 1100, y: 460, w: 150,  h: 20, ice: true },
      { x: 1350, y: 380, w: 130,  h: 20, ice: true },
      { x: 1600, y: 300, w: 140,  h: 20, ice: true },
      { x: 1850, y: 420, w: 120,  h: 20, ice: true },
      { x: 2100, y: 340, w: 160,  h: 20, ice: true },
      { x: 2350, y: 460, w: 130,  h: 20, ice: true },
      { x: 2600, y: 380, w: 140,  h: 20, ice: true },
      { x: 2850, y: 300, w: 120,  h: 20, ice: true },
      { x: 3100, y: 440, w: 150,  h: 20, ice: true },
      { x: 3350, y: 360, w: 130,  h: 20, ice: true },
      { x: 3600, y: 280, w: 140,  h: 20, ice: true },
      { x: 3850, y: 460, w: 120,  h: 20, ice: true },
      { x: 4100, y: 380, w: 150,  h: 20, ice: true },
      { x: 4350, y: 300, w: 130,  h: 20, ice: true },
      { x: 4600, y: 440, w: 120,  h: 20, ice: true },
      { x: 4850, y: 360, w: 160,  h: 20, ice: true },
      { x: 5100, y: 280, w: 140,  h: 20, ice: true },
      { x: 5350, y: 460, w: 120,  h: 20, ice: true },
      { x: 5600, y: 380, w: 150,  h: 20, ice: true },
      // Boss arena
      { x: 5800, y: 560, w: 600,  h: 40, ice: true },
      { x: 5850, y: 400, w: 100,  h: 20, ice: true },
      { x: 6050, y: 330, w: 100,  h: 20, ice: true },
      { x: 6200, y: 260, w: 100,  h: 20, ice: true },
    ],

    enemies: [
      { x: 250,  y: 530, type: 'snowman' },
      { x: 500,  y: 530, type: 'snowman' },
      { x: 800,  y: 530, type: 'yeti' },
      { x: 1100, y: 530, type: 'snowman' },
      { x: 1400, y: 530, type: 'bat' },
      { x: 1700, y: 530, type: 'snowman' },
      { x: 2000, y: 530, type: 'yeti' },
      { x: 2300, y: 530, type: 'snowman' },
      { x: 2600, y: 530, type: 'bat' },
      { x: 2900, y: 530, type: 'yeti' },
      { x: 3200, y: 530, type: 'snowman' },
      { x: 3500, y: 530, type: 'snowman' },
      { x: 3800, y: 530, type: 'yeti' },
      { x: 4100, y: 530, type: 'bat' },
      { x: 4400, y: 530, type: 'snowman' },
      { x: 4700, y: 530, type: 'yeti' },
      { x: 5000, y: 530, type: 'snowman' },
      { x: 5300, y: 530, type: 'bat' },
      { x: 5600, y: 530, type: 'yeti' },
    ],

    rings: buildRingLine(100, 520, 10, 40, 0).concat(
           buildRingLine(1700,520, 8,  40, 0)).concat(
           buildRingLine(3000,520, 10, 40, 0)).concat(
           buildRingLine(4500,520, 8,  40, 0)).concat(
           buildRingLine(5600,520, 6,  40, 0)).concat(
           buildRingArc(3600, 240, 5, 80)),

    checkpoints: [
      { x: 1700, y: 520 },  // sobre ground x:1600 w:600
      { x: 3050, y: 520 },  // sobre ground x:2900 w:600
      { x: 5100, y: 520 },  // sobre ground x:5000 w:500
    ],

    boss: { x: 5900, y: 480, type: 'ice' },
    goalX: 6350
  },

  // ============================================================
  // FASE 4 — LAVA
  // ============================================================
  {
    name: 'Fase 4 - Vulcão Infernal',
    theme: 'lava',
    bgm: 'lava',
    width: 6400,
    height: 800,
    playerStart: { x: 100, y: 400 },
    gravity: 0.6,
    iceSlip: false,
    lavaFloor: true,

    platforms: [
      // Raised platforms (lava below)
      { x: 0,    y: 520, w: 200,  h: 30 },
      { x: 260,  y: 480, w: 160,  h: 30 },
      { x: 480,  y: 520, w: 180,  h: 30 },
      { x: 720,  y: 460, w: 150,  h: 30 },
      { x: 930,  y: 500, w: 170,  h: 30 },
      { x: 1160, y: 440, w: 160,  h: 30 },
      { x: 1380, y: 490, w: 180,  h: 30 },
      { x: 1620, y: 450, w: 150,  h: 30 },
      { x: 1830, y: 500, w: 160,  h: 30 },
      { x: 2060, y: 440, w: 170,  h: 30 },
      { x: 2300, y: 480, w: 150,  h: 30 },
      { x: 2520, y: 420, w: 160,  h: 30 },
      { x: 2750, y: 470, w: 180,  h: 30 },
      { x: 2990, y: 430, w: 160,  h: 30 },
      { x: 3220, y: 480, w: 150,  h: 30 },
      { x: 3440, y: 420, w: 170,  h: 30 },
      { x: 3680, y: 470, w: 160,  h: 30 },
      { x: 3910, y: 430, w: 180,  h: 30 },
      { x: 4160, y: 480, w: 150,  h: 30 },
      { x: 4380, y: 420, w: 160,  h: 30 },
      { x: 4610, y: 470, w: 170,  h: 30 },
      { x: 4850, y: 430, w: 150,  h: 30 },
      { x: 5070, y: 480, w: 160,  h: 30 },
      { x: 5300, y: 420, w: 180,  h: 30 },
      { x: 5550, y: 470, w: 160,  h: 30 },
      // Upper platforms
      { x: 300,  y: 340, w: 130,  h: 20 },
      { x: 600,  y: 280, w: 140,  h: 20 },
      { x: 900,  y: 340, w: 120,  h: 20 },
      { x: 1500, y: 310, w: 150,  h: 20 },
      { x: 2200, y: 280, w: 130,  h: 20 },
      { x: 3000, y: 300, w: 140,  h: 20 },
      { x: 3800, y: 280, w: 120,  h: 20 },
      { x: 4600, y: 300, w: 150,  h: 20 },
      { x: 5400, y: 260, w: 130,  h: 20 },
      // Boss arena
      { x: 5780, y: 540, w: 620,  h: 40 },
      { x: 5820, y: 380, w: 100,  h: 20 },
      { x: 6050, y: 310, w: 100,  h: 20 },
      { x: 6230, y: 240, w: 100,  h: 20 },
      { x: 5950, y: 440, w: 80,   h: 20 },
    ],

    enemies: [
      { x: 300,  y: 490, type: 'demon' },
      { x: 550,  y: 490, type: 'fireling' },
      { x: 800,  y: 430, type: 'demon' },
      { x: 1050, y: 470, type: 'fireling' },
      { x: 1300, y: 460, type: 'bat' },
      { x: 1600, y: 420, type: 'demon' },
      { x: 1900, y: 470, type: 'fireling' },
      { x: 2150, y: 410, type: 'demon' },
      { x: 2400, y: 450, type: 'fireling' },
      { x: 2700, y: 440, type: 'bat' },
      { x: 2950, y: 400, type: 'demon' },
      { x: 3200, y: 450, type: 'fireling' },
      { x: 3450, y: 390, type: 'demon' },
      { x: 3700, y: 440, type: 'bat' },
      { x: 3950, y: 400, type: 'fireling' },
      { x: 4200, y: 450, type: 'demon' },
      { x: 4450, y: 390, type: 'fireling' },
      { x: 4700, y: 440, type: 'bat' },
      { x: 4950, y: 400, type: 'demon' },
      { x: 5200, y: 390, type: 'fireling' },
      { x: 5450, y: 440, type: 'demon' },
      { x: 5650, y: 440, type: 'bat' },
    ],

    rings: buildRingLine(100, 480, 8, 40, 0).concat(
           buildRingLine(260, 450, 5, 40, 0)).concat(
           buildRingLine(1500,480, 8, 40, 0)).concat(
           buildRingLine(3000,480, 8, 40, 0)).concat(
           buildRingLine(4500,480, 8, 40, 0)).concat(
           buildRingLine(5500,480, 6, 40, 0)).concat(
           buildRingArc(2200, 240, 5, 80)),

    checkpoints: [
      { x: 1450, y: 440 },  // sobre platform x:1380 y:490 (está sobre o chão)
      { x: 3050, y: 400 },  // sobre platform x:2990 y:430
      { x: 4920, y: 400 },  // sobre platform x:4850 y:430
    ],

    boss: { x: 5900, y: 460, type: 'lava' },
    goalX: 6350
  }
];

// ---- Helper builders ----
function buildRingLine(startX, y, count, spacing, dy) {
  const rings = [];
  for (let i = 0; i < count; i++) {
    rings.push({ x: startX + i * spacing, y: y + i * dy });
  }
  return rings;
}

function buildRingArc(cx, cy, count, radius) {
  const rings = [];
  for (let i = 0; i < count; i++) {
    const a = Math.PI + (i / (count - 1)) * Math.PI;
    rings.push({ x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius * 0.5 });
  }
  return rings;
}