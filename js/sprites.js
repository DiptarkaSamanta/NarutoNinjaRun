/**
 * NARUTO NINJA RUN - Procedural Sprite Renderer
 * Detailed canvas drawings for characters, bosses, enemies, obstacles, and items.
 */

class ShinobiRenderer {
  // ==========================================
  // PLAYABLE CHARACTERS
  // ==========================================

  static drawPlayer(ctx, player, animTime) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Flip horizontally if facing left (usually runs right)
    if (player.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Shadow on ground
    if (player.isGrounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(player.width / 2, player.height + 2, player.width * 0.45, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Character specific aura effects
    if (player.isNineTails) {
      this.drawKyuubiAura(ctx, player, animTime);
    } else if (player.isEightGates) {
      this.drawEightGatesAura(ctx, player, animTime);
    } else if (player.isSusanoo) {
      this.drawSusanooRibcage(ctx, player, animTime);
    } else if (player.isInvulnerable) {
      // Flashing opacity on hit
      ctx.globalAlpha = Math.sin(animTime * 25) > 0 ? 0.35 : 0.9;
    }

    // Draw the character by id
    const cid = player.characterId || 'naruto';
    switch (cid) {
      case 'sasuke':
        this.renderSasuke(ctx, player, animTime);
        break;
      case 'kakashi':
        this.renderKakashi(ctx, player, animTime);
        break;
      case 'sakura':
        this.renderSakura(ctx, player, animTime);
        break;
      case 'lee':
        this.renderRockLee(ctx, player, animTime);
        break;
      case 'naruto':
      default:
        this.renderNaruto(ctx, player, animTime);
        break;
    }

    // Active jutsu visual indicators (Rasengan, Chidori, etc.)
    if (player.activeJutsuVisual === 'rasengan') {
      this.drawRasenganBall(ctx, player.width + 12, player.height * 0.45, animTime);
    } else if (player.activeJutsuVisual === 'chidori') {
      this.drawChidoriHand(ctx, player.width + 10, player.height * 0.45, animTime);
    }

    ctx.restore();
  }

  // ------------------------------------------
  // NARUTO UZUMAKI
  // ------------------------------------------
  static renderNaruto(ctx, p, t) {
    const isSlide = p.isSliding;
    const isAir = !p.isGrounded;
    const legCycle = isAir ? 0.4 : Math.sin(t * 18);
    const armCycle = Math.cos(t * 18);

    if (isSlide) {
      // Sliding Naruto (low profile, legs forward, torso back)
      ctx.save();
      ctx.translate(10, p.height - 18);

      // Back leg
      ctx.fillStyle = '#ff7700'; // Orange jumpsuit
      ctx.fillRect(-15, 6, 26, 10);
      ctx.fillStyle = '#1e3a8a'; // Blue shinobi sandals
      ctx.fillRect(11, 6, 12, 10);

      // Torso
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(-22, -10, 32, 18);
      // Blue shoulder patches
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-22, -10, 10, 18);

      // Arms trailing
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(-35, -5, 18, 7);

      // Head
      ctx.fillStyle = '#fcd34d'; // Skin tone
      ctx.beginPath();
      ctx.arc(8, -12, 12, 0, Math.PI * 2);
      ctx.fill();

      // Blond hair
      this.drawSpikyHair(ctx, 8, -16, '#facc15', 5, 8);

      // Konoha Headband
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, -18, 16, 5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(4, -18, 8, 4);

      ctx.restore();
      return;
    }

    // Upright / Running / Jumping Naruto
    ctx.save();
    const bob = isAir ? 0 : Math.abs(Math.sin(t * 18)) * 3;
    ctx.translate(p.width / 2 - 8, bob);

    // 1. BACK LEG
    ctx.save();
    ctx.translate(0, p.height - 24);
    ctx.rotate(legCycle * 0.7);
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-4, 0, 9, 18);
    // Sandal
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-4, 15, 12, 8);
    ctx.restore();

