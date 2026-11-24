/**
 * NARUTO NINJA RUN - Entities & Physics
 * Player, Obstacles, Enemies, Projectiles, Pickups, and Parallax Background.
 */

// Character Definitions and Configs
const SHINOBI_ROSTER = {
  naruto: {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Hero of the Hidden Leaf',
    avatar: '🍥',
    baseHp: 100,
    baseChakra: 100,
    speedMod: 1.0,
    jumpPower: -16.5,
    passiveDesc: 'Nine-Tails Vitality: Slowly regenerates HP over time. Collects ramen for bonus points.',
    j1: { id: 'clones', name: 'CLONE DASH', cost: 30, cd: 6, icon: '🌀' },
    j2: { id: 'rasengan', name: 'RASENGAN', cost: 50, cd: 8, icon: '🔵' },
    ult: { id: 'kyuubi', name: 'NINE-TAILS CLOAK', cost: 100, cd: 16, icon: '🦊' }
  },
  sasuke: {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'Avenger of the Uchiha',
    avatar: '⚡',
    baseHp: 90,
    baseChakra: 110,
    speedMod: 1.05,
    jumpPower: -16.8,
    passiveDesc: 'Sharingan Perception: Shurikens pierce through multiple targets with higher damage.',
    j1: { id: 'fireball', name: 'FIREBALL JUTSU', cost: 30, cd: 5, icon: '🔥' },
    j2: { id: 'chidori', name: 'CHIDORI', cost: 50, cd: 8, icon: '⚡' },
    ult: { id: 'kirin', name: 'KIRIN THUNDER', cost: 100, cd: 15, icon: '🐉' }
  },
  kakashi: {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'The Copy Ninja',
    avatar: '👁️',
    baseHp: 95,
    baseChakra: 105,
    speedMod: 1.0,
    jumpPower: -16.5,
    passiveDesc: 'Tactical Genius: Starts with +1 Kawariami Substitution Log and recharges logs faster.',
    j1: { id: 'kamui', name: 'KAMUI WARP', cost: 40, cd: 7, icon: '🌀' },
    j2: { id: 'raikiri', name: 'LIGHTNING BLADE', cost: 45, cd: 7, icon: '⚡' },
    ult: { id: 'kamui_shuriken', name: 'KAMUI STORM', cost: 100, cd: 15, icon: '⭐' }
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Haruno',
    title: 'Medical Kunoichi Master',
    avatar: '🌸',
    baseHp: 120,
    baseChakra: 95,
    speedMod: 0.98,
    jumpPower: -16.2,
    passiveDesc: 'Medical Expertise: Ramen heals 50% more HP, and ground shockwaves destroy all traps.',
    j1: { id: 'shanaro', name: 'CHERRY IMPACT', cost: 35, cd: 6, icon: '💥' },
    j2: { id: 'heal', name: 'HEALING PALM', cost: 40, cd: 9, icon: '💚' },
    ult: { id: 'byakugou', name: '100 HEALINGS', cost: 100, cd: 16, icon: '💎' }
  },
  lee: {
    id: 'lee',
    name: 'Rock Lee',
    title: 'The Handsome Devil of Leaf',
    avatar: '🍃',
    baseHp: 110,
    baseChakra: 100,
    speedMod: 1.15,
    jumpPower: -18.2, // highest leap
    passiveDesc: 'Weights Dropped: Highest jump, quickest slide, and lowest jutsu stamina costs!',
    j1: { id: 'senpuu', name: 'LEAF HURRICANE', cost: 25, cd: 4, icon: '🌪️' },
    j2: { id: 'lotus', name: 'PRIMARY LOTUS', cost: 45, cd: 7, icon: '💥' },
    ult: { id: 'gates', name: 'EIGHT GATES', cost: 100, cd: 15, icon: '🔥' }
  }
};

