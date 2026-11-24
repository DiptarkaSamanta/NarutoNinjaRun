/**
 * NARUTO NINJA RUN - Boss Fights Engine
 * Zabuza, Gaara, Orochimaru, Pain, Madara - Attack behaviors, phases, dialogue
 */

const BOSS_CONFIGS = [
  {
    type: 'zabuza',
    name: 'ZABUZA MOMOCHI',
    title: 'Demon of the Hidden Mist',
    triggerDistance: 700,
    maxHp: 450,
    bountyScrolls: 8,
    bountyScore: 4000,
    quote: '"You talk too much kid... Prepare to meet the Demon of the Mist!"'
  },
  {
    type: 'gaara',
    name: 'GAARA OF THE SAND',
    title: 'Weapon of the Sand',
    triggerDistance: 1800,
    maxHp: 750,
    bountyScrolls: 12,
    bountyScore: 7000,
    quote: '"My mother... is demanding more blood!"'
  },
  {
    type: 'orochimaru',
    name: 'OROCHIMARU',
    title: 'Legendary Sannin of the Snake',
    triggerDistance: 3200,
    maxHp: 1100,
    bountyScrolls: 16,
    bountyScore: 11000,
    quote: '"Darkness is the only place true power can bloom... Hehehe."'
  },
  {
    type: 'pain',
    name: 'PAIN (DEVA PATH)',
    title: 'God of the Six Paths',
    triggerDistance: 5000,
    maxHp: 1600,
    bountyScrolls: 20,
    bountyScore: 16000,
    quote: '"Feel pain. Contemplate pain. Know pain... Shinra Tensei!"'
  },
  {
    type: 'madara',
    name: 'MADARA UCHIHA',
    title: 'Ghost of the Uchiha',
    triggerDistance: 7500,
    maxHp: 2400,
    bountyScrolls: 30,
    bountyScore: 25000,
    quote: '"Wake up to reality! Nothing ever goes as planned in this cursed world!"'
  }
];

class Boss {
  constructor(config) {
    this.config = config;
    this.type = config.type;
    this.name = config.name;
    this.title = config.title;
    this.maxHp = config.maxHp;
    this.hp = config.maxHp;

    this.width = 75;
    this.height = 105;
    this.groundY = 560;

    // Starts off-screen right and glides into position
    this.x = 1350;
    this.targetX = 1050; // combat position
    this.y = this.groundY - this.height;

    this.isAttacking = false;
    this.attackTimer = 2.0; // cooldown between attacks
    this.defeated = false;

    // Boss special state
    this.hasSandShield = this.type === 'gaara';
    this.shieldHp = 120;
  }