    // 2. BACK ARM (Naruto run: arms trail backward)
    ctx.save();
    ctx.translate(-4, p.height * 0.38);
    ctx.rotate(isAir ? -0.4 : -0.85 + armCycle * 0.1);
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-22, -3, 24, 7);
    // Hand
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(-24, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. TORSO (Orange jumpsuit with blue collar)
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-8, p.height * 0.28, 20, 26);
    // Blue collar/shoulders
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-8, p.height * 0.28, 20, 8);
    // White swirl crest on back
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(-2, p.height * 0.42, 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. FRONT LEG
    ctx.save();
    ctx.translate(6, p.height - 24);
    ctx.rotate(-legCycle * 0.7);
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-4, 0, 9, 18);
    // Bandage on right leg
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4, 6, 9, 4);
    // Sandal
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-4, 15, 12, 8);
    ctx.restore();

    // 5. FRONT ARM
    ctx.save();
    ctx.translate(6, p.height * 0.38);
    ctx.rotate(isAir ? -0.3 : -0.75 - armCycle * 0.1);
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-22, -3, 24, 7);
    // Hand
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(-24, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. HEAD
    ctx.fillStyle = '#fcd34d'; // Skin tone
    ctx.beginPath();
    ctx.arc(3, p.height * 0.16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Whisker marks
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(7, p.height * 0.17 + i * 2.5);
      ctx.lineTo(12, p.height * 0.17 + i * 2.5);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#0284c7'; // Blue eyes
    ctx.beginPath();
    ctx.arc(8, p.height * 0.14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Blond Hair
    this.drawSpikyHair(ctx, 3, p.height * 0.11, '#facc15', 6, 11);

    // Blue Konoha Headband
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-4, p.height * 0.08, 16, 6);
    // Metal plate
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, p.height * 0.08 + 1, 9, 4);
    // Leaf insignia dot
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, p.height * 0.08 + 2, 2, 2);

    ctx.restore();
  }

  // ------------------------------------------
  // SASUKE UCHIHA
  // ------------------------------------------
  static renderSasuke(ctx, p, t) {
    const isSlide = p.isSliding;
    const isAir = !p.isGrounded;
    const legCycle = isAir ? 0.3 : Math.sin(t * 20);

    if (isSlide) {
      ctx.save();
      ctx.translate(10, p.height - 18);
      ctx.fillStyle = '#ffffff'; // White shorts
      ctx.fillRect(-15, 6, 26, 10);
      ctx.fillStyle = '#1e293b'; // Dark blue shirt
      ctx.fillRect(-22, -10, 32, 18);
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(8, -12, 12, 0, Math.PI * 2);
      ctx.fill();
      this.drawSpikyHair(ctx, 8, -16, '#0f172a', 6, 9);
      // Headband
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, -18, 16, 5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(4, -18, 8, 4);
      ctx.restore();
      return;
    }

    ctx.save();
    const bob = isAir ? 0 : Math.abs(Math.sin(t * 20)) * 3;
    ctx.translate(p.width / 2 - 8, bob);

    // Torso (Navy shirt with high popped collar)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, p.height * 0.28, 20, 26);
    // Uchiha fan crest on back
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(-2, p.height * 0.40, 4, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, p.height * 0.40, 4, 0, Math.PI);
    ctx.fill();

    // High collar
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, p.height * 0.22, 6, 10);

    // Legs (White shorts + dark leg warmers)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, p.height * 0.65, 12, 8);

    // Back leg
    ctx.save();
    ctx.translate(0, p.height - 20);
    ctx.rotate(legCycle * 0.7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 8, 16);
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(6, p.height - 20);
    ctx.rotate(-legCycle * 0.7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 8, 16);
    ctx.restore();

    // Arms
    ctx.save();
    ctx.translate(-4, p.height * 0.38);
    ctx.rotate(-0.85);
    ctx.fillStyle = '#ffffff'; // White arm warmers
    ctx.fillRect(-22, -3, 24, 7);
    ctx.restore();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Sharingan glowing red eye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(8, p.height * 0.14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(8, p.height * 0.14, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Spiky jet-black ducktail hair
    this.drawSpikyHair(ctx, 1, p.height * 0.10, '#0f172a', 6, 12);

    // Headband
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, p.height * 0.08, 16, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, p.height * 0.08 + 1, 9, 4);

    ctx.restore();
  }

  // ------------------------------------------
  // KAKASHI HATAKE (Copy Ninja)
  // ------------------------------------------
  static renderKakashi(ctx, p, t) {
    const isSlide = p.isSliding;
    const isAir = !p.isGrounded;
    const legCycle = isAir ? 0.3 : Math.sin(t * 18);

    ctx.save();
    const bob = isAir ? 0 : Math.abs(Math.sin(t * 18)) * 3;
    ctx.translate(p.width / 2 - 8, isSlide ? p.height - 26 : bob);

    // Jonin Vest (Green Flak Jacket)
    ctx.fillStyle = '#166534'; // Forest green vest
    ctx.fillRect(-8, p.height * 0.28, 22, 26);
    // Vest pockets
    ctx.fillStyle = '#14532d';
    ctx.fillRect(2, p.height * 0.38, 8, 10);
    // Dark undershirt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, p.height * 0.28, 6, 26);

    // Dark pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, p.height * 0.65, 14, 8);

    // Legs
    ctx.save();
    ctx.translate(0, p.height - 20);
    ctx.rotate(legCycle * 0.7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 8, 16);
    ctx.restore();

    ctx.save();
    ctx.translate(6, p.height - 20);
    ctx.rotate(-legCycle * 0.7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 8, 16);
    ctx.restore();

    // Arms
    ctx.save();
    ctx.translate(-4, p.height * 0.38);
    ctx.rotate(-0.85);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-22, -3, 24, 7);
    ctx.restore();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Face Mask covering lower face
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.17, 12, 0.2, Math.PI * 0.85);
    ctx.fill();

    // Eye (Left eye covered by slanted headband, right eye visible)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, p.height * 0.13, 3, 2);

    // Silver gravity-defying spiky hair!
    this.drawSpikyHair(ctx, 3, p.height * 0.08, '#e2e8f0', 7, 14);

    // Slanted dark blue headband
    ctx.save();
    ctx.translate(2, p.height * 0.11);
    ctx.rotate(0.2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -3, 16, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, -2, 8, 4);
    ctx.restore();

    ctx.restore();
  }

  // ------------------------------------------
  // SAKURA HARUNO
  // ------------------------------------------
  static renderSakura(ctx, p, t) {
    const isAir = !p.isGrounded;
    const legCycle = isAir ? 0.3 : Math.sin(t * 18);

    ctx.save();
    const bob = isAir ? 0 : Math.abs(Math.sin(t * 18)) * 3;
    ctx.translate(p.width / 2 - 8, bob);

    // Torso (Red sleeveless top + pink skirt/shorts)
    ctx.fillStyle = '#dc2626'; // Red top
    ctx.fillRect(-8, p.height * 0.28, 20, 24);
    // White ring on back
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, p.height * 0.40, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pink shorts / dark biker shorts
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, p.height * 0.62, 12, 8);

    // Legs
    ctx.save();
    ctx.translate(0, p.height - 20);
    ctx.rotate(legCycle * 0.7);
    ctx.fillStyle = '#fcd34d'; // bare legs
    ctx.fillRect(-3, 0, 7, 12);
    ctx.fillStyle = '#1e293b'; // sandals
    ctx.fillRect(-3, 10, 10, 7);
    ctx.restore();

    ctx.save();
    ctx.translate(6, p.height - 20);
    ctx.rotate(-legCycle * 0.7);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-3, 0, 7, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 10, 10, 7);
    ctx.restore();

    // Arms with green medical chakra glow on fists
    ctx.save();
    ctx.translate(-4, p.height * 0.38);
    ctx.rotate(-0.85);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-22, -3, 24, 6);
    // Green chakra on hand
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(-24, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Green eyes
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(8, p.height * 0.14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bright Pink Hair
    this.drawSpikyHair(ctx, 2, p.height * 0.10, '#f472b6', 5, 10);

    // Red Headband worn as hair accessory
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-2, p.height * 0.10, 12, 4);

    ctx.restore();
  }

  // ------------------------------------------
  // ROCK LEE
  // ------------------------------------------
  static renderRockLee(ctx, p, t) {
    const isAir = !p.isGrounded;
    const legCycle = isAir ? 0.3 : Math.sin(t * 22);

    ctx.save();
    const bob = isAir ? 0 : Math.abs(Math.sin(t * 22)) * 3;
    ctx.translate(p.width / 2 - 8, bob);

    // Green Jumpsuit
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-8, p.height * 0.28, 20, 26);
    // Red belt with Konoha buckle
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-8, p.height * 0.58, 20, 5);

    // Legs with Orange Leg Warmers
    ctx.save();
    ctx.translate(0, p.height - 20);
    ctx.rotate(legCycle * 0.8);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-3, 0, 8, 8);
    // Orange leg warmers
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-4, 7, 10, 10);
    ctx.restore();

    ctx.save();
    ctx.translate(6, p.height - 20);
    ctx.rotate(-legCycle * 0.8);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-3, 0, 8, 8);
    // Orange leg warmers
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-4, 7, 10, 10);
    ctx.restore();

    // Arms wrapped in white bandages
    ctx.save();
    ctx.translate(-4, p.height * 0.38);
    ctx.rotate(-0.85);
    ctx.fillStyle = '#ffffff'; // White bandages
    ctx.fillRect(-22, -3, 24, 7);
    ctx.restore();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Huge Bushy Eyebrows & big round eyes!
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, p.height * 0.11, 7, 3); // Eyebrow
    ctx.beginPath();
    ctx.arc(7, p.height * 0.15, 3.5, 0, Math.PI * 2); // Big round eye
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, p.height * 0.14, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Shiny Bowl Cut black hair
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(3, p.height * 0.12, 13, Math.PI, Math.PI * 2);
    ctx.fill();
    // Hair shine highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, p.height * 0.05, 5, 2);

    ctx.restore();
  }

  // ------------------------------------------
  // HAIR & JUTSU HELPER DRAWINGS
  // ------------------------------------------
  static drawSpikyHair(ctx, x, y, color, count, length) {
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / count) * i + Math.PI;
      const spikeX = x + Math.cos(angle) * 11;
      const spikeY = y + Math.sin(angle) * 10;
      ctx.beginPath();
      ctx.moveTo(spikeX - 4, spikeY);
      ctx.lineTo(spikeX + Math.cos(angle) * length, spikeY + Math.sin(angle) * length);
      ctx.lineTo(spikeX + 4, spikeY);
      ctx.closePath();
      ctx.fill();
    }
    // Base hair circle
    ctx.beginPath();
    ctx.arc(x, y + 2, 11, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.restore();
  }

  static drawRasenganBall(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);

    // Outer glow
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.8, '#0284c7');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Swirling energy lines
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(t * 15 + (i * Math.PI) / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  static drawChidoriHand(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);

    // Blinding blue-white core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Jagged lightning arcs
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.sin(t * 30 + i) * 0.5;
      const len = 14 + Math.random() * 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (len * 0.5) + (Math.random() - 0.5) * 6, Math.sin(angle) * (len * 0.5));
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    }

    ctx.restore();
  }

  static drawKyuubiAura(ctx, p, t) {
    // Red Nine-Tails Chakra Cloak
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;

    // Twin chakra fox ears on head
    const earBob = Math.sin(t * 12) * 3;
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 10, 0);
    ctx.lineTo(p.width / 2 - 18, -18 + earBob);
    ctx.lineTo(p.width / 2 - 6, -5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p.width / 2 + 6, -5);
    ctx.lineTo(p.width / 2 + 18, -18 + earBob);
    ctx.lineTo(p.width / 2 + 10, 0);
    ctx.closePath();
    ctx.fill();

    // Swirling red shroud
    ctx.beginPath();
    ctx.arc(p.width / 2, p.height / 2, p.width * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  static drawEightGatesAura(ctx, p, t) {
    // Green Eighth Gate fiery vapor
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(p.width / 2, p.height / 2, p.width * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawSusanooRibcage(ctx, p, t) {
    // Ethereal purple Susano'o skeletal ribs
    ctx.save();
    ctx.strokeStyle = '#c084fc';
    ctx.shadowColor = '#9333ea';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;

    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(p.width / 2, p.height / 2 + i * 15, 36, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // BOSS RENDERERS
  // ==========================================

  static drawBoss(ctx, boss, animTime) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    // Boss Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(boss.width / 2, boss.height + 4, boss.width * 0.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Red threat aura when attacking
    if (boss.isAttacking) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.strokeRect(-5, -5, boss.width + 10, boss.height + 10);
      ctx.restore();
    }

    switch (boss.type) {
      case 'gaara':
        this.renderBossGaara(ctx, boss, animTime);
        break;
      case 'orochimaru':
        this.renderBossOrochimaru(ctx, boss, animTime);
        break;
      case 'pain':
        this.renderBossPain(ctx, boss, animTime);
        break;
      case 'madara':
        this.renderBossMadara(ctx, boss, animTime);
        break;
      case 'zabuza':
      default:
        this.renderBossZabuza(ctx, boss, animTime);
        break;
    }

    ctx.restore();
  }

  // 1. ZABUZA MOMOCHI (Demon of the Hidden Mist)
  static renderBossZabuza(ctx, b, t) {
    const float = Math.sin(t * 4) * 4;
    ctx.translate(0, float);

    // Torso (Shirtless with belt straps)
    ctx.fillStyle = '#fcd34d'; // skin
    ctx.fillRect(15, 30, 36, 40);
    // Dark pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(18, 70, 30, 35);
    // Striped arm and leg warmers
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(16, 85, 34, 15);

    // Giant Executioner's Blade (Kubikiribocho) on back / shoulder!
    ctx.save();
    ctx.translate(55, 10);
    ctx.rotate(0.3);
    // Blade metal
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, -30, 24, 110);
    // Blade cutout circle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(12, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    // Semi-circle cutout near hilt
    ctx.beginPath();
    ctx.arc(0, 45, 7, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    // Handle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 80, 8, 30);
    ctx.restore();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(33, 20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Bandage mask covering lower half of face
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(33, 22, 16, 0, Math.PI);
    ctx.fill();
    // Bandage lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(17, 26);
    ctx.lineTo(49, 26);
    ctx.moveTo(18, 32);
    ctx.lineTo(48, 32);
    ctx.stroke();

    // Fierce Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(26, 15, 5, 3);
    ctx.fillRect(36, 15, 5, 3);

    // Spiky dark hair
    this.drawSpikyHair(ctx, 33, 12, '#0f172a', 6, 14);

    // Slanted Mist Headband
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(17, 8, 32, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(24, 9, 16, 4);
  }

  // 2. GAARA OF THE SAND
  static renderBossGaara(ctx, b, t) {
    const float = Math.sin(t * 3) * 6;
    ctx.translate(0, float);

    // Giant Sand Gourd on back
    ctx.save();
    ctx.fillStyle = '#d97706'; // Tan gourd
    ctx.beginPath();
    ctx.ellipse(15, 45, 20, 30, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, 20, 14, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Gourd black cork & markings
    ctx.fillStyle = '#451a03';
    ctx.fillRect(14, 2, 8, 6);
    ctx.restore();

    // Torso (Crimson red coat)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(25, 25, 30, 45);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(40, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    // Red Kanji "愛" (Love) on forehead
    ctx.fillStyle = '#dc2626';
    ctx.font = '9px sans-serif';
    ctx.fillText('愛', 33, 14);

    // Dark ringed eyes (Tanuki markings)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 15, 6, 3);
    ctx.strokeRect(42, 15, 6, 3);

    // Auburn red spiky hair
    this.drawSpikyHair(ctx, 40, 10, '#b91c1c', 6, 12);

    // Floating Sand Shield / Sand particles orbiting Gaara
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 6; i++) {
      const angle = t * 3 + (i * Math.PI) / 3;
      const sx = 40 + Math.cos(angle) * 45;
      const sy = 45 + Math.sin(angle) * 35;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 8, 5, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. OROCHIMARU (Legendary Sannin)
  static renderBossOrochimaru(ctx, b, t) {
    const float = Math.sin(t * 3.5) * 5;
    ctx.translate(0, float);

    // Torso (Pale grey kimono with purple rope belt)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(20, 28, 30, 48);

    // Thick Purple Rope Belt (Shimenawa)
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(15, 52, 40, 12);

    // Head (Ghostly pale white skin)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(35, 18, 15, 0, Math.PI * 2);
    ctx.fill();

    // Purple eyeliner / markings extending to ears
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 16);
    ctx.lineTo(45, 16);
    ctx.stroke();

    // Golden snake eyes
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(31, 16, 3, 0, Math.PI * 2);
    ctx.arc(39, 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000'; // Slit pupils
    ctx.fillRect(30.5, 14, 1, 4);
    ctx.fillRect(38.5, 14, 1, 4);

    // Long straight black hair
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 6, 34, 32);

    // Striking Shadow Snakes emerging from sleeve!
    ctx.save();
    ctx.strokeStyle = '#3f6212'; // Olive green snake
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(20, 45);
    ctx.quadraticCurveTo(-10, 30 + Math.sin(t * 8) * 10, -25, 45);
    ctx.stroke();
    // Snake head
    ctx.fillStyle = '#4d7c0f';
    ctx.beginPath();
    ctx.ellipse(-26, 45, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444'; // Red tongue
    ctx.fillRect(-36, 44, 10, 2);
    ctx.restore();
  }

  // 4. PAIN / DEVA PATH (Akatsuki Leader)
  static renderBossPain(ctx, b, t) {
    const float = Math.sin(t * 3) * 4;
    ctx.translate(0, float);

    // Akatsuki Black Cloak with Red Clouds
    ctx.fillStyle = '#09090b';
    ctx.fillRect(20, 28, 34, 52);

    // Red Clouds on cloak
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(32, 45, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(37, 18, 15, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Purple Rinnegan Eyes
    for (const eyeX of [32, 42]) {
      for (let r = 5; r >= 1; r -= 1.5) {
        ctx.fillStyle = r % 3 === 0 ? '#4c1d95' : '#c084fc';
        ctx.beginPath();
        ctx.arc(eyeX, 17, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Black Piercings (Chakra Receivers) on nose and ears
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(36, 19, 2, 4); // nose bridge
    ctx.fillRect(20, 16, 2, 4); // ear
    ctx.fillRect(52, 16, 2, 4); // ear

    // Bright Orange Spiky Hair
    this.drawSpikyHair(ctx, 37, 10, '#f97316', 7, 15);

    // Akatsuki Scratched Rain Village Headband
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(21, 8, 32, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(26, 9, 22, 4);
    // Scratch across symbol
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, 11);
    ctx.lineTo(48, 11);
    ctx.stroke();
  }

  // 5. MADARA UCHIHA (Ghost of the Uchiha)
  static renderBossMadara(ctx, b, t) {
    const float = Math.sin(t * 2.5) * 4;
    ctx.translate(0, float);

    // Ethereal Susano'o Flame Aura surrounding Madara
    ctx.save();
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 25;
    ctx.strokeRect(10, 5, 55, 80);
    ctx.restore();

    // Vermilion Samurai Armor (Chestplate & Tassets)
    ctx.fillStyle = '#b91c1c'; // Red armor
    ctx.fillRect(22, 28, 36, 45);
    // Dark undershirt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(22, 28, 36, 6);

    // Armor segmented ridges
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 42);
    ctx.lineTo(58, 42);
    ctx.moveTo(22, 56);
    ctx.lineTo(58, 56);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(40, 18, 15, 0, Math.PI * 2);
    ctx.fill();

    // Dual Eternal Mangekyo / Rinnegan Eyes glowing
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(35, 17, 3, 0, Math.PI * 2);
    ctx.arc(45, 17, 3, 0, Math.PI * 2);
    ctx.fill();

    // Wild spiky mane of black hair flowing to shoulders!
    this.drawSpikyHair(ctx, 40, 8, '#09090b', 9, 22);
    // Side hair bangs
    ctx.fillStyle = '#09090b';
    ctx.fillRect(20, 14, 8, 35);
    ctx.fillRect(52, 14, 8, 35);
  }

  // ==========================================
  // OBSTACLES, ENEMIES & PICKUPS
  // ==========================================

  // Obstacle: Kunai Spike Trap
  static drawKunaiSpikes(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Wooden base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, height - 10, width, 10);

    // Steel kunai blades pointing upward
    const kunaiCount = Math.floor(width / 14);
    for (let i = 0; i < kunaiCount; i++) {
      const kx = i * 14 + 7;
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(kx, 2);
      ctx.lineTo(kx + 5, height - 10);
      ctx.lineTo(kx - 5, height - 10);
      ctx.closePath();
      ctx.fill();

      // Blade shine
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Obstacle: Paper Bomb (Explosive Tag)
  static drawPaperBomb(ctx, x, y, width, height, t) {
    ctx.save();
    ctx.translate(x, y);

    // Red pulsing glow when armed
    const glow = Math.sin(t * 15) * 5 + 8;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = glow;

    // Paper Tag
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(4, 4, width - 8, height - 8);

    // Kanji "爆" (Explode / Bomb)
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('爆', width / 2, height / 2 + 5);

    ctx.restore();
  }

  // Obstacle: Spinning Giant Fuma Shuriken
  static drawFumaShuriken(ctx, x, y, size, t) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(t * 18);

    const r = size / 2;
    // 4 curved deadly blades
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.4, -r * 0.3, r, 0);
      ctx.lineTo(r * 0.3, r * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Center brass ring
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Obstacle: High Flying Kunai Tripwire
  static drawTripwire(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Steel wire
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Hanging kunai blades
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height / 2);
    ctx.lineTo(width * 0.3 + 4, height);
    ctx.lineTo(width * 0.3 - 4, height);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.7, height / 2);
    ctx.lineTo(width * 0.7 + 4, height);
    ctx.lineTo(width * 0.7 - 4, height);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Enemy: Rogue Shinobi Runner
  static drawRogueNinja(ctx, enemy, t) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Dark grey / purple rogue tunic
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, 20, 24, 25);

    // Head with scratched rogue headband
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(20, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    // Red eye glow
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(16, 10, 3, 2);

    // Scratched headband
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 6, 20, 4);

    // Legs
    const leg = Math.sin(t * 16) * 6;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 45, 6, 15 + leg);
    ctx.fillRect(22, 45, 6, 15 - leg);

    // Drawn Ninjato blade
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 30);
    ctx.lineTo(-12, 36);
    ctx.stroke();

    ctx.restore();
  }

  // Pickup: Ichiraku Ramen Bowl
  static drawRamenBowl(ctx, x, y, width, height, t) {
    ctx.save();
    ctx.translate(x, y);

    const bob = Math.sin(t * 6) * 3;
    ctx.translate(0, bob);

    // Golden steam rising
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const sx = 10 + i * 8;
      ctx.moveTo(sx, 4);
      ctx.quadraticCurveTo(sx + Math.sin(t * 8 + i) * 4, -4, sx, -12);
      ctx.stroke();
    }

    // Ceramic Bowl (White with red rim)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.55, width * 0.42, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#dc2626'; // Red rim band
    ctx.fillRect(width * 0.08, height * 0.48, width * 0.84, 4);

    // Ramen Noodles & Soup
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.50, width * 0.38, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Naruto Fishcake (White with pink swirl!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2 - 4, height * 0.48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2 - 4, height * 0.48, 2.5, 0, Math.PI * 1.5);
    ctx.stroke();

    // Chopsticks resting across bowl
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.42);
    ctx.lineTo(width * 0.9, height * 0.48);
    ctx.stroke();

    ctx.restore();
  }

  // Pickup: Ninja Scroll
  static drawScroll(ctx, x, y, width, height, t) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(t * 5) * 3;
    ctx.translate(0, bob);

    // Golden scroll parchment cylinder
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(6, 6, width - 12, height - 12);

    // Red ribbon band around scroll
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(width / 2 - 3, 6, 6, height - 12);

    // Wooden roll knobs on ends
    ctx.fillStyle = '#78350f';
    ctx.fillRect(2, 4, 6, height - 8);
    ctx.fillRect(width - 8, 4, 6, height - 8);

    // Kanji "巻" (Scroll)
    ctx.fillStyle = '#b45309';
    ctx.font = '10px sans-serif';
    ctx.fillText('巻', width / 2 - 5, height / 2 + 4);

    ctx.restore();
  }

  // Pickup: Substitution Kawariami Log
  static drawKawariamiLog(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Cut tree trunk / wooden log
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 6, width - 8, height - 12);

    // Wood rings on cut face
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(width / 2, 6, width * 0.4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green leaves sprouting from log
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(width - 4, 10, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Pickup: Chakra Orb
  static drawChakraOrb(ctx, x, y, size, t) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    const pulse = Math.sin(t * 8) * 3;

    // Glowing cyan sphere
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, size / 2 + pulse);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#26e6e6');
    grad.addColorStop(0.9, '#0284c7');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.65, size * 0.25, t * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Projectile: Flying Shuriken
  static drawShuriken(ctx, proj, t) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(t * 28);

    const s = proj.size || 10;
    // 4 points star
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.3, -s * 0.3);
    ctx.lineTo(s, 0);
    ctx.lineTo(s * 0.3, s * 0.3);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.3, s * 0.3);
    ctx.lineTo(-s, 0);
    ctx.lineTo(-s * 0.3, -s * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center hole
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Projectile: Flying Fireball (Katon)
  static drawFireball(ctx, proj, t) {
    ctx.save();
    ctx.translate(proj.x, proj.y);

    const r = proj.size || 28;
    const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#facc15');
    grad.addColorStop(0.7, '#ea580c');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Trailing flame tails
    ctx.fillStyle = 'rgba(234, 88, 12, 0.7)';
    for (let i = 0; i < 4; i++) {
      const ty = (i - 1.5) * 8;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, ty);
      ctx.lineTo(-r * 1.5 - Math.sin(t * 20 + i) * 10, ty + 2);
      ctx.lineTo(-r * 0.5, ty + 4);
      ctx.fill();
    }

    ctx.restore();
  }

  // Projectile: Water Dragon Wave (Zabuza)
  static drawWaterDragon(ctx, proj, t) {
    ctx.save();
    ctx.translate(proj.x, proj.y);

    const grad = ctx.createLinearGradient(0, -20, 0, 20);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#075985');

    ctx.fillStyle = grad;
    // Dragon wave head
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.quadraticCurveTo(-10, -30, -50, -10);
    ctx.lineTo(-50, 10);
    ctx.quadraticCurveTo(-10, 30, 30, 0);
    ctx.closePath();
    ctx.fill();

    // Dragon glowing eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(15, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Projectile: Black Receiver Spear (Pain)
  static drawBlackReceiver(ctx, proj) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-20, -3, 40, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(15, -1, 5, 2); // glowing tip
    ctx.restore();
  }
}