// ==========================================
// PLAYER CLASS
// ==========================================
class Player {
  constructor(characterId = 'naruto', upgrades = {}) {
    this.characterId = characterId;
    this.config = SHINOBI_ROSTER[characterId] || SHINOBI_ROSTER.naruto;

    // Upgrades modifiers
    const hpBoost = (upgrades.hpLevel || 0) * 15;
    const chakraBoost = (upgrades.chakraLevel || 0) * 15;
    const attackBoost = (upgrades.attackLevel || 0) * 0.2;

    this.maxHp = this.config.baseHp + hpBoost;
    this.hp = this.maxHp;

    this.maxChakra = this.config.baseChakra + chakraBoost;
    this.chakra = this.maxChakra;

    this.damageMultiplier = 1.0 + attackBoost;

    // Position and Physics
    this.width = 46;
    this.height = 70;
    this.normalHeight = 70;
    this.slideHeight = 36;

    this.x = 140;
    this.groundY = 560; // top edge of ground path
    this.y = this.groundY - this.height;

    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.78;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2; // Double Jump!

    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.55; // seconds

    this.facing = 1;

    // Substitution logs
    this.substitutionLogs = this.characterId === 'kakashi' ? 3 : 2;

    // Cooldown timers
    this.j1Cooldown = 0;
    this.j2Cooldown = 0;
    this.ultCooldown = 0;

    // Active visual states
    this.activeJutsuVisual = null; // 'rasengan' | 'chidori'
    this.jutsuVisualTimer = 0;

    // Ultimate modes
    this.isNineTails = false;
    this.isEightGates = false;
    this.isSusanoo = false;
    this.ultDurationTimer = 0;

    this.isInvulnerable = false;
    this.invulnerableTimer = 0;

    // Clones active (absorbing hits)
    this.clonesActive = false;
    this.clonesTimer = 0;

    // Natural regeneration
    this.regenTimer = 0;
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.isSliding = false;
      this.height = this.normalHeight;

      if (this.jumpCount === 0) {
        this.vy = this.config.jumpPower;
        window.shinobiAudio.playJump();
      } else {
        this.vy = this.config.jumpPower * 0.9;
        window.shinobiAudio.playDoubleJump();
      }

      this.jumpCount++;
      this.isGrounded = false;
      return true;
    }
    return false;
  }

  slide() {
    if (this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      this.height = this.slideHeight;
      this.y = this.groundY - this.slideHeight;
      window.shinobiAudio.playSlide();
      return true;
    }
    return false;
  }

  throwShuriken(projectiles, particles) {
    window.shinobiAudio.playShuriken();

    const projY = this.isSliding ? this.y + 12 : this.y + 24;
    const pierce = this.characterId === 'sasuke' ? 2 : 1;
    const damage = 25 * this.damageMultiplier;

    projectiles.push(new Projectile(
      this.x + this.width + 6,
      projY,
      18, // speed
      0,
      'shuriken',
      damage,
      pierce,
      'player'
    ));

    particles.spawnSparks(this.x + this.width, projY, 4, '#cbd5e1');
  }

  castJutsu1(projectiles, particles, enemies, obstacles, boss) {
    const cost = this.config.j1.cost;
    if (this.chakra < cost || this.j1Cooldown > 0) return false;

    this.chakra -= cost;
    this.j1Cooldown = this.config.j1.cd;

    switch (this.config.j1.id) {
      case 'clones': // Naruto Shadow Clone Dash
        this.clonesActive = true;
        this.clonesTimer = 4.5;
        window.shinobiAudio.playSubstitution();
        particles.spawnSubstitutionSmoke(this.x + 30, this.y + 20, 20);
        break;

      case 'fireball': // Sasuke Katon Fireball
        window.shinobiAudio.playFireball();
        projectiles.push(new Projectile(
          this.x + this.width + 10,
          this.y + 20,
          14,
          0,
          'fireball',
          80 * this.damageMultiplier,
          99, // destroys whole line
          'player'
        ));
        particles.spawnExplosion(this.x + this.width + 10, this.y + 20, 10);
        break;

      case 'kamui': // Kakashi Kamui Warp
        window.shinobiAudio.playRasengan();
        // Sucks all obstacles currently on screen into dimension
        obstacles.forEach(o => {
          particles.spawnSubstitutionSmoke(o.x + o.width / 2, o.y + o.height / 2, 12);
          o.destroyed = true;
        });
        enemies.forEach(e => {
          particles.spawnSubstitutionSmoke(e.x + e.width / 2, e.y + e.height / 2, 12);
          e.destroyed = true;
        });
        if (boss) boss.takeDamage(70 * this.damageMultiplier);
        break;

      case 'shanaro': // Sakura Cherry Impact Ground Slam
        window.shinobiAudio.playExplosion();
        particles.spawnShockwave(this.x + 60, this.groundY, '#ec4899');
        particles.spawnDust(this.x + 60, this.groundY, 15, '#f472b6');
        obstacles.filter(o => o.isGround).forEach(o => o.destroyed = true);
        enemies.forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(75 * this.damageMultiplier);
        break;

      case 'senpuu': // Rock Lee Leaf Hurricane
        window.shinobiAudio.playHit();
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.2;
        this.activeJutsuVisual = null;
        particles.spawnShockwave(this.x + 40, this.y + 30, '#22c55e');
        // Dash through obstacles
        obstacles.filter(o => o.x > this.x && o.x < this.x + 300).forEach(o => o.destroyed = true);
        enemies.filter(e => e.x > this.x && e.x < this.x + 300).forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(60 * this.damageMultiplier);
        break;
    }

    return true;
  }

  castJutsu2(projectiles, particles, enemies, obstacles, boss) {
    const cost = this.config.j2.cost;
    if (this.chakra < cost || this.j2Cooldown > 0) return false;

    this.chakra -= cost;
    this.j2Cooldown = this.config.j2.cd;

    switch (this.config.j2.id) {
      case 'rasengan': // Naruto Rasengan
        window.shinobiAudio.playRasengan();
        this.activeJutsuVisual = 'rasengan';
        this.jutsuVisualTimer = 1.6;
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.6;
        particles.spawnShockwave(this.x + 40, this.y + 20, '#38bdf8');
        // Obliterates everything in forward path
        obstacles.filter(o => o.x > this.x && o.x < this.x + 400).forEach(o => o.destroyed = true);
        enemies.filter(e => e.x > this.x && e.x < this.x + 400).forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(120 * this.damageMultiplier);
        break;

      case 'chidori': // Sasuke Chidori
        window.shinobiAudio.playChidori();
        this.activeJutsuVisual = 'chidori';
        this.jutsuVisualTimer = 1.6;
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.6;
        particles.spawnLightning(this.x + 50, this.y + 20, 15);
        obstacles.filter(o => o.x > this.x && o.x < this.x + 420).forEach(o => o.destroyed = true);
        enemies.filter(e => e.x > this.x && e.x < this.x + 420).forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(130 * this.damageMultiplier);
        break;

      case 'raikiri': // Kakashi Lightning Blade
        window.shinobiAudio.playChidori();
        this.activeJutsuVisual = 'chidori';
        this.jutsuVisualTimer = 1.6;
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.6;
        particles.spawnLightning(this.x + 50, this.y + 20, 15);
        obstacles.filter(o => o.x > this.x && o.x < this.x + 420).forEach(o => o.destroyed = true);
        enemies.filter(e => e.x > this.x && e.x < this.x + 420).forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(130 * this.damageMultiplier);
        break;

      case 'heal': // Sakura Healing Palm
        window.shinobiAudio.playPickupRamen();
        this.hp = Math.min(this.maxHp, this.hp + 45);
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.5;
        particles.spawnChakraFlames(this.x + 20, this.y + 20, '#10b981', 12);
        break;

      case 'lotus': // Rock Lee Primary Lotus
        window.shinobiAudio.playExplosion();
        this.isInvulnerable = true;
        this.invulnerableTimer = 2.0;
        this.vy = -18; // slingshot up
        particles.spawnShockwave(this.x + 30, this.groundY, '#ea580c');
        if (boss) boss.takeDamage(140 * this.damageMultiplier);
        break;
    }

    return true;
  }

  castUltimate(projectiles, particles, enemies, obstacles, boss) {
    const cost = this.config.ult.cost;
    if (this.chakra < cost || this.ultCooldown > 0) return false;

    this.chakra -= cost;
    this.ultCooldown = this.config.ult.cd;

    window.shinobiAudio.playBossDefeat();

    switch (this.config.ult.id) {
      case 'kyuubi': // Nine-Tails Cloak
        this.isNineTails = true;
        this.ultDurationTimer = 7.0;
        this.isInvulnerable = true;
        this.invulnerableTimer = 7.0;
        particles.spawnExplosion(this.x + 30, this.y + 30, 30);
        if (boss) boss.takeDamage(220 * this.damageMultiplier);
        break;

      case 'kirin': // Sasuke Kirin
        this.ultDurationTimer = 6.0;
        this.isInvulnerable = true;
        this.invulnerableTimer = 6.0;
        particles.spawnLightning(640, 360, 40);
        obstacles.forEach(o => o.destroyed = true);
        enemies.forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(260 * this.damageMultiplier);
        break;

      case 'kamui_shuriken': // Kakashi Kamui Storm
        this.ultDurationTimer = 5.0;
        this.isInvulnerable = true;
        this.invulnerableTimer = 5.0;
        obstacles.forEach(o => o.destroyed = true);
        enemies.forEach(e => e.destroyed = true);
        if (boss) boss.takeDamage(250 * this.damageMultiplier);
        break;

      case 'byakugou': // Sakura 100 Healings
        this.hp = this.maxHp;
        this.ultDurationTimer = 7.0;
        this.isInvulnerable = true;
        this.invulnerableTimer = 7.0;
        particles.spawnChakraFlames(this.x + 20, this.y + 20, '#c084fc', 25);
        if (boss) boss.takeDamage(240 * this.damageMultiplier);
        break;

      case 'gates': // Rock Lee Eight Gates
        this.isEightGates = true;
        this.ultDurationTimer = 7.5;
        this.isInvulnerable = true;
        this.invulnerableTimer = 7.5;
        particles.spawnShockwave(this.x + 30, this.groundY, '#22c55e');
        if (boss) boss.takeDamage(280 * this.damageMultiplier);
        break;
    }

    return true;
  }

  takeDamage(amount, particles) {
    if (this.isInvulnerable) return false;

    // Check Clones first
    if (this.clonesActive) {
      this.clonesActive = false;
      this.clonesTimer = 0;
      window.shinobiAudio.playSubstitution();
      particles.spawnSubstitutionSmoke(this.x + 20, this.y + 20, 20);
      this.isInvulnerable = true;
      this.invulnerableTimer = 1.0;
      return 'clone';
    }

    // Check Kawariami Substitution Log
    if (this.substitutionLogs > 0) {
      this.substitutionLogs--;
      window.shinobiAudio.playSubstitution();
      particles.spawnSubstitutionSmoke(this.x + 20, this.y + 20, 30);
      particles.spawnDust(this.x + 20, this.groundY, 8, '#78350f');

      this.isInvulnerable = true;
      this.invulnerableTimer = 1.5;
      return 'substitution';
    }

    // Actual Damage
    this.hp = Math.max(0, this.hp - amount);
    window.shinobiAudio.playHit();
    particles.spawnSparks(this.x + 20, this.y + 20, 12, '#ef4444');

    this.isInvulnerable = true;
    this.invulnerableTimer = 1.2;
    return 'hit';
  }

  update(dt, particles) {
    // Cooldown updates
    if (this.j1Cooldown > 0) this.j1Cooldown = Math.max(0, this.j1Cooldown - dt);
    if (this.j2Cooldown > 0) this.j2Cooldown = Math.max(0, this.j2Cooldown - dt);
    if (this.ultCooldown > 0) this.ultCooldown = Math.max(0, this.ultCooldown - dt);

    if (this.jutsuVisualTimer > 0) {
      this.jutsuVisualTimer -= dt;
      if (this.jutsuVisualTimer <= 0) this.activeJutsuVisual = null;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) this.isInvulnerable = false;
    }

    if (this.ultDurationTimer > 0) {
      this.ultDurationTimer -= dt;
      if (this.ultDurationTimer <= 0) {
        this.isNineTails = false;
        this.isEightGates = false;
        this.isSusanoo = false;
      }
    }

    if (this.clonesTimer > 0) {
      this.clonesTimer -= dt;
      if (this.clonesTimer <= 0) this.clonesActive = false;
    }

    // Passive regeneration & chakra trickle
    this.chakra = Math.min(this.maxChakra, this.chakra + 7 * dt);
    if (this.characterId === 'naruto') {
      this.regenTimer += dt;
      if (this.regenTimer >= 2.5) {
        this.hp = Math.min(this.maxHp, this.hp + 2);
        this.regenTimer = 0;
      }
    }

    // Sliding timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      particles.spawnDust(this.x, this.groundY - 2, 2, '#cbd5e1');
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.height = this.normalHeight;
        this.y = this.groundY - this.normalHeight;
      }
    }

    // Jump / Gravity Physics
    if (!this.isGrounded) {
      this.vy += this.gravity;
      this.y += this.vy;

      if (this.y + this.height >= this.groundY) {
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpCount = 0;
        particles.spawnDust(this.x + 10, this.groundY, 4, '#cbd5e1');
      }
    }

    // Footstep dust when running on ground
    if (this.isGrounded && !this.isSliding && Math.random() < 0.25) {
      particles.spawnDust(this.x - 5, this.groundY, 1, '#94a3b8');
    }

    // Ultimate particle auras
    if (this.isNineTails) {
      particles.spawnChakraFlames(this.x + 20, this.y + 30, '#ef4444', 2);
    } else if (this.isEightGates) {
      particles.spawnChakraFlames(this.x + 20, this.y + 30, '#22c55e', 3);
    }
  }
}