  takeDamage(amount) {
    if (this.hasSandShield) {
      this.shieldHp -= amount;
      if (this.shieldHp <= 0) {
        this.hasSandShield = false;
        window.shinobiAudio.playExplosion();
      }
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    window.shinobiAudio.playHit();
    if (this.hp <= 0) {
      this.defeated = true;
    }
  }

  update(dt, player, projectiles, obstacles, particles) {
    // Glide towards battle position
    if (this.x > this.targetX) {
      this.x -= 120 * dt;
    }

    // Floating bobbing motion
    this.y = (this.groundY - this.height) + Math.sin(Date.now() * 0.003) * 6;

    // Attack loop
    this.attackTimer -= dt;
    if (this.attackTimer <= 0 && !this.defeated) {
      this.executeAttack(player, projectiles, obstacles, particles);
      this.attackTimer = 2.8 + Math.random() * 1.5;
    }
  }

  executeAttack(player, projectiles, obstacles, particles) {
    this.isAttacking = true;
    setTimeout(() => { this.isAttacking = false; }, 800);

    switch (this.type) {
      case 'zabuza':
        // Water Dragon surge or Mist blade
        window.shinobiAudio.playFireball();
        projectiles.push(new Projectile(
          this.x - 20,
          this.groundY - 50,
          -11, // moves toward player
          0,
          'water_dragon',
          30,
          1,
          'boss'
        ));
        particles.spawnDust(this.x, this.groundY, 12, '#38bdf8');
        break;

      case 'gaara':
        // Sand Shurikens spread
        window.shinobiAudio.playShuriken();
        for (let i = -1; i <= 1; i++) {
          projectiles.push(new Projectile(
            this.x - 10,
            this.groundY - 60 + i * 25,
            -12,
            i * 1.2,
            'shuriken',
            25,
            1,
            'boss'
          ));
        }
        particles.spawnDust(this.x, this.groundY, 10, '#f59e0b');
        break;

      case 'orochimaru':
        // Striking snakes: creates ground obstacles + flying senbon
        window.shinobiAudio.playChidori();
        obstacles.push(new Obstacle(1290, this.groundY, 'spikes'));
        projectiles.push(new Projectile(
          this.x - 10,
          this.groundY - 80,
          -13,
          0,
          'black_receiver',
          35,
          1,
          'boss'
        ));
        break;

      case 'pain':
        // Shinra Tensei shockwave
        window.shinobiAudio.playExplosion();
        particles.spawnShockwave(this.x - 20, this.groundY - 40, '#c084fc');
        projectiles.push(new Projectile(
          this.x - 20,
          this.groundY - 60,
          -14,
          0,
          'black_receiver',
          40,
          1,
          'boss'
        ));
        // Repels projectiles
        projectiles.filter(p => p.owner === 'player').forEach(p => p.vx = -p.vx);
        break;

      case 'madara':
        // Majestic Destroyer Fireball
        window.shinobiAudio.playFireball();
        projectiles.push(new Projectile(
          this.x - 20,
          this.groundY - 55,
          -12,
          0,
          'fireball',
          45,
          1,
          'boss'
        ));
        particles.spawnExplosion(this.x - 20, this.groundY - 55, 15);
        break;
    }
  }

  draw(ctx, animTime) {
    ShinobiRenderer.drawBoss(ctx, this, animTime);
  }

  getBounds() {
    return {
      x: this.x + 8,
      y: this.y + 8,
      width: this.width - 16,
      height: this.height - 16
    };
  }
}

// ==========================================
// BOSS MANAGER
// ==========================================
class BossManager {
  constructor() {
    this.currentBossIndex = 0;
    this.activeBoss = null;
    this.warningActive = false;
    this.warningTimer = 0;
    this.bossDefeatedCount = 0;
  }

  checkBossSpawn(distance) {
    if (this.activeBoss || this.warningActive) return null;

    const config = BOSS_CONFIGS[this.currentBossIndex];
    if (config && distance >= config.triggerDistance) {
      this.warningActive = true;
      this.warningTimer = 3.5; // Warning siren banner duration
      window.shinobiAudio.playBossWarning();
      return config;
    }
    return null;
  }

  update(dt, distance, player, projectiles, obstacles, particles, pickups) {
    // Handle Warning Banner
    if (this.warningActive) {
      this.warningTimer -= dt;
      if (this.warningTimer <= 0) {
        this.warningActive = false;
        // Spawn active boss
        const config = BOSS_CONFIGS[this.currentBossIndex];
        if (config) {
          this.activeBoss = new Boss(config);
          window.shinobiAudio.playBgm('boss');
        }
      }
    }

    // Update Active Boss
    if (this.activeBoss) {
      this.activeBoss.update(dt, player, projectiles, obstacles, particles);

      // Check Boss Defeat
      if (this.activeBoss.defeated) {
        const defeatedBoss = this.activeBoss;
        this.bossDefeatedCount++;
        this.currentBossIndex = (this.currentBossIndex + 1) % BOSS_CONFIGS.length;
        this.activeBoss = null;

        // Fanfare & Effects
        window.shinobiAudio.playBossDefeat();
        particles.spawnExplosion(defeatedBoss.x + defeatedBoss.width / 2, defeatedBoss.y + defeatedBoss.height / 2, 45);

        // Cascade of golden reward scrolls
        for (let i = 0; i < defeatedBoss.config.bountyScrolls; i++) {
          pickups.push(new Pickup(
            defeatedBoss.x + Math.random() * 200 - 100,
            defeatedBoss.groundY - 40 - Math.random() * 80,
            'scroll'
          ));
        }

        // Return to normal run BGM
        window.shinobiAudio.playBgm('normal');

        return {
          name: defeatedBoss.name,
          score: defeatedBoss.config.bountyScore,
          scrolls: defeatedBoss.config.bountyScrolls
        };
      }
    }

    return null;
  }
}