// ==========================================
// OBSTACLE CLASS
// ==========================================
class Obstacle {
  constructor(x, groundY, type = 'spikes') {
    this.type = type; // 'spikes' | 'bomb' | 'shuriken' | 'tripwire'
    this.destroyed = false;

    if (type === 'spikes') {
      this.width = 44;
      this.height = 36;
      this.x = x;
      this.y = groundY - this.height;
      this.isGround = true;
    } else if (type === 'bomb') {
      this.width = 38;
      this.height = 38;
      this.x = x;
      this.y = groundY - this.height;
      this.isGround = true;
    } else if (type === 'shuriken') {
      this.width = 50;
      this.height = 50;
      this.x = x;
      // High flying hazard: must duck or jump
      this.y = groundY - 80;
      this.isGround = false;
    } else if (type === 'tripwire') {
      this.width = 65;
      this.height = 42;
      this.x = x;
      this.y = groundY - 65; // must slide under!
      this.isGround = false;
    }
  }

  update(speed, dt) {
    this.x -= speed * dt * 60;
  }

  draw(ctx, animTime) {
    if (this.destroyed) return;
    switch (this.type) {
      case 'bomb':
        ShinobiRenderer.drawPaperBomb(ctx, this.x, this.y, this.width, this.height, animTime);
        break;
      case 'shuriken':
        ShinobiRenderer.drawFumaShuriken(ctx, this.x, this.y, this.width, animTime);
        break;
      case 'tripwire':
        ShinobiRenderer.drawTripwire(ctx, this.x, this.y, this.width, this.height);
        break;
      case 'spikes':
      default:
        ShinobiRenderer.drawKunaiSpikes(ctx, this.x, this.y, this.width, this.height);
        break;
    }
  }

  getBounds() {
    return {
      x: this.x + 4,
      y: this.y + 4,
      width: this.width - 8,
      height: this.height - 8
    };
  }
}

// ==========================================
// ROGUE ENEMY CLASS
// ==========================================
class Enemy {
  constructor(x, groundY) {
    this.width = 40;
    this.height = 65;
    this.x = x;
    this.y = groundY - this.height;
    this.hp = 40;
    this.destroyed = false;
  }

  update(worldSpeed, dt) {
    // Runs towards player slightly faster than world
    this.x -= (worldSpeed + 2.5) * dt * 60;
  }

  draw(ctx, animTime) {
    if (this.destroyed) return;
    ShinobiRenderer.drawRogueNinja(ctx, this, animTime);
  }

  getBounds() {
    return {
      x: this.x + 4,
      y: this.y + 4,
      width: this.width - 8,
      height: this.height - 8
    };
  }
}

// ==========================================
// PICKUP CLASS (Ramen, Scroll, Log, Chakra)
// ==========================================
class Pickup {
  constructor(x, y, type = 'scroll') {
    this.x = x;
    this.y = y;
    this.type = type; // 'ramen' | 'scroll' | 'log' | 'chakra'
    this.width = 34;
    this.height = 34;
    this.collected = false;
  }

  update(worldSpeed, dt) {
    this.x -= worldSpeed * dt * 60;
  }

  draw(ctx, animTime) {
    if (this.collected) return;
    switch (this.type) {
      case 'ramen':
        ShinobiRenderer.drawRamenBowl(ctx, this.x, this.y, this.width, this.height, animTime);
        break;
      case 'log':
        ShinobiRenderer.drawKawariamiLog(ctx, this.x, this.y, this.width, this.height);
        break;
      case 'chakra':
        ShinobiRenderer.drawChakraOrb(ctx, this.x, this.y, this.width, animTime);
        break;
      case 'scroll':
      default:
        ShinobiRenderer.drawScroll(ctx, this.x, this.y, this.width, this.height, animTime);
        break;
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// ==========================================
// PROJECTILE CLASS
// ==========================================
class Projectile {
  constructor(x, y, vx, vy, type, damage, pierce = 1, owner = 'player') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type; // 'shuriken' | 'fireball' | 'water_dragon' | 'black_receiver'
    this.damage = damage;
    this.pierce = pierce;
    this.owner = owner; // 'player' | 'boss'
    this.size = type === 'fireball' ? 24 : (type === 'water_dragon' ? 32 : 10);
    this.active = true;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
  }

  draw(ctx, animTime) {
    if (!this.active) return;
    switch (this.type) {
      case 'fireball':
        ShinobiRenderer.drawFireball(ctx, this, animTime);
        break;
      case 'water_dragon':
        ShinobiRenderer.drawWaterDragon(ctx, this, animTime);
        break;
      case 'black_receiver':
        ShinobiRenderer.drawBlackReceiver(ctx, this);
        break;
      case 'shuriken':
      default:
        ShinobiRenderer.drawShuriken(ctx, this, animTime);
        break;
    }
  }

  getBounds() {
    return {
      x: this.x - this.size,
      y: this.y - this.size,
      width: this.size * 2,
      height: this.size * 2
    };
  }
}

// ==========================================
// PARALLAX BACKGROUND
// ==========================================
class ParallaxBackground {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.skyOffset = 0;
    this.mountainOffset = 0;
    this.pagodaOffset = 0;
    this.treeOffset = 0;
    this.groundOffset = 0;
  }

  update(speed, dt) {
    const s = speed * dt * 60;
    this.skyOffset = (this.skyOffset + s * 0.05) % this.width;
    this.mountainOffset = (this.mountainOffset + s * 0.15) % this.width;
    this.pagodaOffset = (this.pagodaOffset + s * 0.4) % this.width;
    this.treeOffset = (this.treeOffset + s * 0.7) % this.width;
    this.groundOffset = (this.groundOffset + s) % 60;
  }

  draw(ctx, biome = 'leaf') {
    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.7);
    if (biome === 'mist') {
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(0.6, '#475569');
      skyGrad.addColorStop(1, '#64748b');
    } else if (biome === 'sunset') {
      skyGrad.addColorStop(0, '#4c0519');
      skyGrad.addColorStop(0.4, '#9f1239');
      skyGrad.addColorStop(0.8, '#f97316');
      skyGrad.addColorStop(1, '#fde047');
    } else {
      // Classic Konoha Afternoon
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(0.5, '#0284c7');
      skyGrad.addColorStop(1, '#bae6fd');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. SUN / MOON
    ctx.save();
    ctx.fillStyle = biome === 'sunset' ? '#f43f5e' : '#fef08a';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(this.width * 0.8, 120, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. FAR MOUNTAINS & HOKAGE ROCK SILHOUETTE
    ctx.fillStyle = biome === 'mist' ? '#334155' : '#1e3a8a';
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 3; i++) {
      const baseX = i * this.width - this.mountainOffset;
      ctx.beginPath();
      ctx.moveTo(baseX, 560);
      ctx.lineTo(baseX + 200, 320);
      ctx.lineTo(baseX + 450, 420);
      ctx.lineTo(baseX + 700, 260); // Hokage mountain peak
      ctx.lineTo(baseX + 900, 380);
      ctx.lineTo(baseX + 1150, 300);
      ctx.lineTo(baseX + 1280, 560);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 4. MIDGROUND PAGODAS & TORII GATES
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 3; i++) {
      const baseX = i * 600 - this.pagodaOffset;
      // Torii Gate
      ctx.fillRect(baseX + 100, 410, 10, 150);
      ctx.fillRect(baseX + 180, 410, 10, 150);
      ctx.fillRect(baseX + 80, 415, 130, 14); // Crossbeam
      ctx.fillRect(baseX + 90, 435, 110, 10);

      // Pagoda silhouette
      ctx.fillRect(baseX + 380, 440, 70, 120);
      // Roof tiers
      ctx.beginPath();
      ctx.moveTo(baseX + 360, 470);
      ctx.lineTo(baseX + 415, 430);
      ctx.lineTo(baseX + 470, 470);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(baseX + 370, 430);
      ctx.lineTo(baseX + 415, 390);
      ctx.lineTo(baseX + 460, 430);
      ctx.fill();
    }

    // 5. FOREGROUND GROUND PATH (Stone tiles and earth)
    const groundY = 560;
    // Dark earth base
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, groundY, this.width, this.height - groundY);

    // Stone pathway surface
    const pathGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 25);
    pathGrad.addColorStop(0, '#57534e');
    pathGrad.addColorStop(1, '#292524');
    ctx.fillStyle = pathGrad;
    ctx.fillRect(0, groundY, this.width, 24);

    // Scrolling stone plank dividers & speed marks
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    for (let x = -this.groundOffset; x < this.width + 60; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 20, groundY + 24);
      ctx.stroke();
    }

    // Green moss / grass crest along path edge
    ctx.fillStyle = '#15803d';
    for (let x = -this.groundOffset; x < this.width + 30; x += 30) {
      ctx.beginPath();
      ctx.arc(x, groundY + 2, 8, Math.PI, 0);
      ctx.fill();
    }
  }
}
