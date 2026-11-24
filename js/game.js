/**
 * NARUTO NINJA RUN - Master Game Loop & UI Controller
 */

class ShinobiGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Fixed virtual canvas dimensions
    this.V_WIDTH = 1280;
    this.V_HEIGHT = 720;
    this.groundY = 560;

    // Game States: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.state = 'MENU';

    // Player & World
    this.selectedCharacter = 'naruto';
    this.player = null;
    this.background = new ParallaxBackground(this.V_WIDTH, this.V_HEIGHT);
    this.particles = new ParticleSystem();
    this.bossManager = new BossManager();

    // Game Entities
    this.obstacles = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    // Timers & Spawners
    this.baseSpeed = 7.0;
    this.worldSpeed = 7.0;
    this.distance = 0;
    this.score = 0;
    this.scrollsGatheredThisRun = 0;
    this.obstacleSpawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.pickupSpawnTimer = 0;
    this.animTime = 0;
    this.lastTime = 0;

    // Upgrades & Saved Progress
    this.savedData = this.loadSaveData();

    // Announcements
    this.announcementTimer = 0;

    // Biome
    this.currentBiome = 'leaf';

    // Init UI and Listeners
    this.cacheDomElements();
    this.bindEvents();
    this.updateMenuStats();
    this.renderSelectedNinjaPreview();

    // Start render animation frame
    requestAnimationFrame((t) => this.loop(t));
  }

  // ==========================================
  // STORAGE & SAVE DATA
  // ==========================================
  loadSaveData() {
    try {
      const data = localStorage.getItem('naruto_run_save');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage read failed", e);
    }
    return {
      highScore: 0,
      bestDistance: 0,
      totalScrolls: 0,
      upgrades: {
        hpLevel: 0,
        chakraLevel: 0,
        attackLevel: 0
      },
      unlockedNinjas: ['naruto', 'sasuke', 'kakashi', 'sakura', 'lee']
    };
  }

  saveData() {
    try {
      localStorage.setItem('naruto_run_save', JSON.stringify(this.savedData));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }

  // ==========================================
  // DOM CACHING
  // ==========================================
  cacheDomElements() {
    this.dom = {
      hud: document.getElementById('hud'),
      hudAvatar: document.getElementById('hud-avatar-icon'),
      hpBarFill: document.getElementById('hp-bar-fill'),
      hpText: document.getElementById('hp-text'),
      chakraBarFill: document.getElementById('chakra-bar-fill'),
      chakraText: document.getElementById('chakra-text'),
      subCount: document.getElementById('sub-count'),
      hudScore: document.getElementById('hud-score'),
      hudDistance: document.getElementById('hud-distance'),
      hudScrolls: document.getElementById('hud-scrolls'),

      bossHud: document.getElementById('boss-hud'),
      bossName: document.getElementById('boss-name'),
      bossTitle: document.getElementById('boss-title'),
      bossBarFill: document.getElementById('boss-bar-fill'),
      bossHpText: document.getElementById('boss-hp-text'),
      bossWarning: document.getElementById('boss-warning'),
      warningBossName: document.getElementById('warning-boss-name'),

      announcement: document.getElementById('announcement'),
      announcementKanji: document.getElementById('announcement-kanji'),
      announcementText: document.getElementById('announcement-text'),

      j1Icon: document.getElementById('j1-icon'),
      j1Name: document.getElementById('j1-name'),
      j1Cost: document.getElementById('j1-cost'),
      j1Cooldown: document.getElementById('j1-cooldown'),

      j2Icon: document.getElementById('j2-icon'),
      j2Name: document.getElementById('j2-name'),
      j2Cost: document.getElementById('j2-cost'),
      j2Cooldown: document.getElementById('j2-cooldown'),

      ultIcon: document.getElementById('ult-icon'),
      ultName: document.getElementById('ult-name'),
      ultCost: document.getElementById('ult-cost'),
      ultCooldown: document.getElementById('ult-cooldown'),

      mainMenu: document.getElementById('main-menu'),
      characterModal: document.getElementById('character-modal'),
      dojoModal: document.getElementById('dojo-modal'),
      helpModal: document.getElementById('help-modal'),
      pauseMenu: document.getElementById('pause-menu'),
      gameOver: document.getElementById('game-over'),

      bestDistance: document.getElementById('best-distance'),
      highScore: document.getElementById('high-score'),
      totalScrolls: document.getElementById('total-scrolls'),
      menuNinjaPortrait: document.getElementById('menu-ninja-portrait'),
      menuNinjaEmoji: document.getElementById('menu-ninja-emoji'),
      menuNinjaName: document.getElementById('menu-ninja-name'),
      menuNinjaTrait: document.getElementById('menu-ninja-trait'),

      charactersContainer: document.getElementById('characters-container'),
      upgradesContainer: document.getElementById('upgrades-container'),
      dojoScrollCount: document.getElementById('dojo-scroll-count'),

      resultDistance: document.getElementById('result-distance'),
      resultScore: document.getElementById('result-score'),
      resultBosses: document.getElementById('result-bosses'),
      resultScrolls: document.getElementById('result-scrolls'),
      gameOverQuote: document.getElementById('game-over-quote'),

      btnSoundToggle: document.getElementById('btn-sound-toggle')
    };
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      // AudioContext auto-unlock
      window.shinobiAudio.ensureContext();

      if (e.repeat) return;

      if (this.state === 'PLAYING') {
        if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
          e.preventDefault();
          this.player.jump();
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          e.preventDefault();
          this.player.slide();
        } else if (e.code === 'KeyJ' || e.code === 'KeyZ') {
          this.player.throwShuriken(this.projectiles, this.particles);
        } else if (e.code === 'KeyK' || e.code === 'KeyX') {
          this.triggerJutsu1();
        } else if (e.code === 'KeyL' || e.code === 'KeyC') {
          this.triggerJutsu2();
        } else if (e.code === 'KeyU' || e.code === 'KeyV') {
          this.triggerUltimate();
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          this.togglePause();
        }
      } else if (this.state === 'MENU') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.startRun();
        }
      } else if (this.state === 'PAUSED') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.togglePause();
        }
      } else if (this.state === 'GAMEOVER') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.startRun();
        }
      }
    });

    // Canvas click throws shuriken during run
    this.canvas.addEventListener('pointerdown', (e) => {
      window.shinobiAudio.ensureContext();
      if (this.state === 'PLAYING') {
        this.player.throwShuriken(this.projectiles, this.particles);
      }
    });

    // Touch / HUD button listeners
    document.getElementById('btn-attack').addEventListener('click', (e) => {
      e.stopPropagation();
      window.shinobiAudio.ensureContext();
      if (this.state === 'PLAYING') this.player.throwShuriken(this.projectiles, this.particles);
    });

    document.getElementById('btn-jutsu1').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state === 'PLAYING') this.triggerJutsu1();
    });

    document.getElementById('btn-jutsu2').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state === 'PLAYING') this.triggerJutsu2();
    });

    document.getElementById('btn-ultimate').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state === 'PLAYING') this.triggerUltimate();
    });

    document.getElementById('btn-jump').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state === 'PLAYING') this.player.jump();
    });

    document.getElementById('btn-slide').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state === 'PLAYING') this.player.slide();
    });

    // Menu buttons
    document.getElementById('btn-start-game').addEventListener('click', () => this.startRun());
    document.getElementById('btn-open-select').addEventListener('click', () => this.openCharacterModal());
    document.getElementById('btn-close-select').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-open-dojo').addEventListener('click', () => this.openDojoModal());
    document.getElementById('btn-close-dojo').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-open-help').addEventListener('click', () => this.openHelpModal());
    document.getElementById('btn-close-help').addEventListener('click', () => this.closeModals());

    // Pause & Game Over buttons
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-restart').addEventListener('click', () => this.startRun());
    document.getElementById('btn-quit').addEventListener('click', () => this.returnToMenu());
    document.getElementById('btn-play-again').addEventListener('click', () => this.startRun());
    document.getElementById('btn-game-over-menu').addEventListener('click', () => this.returnToMenu());

    // Sound toggle
    this.dom.btnSoundToggle.addEventListener('click', () => {
      const isMuted = window.shinobiAudio.toggleMute();
      this.dom.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // ==========================================
  // JUTSU ACTIONS WITH ANNOUNCEMENTS
  // ==========================================
  triggerJutsu1() {
    const success = this.player.castJutsu1(
      this.projectiles,
      this.particles,
      this.enemies,
      this.obstacles,
      this.bossManager.activeBoss
    );
    if (success) {
      this.showAnnouncement('忍', this.player.config.j1.name);
    }
  }

  triggerJutsu2() {
    const success = this.player.castJutsu2(
      this.projectiles,
      this.particles,
      this.enemies,
      this.obstacles,
      this.bossManager.activeBoss
    );
    if (success) {
      this.showAnnouncement('術', this.player.config.j2.name);
    }
  }

  triggerUltimate() {
    const success = this.player.castUltimate(
      this.projectiles,
      this.particles,
      this.enemies,
      this.obstacles,
      this.bossManager.activeBoss
    );
    if (success) {
      this.showAnnouncement('極', this.player.config.ult.name);
    }
  }

  showAnnouncement(kanji, text) {
    this.dom.announcementKanji.textContent = kanji;
    this.dom.announcementText.textContent = text;
    this.dom.announcement.classList.remove('hidden');

    clearTimeout(this.announcementTimeout);
    this.announcementTimeout = setTimeout(() => {
      this.dom.announcement.classList.add('hidden');
    }, 1200);
  }

  // ==========================================
  // GAME FLOW & STATE
  // ==========================================
  startRun() {
    window.shinobiAudio.ensureContext();
    this.closeModals();

    // Reset gameplay state
    this.player = new Player(this.selectedCharacter, this.savedData.upgrades);
    this.obstacles = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles.clear();
    this.bossManager = new BossManager();

    this.distance = 0;
    this.score = 0;
    this.scrollsGatheredThisRun = 0;
    this.worldSpeed = this.baseSpeed * this.player.config.speedMod;
    this.obstacleSpawnTimer = 1.8;
    this.enemySpawnTimer = 4.0;
    this.pickupSpawnTimer = 2.5;

    this.state = 'PLAYING';

    // Hide menus, show HUD
    this.dom.mainMenu.classList.add('hidden');
    this.dom.pauseMenu.classList.add('hidden');
    this.dom.gameOver.classList.add('hidden');
    this.dom.hud.classList.remove('hidden');

    this.setupCharacterHud();
    window.shinobiAudio.playBgm('normal');
  }

  setupCharacterHud() {
    const cfg = this.player.config;
    this.dom.hudAvatar.textContent = cfg.avatar;

    this.dom.j1Icon.textContent = cfg.j1.icon;
    this.dom.j1Name.textContent = cfg.j1.name;
    this.dom.j1Cost.textContent = `${cfg.j1.cost} CP`;

    this.dom.j2Icon.textContent = cfg.j2.icon;
    this.dom.j2Name.textContent = cfg.j2.name;
    this.dom.j2Cost.textContent = `${cfg.j2.cost} CP`;

    this.dom.ultIcon.textContent = cfg.ult.icon;
    this.dom.ultName.textContent = cfg.ult.name;
    this.dom.ultCost.textContent = `${cfg.ult.cost} CP`;
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.dom.pauseMenu.classList.remove('hidden');
      window.shinobiAudio.stopBgm();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.dom.pauseMenu.classList.add('hidden');
      const track = this.bossManager.activeBoss ? 'boss' : 'normal';
      window.shinobiAudio.playBgm(track);
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    window.shinobiAudio.playGameOver();
    window.shinobiAudio.stopBgm();

    // Update records
    const isNewBestDist = this.distance > this.savedData.bestDistance;
    const isNewHighScore = this.score > this.savedData.highScore;

    if (isNewBestDist) this.savedData.bestDistance = Math.floor(this.distance);
    if (isNewHighScore) this.savedData.highScore = Math.floor(this.score);
    this.savedData.totalScrolls += this.scrollsGatheredThisRun;
    this.saveData();

    // Fill results modal
    this.dom.resultDistance.textContent = `${Math.floor(this.distance)} m`;
    this.dom.resultScore.textContent = Math.floor(this.score);
    this.dom.resultBosses.textContent = this.bossManager.bossDefeatedCount;
    this.dom.resultScrolls.textContent = `+${this.scrollsGatheredThisRun}`;

    const quotes = [
      '"If you give up now, you will never become Hokage!"',
      '"A shinobi must see through deception and endure hardship."',
      '"Those who break the rules are scum, but those who abandon their friends are worse than scum."',
      '"Hard work beats natural genius when genius fails to work hard!"',
      '"Believe it! Dust yourself off and run again!"'
    ];
    this.dom.gameOverQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];

    this.dom.hud.classList.add('hidden');
    this.dom.gameOver.classList.remove('hidden');
    this.updateMenuStats();
  }

  returnToMenu() {
    this.state = 'MENU';
    this.closeModals();
    this.dom.hud.classList.add('hidden');
    this.dom.pauseMenu.classList.add('hidden');
    this.dom.gameOver.classList.add('hidden');
    this.dom.mainMenu.classList.remove('hidden');
    window.shinobiAudio.stopBgm();
    this.updateMenuStats();
  }

  // ==========================================
  // MODALS & MENUS
  // ==========================================
  closeModals() {
    this.dom.characterModal.classList.add('hidden');
    this.dom.dojoModal.classList.add('hidden');
    this.dom.helpModal.classList.add('hidden');
  }

  openCharacterModal() {
    this.renderCharacterGrid();
    this.dom.characterModal.classList.remove('hidden');
  }

  renderCharacterGrid() {
    this.dom.charactersContainer.innerHTML = '';
    Object.values(SHINOBI_ROSTER).forEach(ninja => {
      const isSelected = ninja.id === this.selectedCharacter;
      const card = document.createElement('div');
      card.className = `ninja-card ${isSelected ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="ninja-card-header">
          <div class="ninja-card-avatar">${ninja.avatar}</div>
          <div class="ninja-card-title">
            <h4>${ninja.name}</h4>
            <span>${ninja.title}</span>
          </div>
        </div>
        <div class="ninja-stats-row">
          <span>HP: <strong>${ninja.baseHp}</strong></span>
          <span>CHAKRA: <strong>${ninja.baseChakra}</strong></span>
          <span>SPEED: <strong>${Math.round(ninja.speedMod * 100)}%</strong></span>
        </div>
        <p class="ninja-ability-desc">${ninja.passiveDesc}</p>
        <button class="ninja-select-btn">${isSelected ? 'SELECTED' : 'SELECT'}</button>
      `;

      card.addEventListener('click', () => {
        this.selectedCharacter = ninja.id;
        this.renderCharacterGrid();
        this.renderSelectedNinjaPreview();
      });

      this.dom.charactersContainer.appendChild(card);
    });
  }

  openDojoModal() {
    this.renderDojoUpgrades();
    this.dom.dojoScrollCount.textContent = this.savedData.totalScrolls;
    this.dom.dojoModal.classList.remove('hidden');
  }

  renderDojoUpgrades() {
    this.dom.upgradesContainer.innerHTML = '';
    const upgrades = [
      {
        id: 'hpLevel',
        name: 'Ichiraku Feast (Max HP)',
        icon: '🍜',
        desc: 'Increase maximum Health Points by +15 per level.',
        costPerLevel: 5
      },
      {
        id: 'chakraLevel',
        name: 'Chakra Meditation (Max CP)',
        icon: '🌀',
        desc: 'Increase maximum Chakra Points by +15 per level.',
        costPerLevel: 5
      },
      {
        id: 'attackLevel',
        name: 'Taijutsu & Shuriken Mastery',
        icon: '🗡️',
        desc: 'Boost basic and Jutsu attack damage by +20% per level.',
        costPerLevel: 8
      }
    ];

    upgrades.forEach(u => {
      const currentLevel = this.savedData.upgrades[u.id] || 0;
      const cost = (currentLevel + 1) * u.costPerLevel;
      const canAfford = this.savedData.totalScrolls >= cost;

      const item = document.createElement('div');
      item.className = 'upgrade-item';
      item.innerHTML = `
        <div class="upgrade-header">
          <span class="upgrade-icon">${u.icon}</span>
          <div>
            <h4>${u.name}</h4>
            <span class="upgrade-level">Level ${currentLevel}</span>
          </div>
        </div>
        <p class="upgrade-desc">${u.desc}</p>
        <button class="upgrade-btn" ${canAfford ? '' : 'disabled'}>
          UPGRADE (${cost} 📜)
        </button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        if (this.savedData.totalScrolls >= cost) {
          this.savedData.totalScrolls -= cost;
          this.savedData.upgrades[u.id] = currentLevel + 1;
          this.saveData();
          window.shinobiAudio.playPickupScroll();
          this.renderDojoUpgrades();
          this.dom.dojoScrollCount.textContent = this.savedData.totalScrolls;
          this.updateMenuStats();
        }
      });

      this.dom.upgradesContainer.appendChild(item);
    });
  }

  openHelpModal() {
    this.dom.helpModal.classList.remove('hidden');
  }

  renderSelectedNinjaPreview() {
    const cfg = SHINOBI_ROSTER[this.selectedCharacter] || SHINOBI_ROSTER.naruto;
    this.dom.menuNinjaEmoji.textContent = cfg.avatar;
    this.dom.menuNinjaName.textContent = cfg.name;
    this.dom.menuNinjaTrait.textContent = `Special: ${cfg.passiveDesc.split(':')[0]}`;
  }

  updateMenuStats() {
    this.dom.bestDistance.textContent = this.savedData.bestDistance;
    this.dom.highScore.textContent = this.savedData.highScore;
    this.dom.totalScrolls.textContent = this.savedData.totalScrolls;
  }

  // ==========================================
  // MAIN GAME LOOP & LOGIC
  // ==========================================
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta time
    this.lastTime = timestamp;
    this.animTime += dt;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. World Progression
    this.distance += this.worldSpeed * dt * 4;
    this.score += this.worldSpeed * dt * 10;

    // Gently scale world speed over time
    this.worldSpeed = (this.baseSpeed + Math.min(6, this.distance / 1200)) * this.player.config.speedMod;

    // Biome Shifting based on boss or distance
    if (this.bossManager.activeBoss) {
      if (this.bossManager.activeBoss.type === 'zabuza') this.currentBiome = 'mist';
      else if (this.bossManager.activeBoss.type === 'madara') this.currentBiome = 'sunset';
      else this.currentBiome = 'leaf';
    } else {
      this.currentBiome = 'leaf';
    }

    // 2. Parallax and Falling Leaves
    this.background.update(this.worldSpeed, dt);
    this.particles.update(dt);
    if (Math.random() < 0.1) {
      this.particles.spawnLeaves(this.V_WIDTH, this.V_HEIGHT, 1);
    }

    // 3. Player Update
    this.player.update(dt, this.particles);

    // 4. Boss Spawning & Management
    const bossWarningConfig = this.bossManager.checkBossSpawn(this.distance);
    if (bossWarningConfig) {
      this.dom.warningBossName.textContent = `${bossWarningConfig.name} - ${bossWarningConfig.title}`;
      this.dom.bossWarning.classList.remove('hidden');
    } else if (!this.bossManager.warningActive) {
      this.dom.bossWarning.classList.add('hidden');
    }

    const bossReward = this.bossManager.update(
      dt,
      this.distance,
      this.player,
      this.projectiles,
      this.obstacles,
      this.particles,
      this.pickups
    );

    if (bossReward) {
      this.score += bossReward.score;
      this.showAnnouncement('勝', `${bossReward.name} DEFEATED!`);
    }

    // 5. Spawning Obstacles, Enemies, Pickups (pause normal spawns during boss warning)
    if (!this.bossManager.warningActive) {
      this.handleSpawners(dt);
    }

    // 6. Entity Updates
    this.updateEntities(dt);

    // 7. Collisions
    this.handleCollisions();

    // 8. Check Player Health
    if (this.player.hp <= 0) {
      this.triggerGameOver();
      return;
    }

    // 9. Update In-Game HUD
    this.updateHud();
  }

  handleSpawners(dt) {
    // Only spawn standard obstacles if boss is not currently overwhelming
    this.obstacleSpawnTimer -= dt;
    if (this.obstacleSpawnTimer <= 0) {
      const types = ['spikes', 'bomb', 'shuriken', 'tripwire'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push(new Obstacle(this.V_WIDTH + 60, this.groundY, chosen));
      // Interval speeds up as world speed increases
      this.obstacleSpawnTimer = 1.6 + Math.random() * 1.4 - Math.min(0.8, this.distance / 4000);
    }

    // Rogue Enemies
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0 && !this.bossManager.activeBoss) {
      this.enemies.push(new Enemy(this.V_WIDTH + 80, this.groundY));
      this.enemySpawnTimer = 4.5 + Math.random() * 3.5;
    }

    // Pickups (Ramen, Scrolls, Logs, Chakra Orbs)
    this.pickupSpawnTimer -= dt;
    if (this.pickupSpawnTimer <= 0) {
      const r = Math.random();
      let type = 'scroll';
      if (r < 0.25) type = 'ramen';
      else if (r < 0.45) type = 'chakra';
      else if (r < 0.58) type = 'log';

      const spawnY = this.groundY - (Math.random() > 0.4 ? 40 : 120);
      this.pickups.push(new Pickup(this.V_WIDTH + 50, spawnY, type));
      this.pickupSpawnTimer = 3.0 + Math.random() * 2.5;
    }
  }

  updateEntities(dt) {
    // Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.update(this.worldSpeed, dt);
      if (o.x < -100 || o.destroyed) {
        this.obstacles.splice(i, 1);
      }
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(this.worldSpeed, dt);
      if (e.x < -100 || e.destroyed) {
        this.enemies.splice(i, 1);
      }
    }

    // Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.update(this.worldSpeed, dt);
      if (p.x < -100 || p.collected) {
        this.pickups.splice(i, 1);
      }
    }

    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);
      if (proj.x > this.V_WIDTH + 150 || proj.x < -100 || !proj.active) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // ==========================================
  // AABB COLLISION DETECTION
  // ==========================================
  checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  handleCollisions() {
    const playerBounds = {
      x: this.player.x + 8,
      y: this.player.y + 4,
      width: this.player.width - 16,
      height: this.player.height - 8
    };

    // 1. Player vs Pickups
    for (const p of this.pickups) {
      if (!p.collected && this.checkAABB(playerBounds, p.getBounds())) {
        p.collected = true;
        if (p.type === 'ramen') {
          const healAmount = this.player.characterId === 'sakura' ? 55 : 35;
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
          this.score += 250;
          window.shinobiAudio.playPickupRamen();
          this.particles.spawnChakraFlames(p.x, p.y, '#10b981', 8);
        } else if (p.type === 'scroll') {
          this.scrollsGatheredThisRun++;
          this.score += 150;
          window.shinobiAudio.playPickupScroll();
          this.particles.spawnSparks(p.x, p.y, 8, '#fbbf24');
        } else if (p.type === 'log') {
          this.player.substitutionLogs = Math.min(5, this.player.substitutionLogs + 1);
          window.shinobiAudio.playSubstitution();
          this.particles.spawnDust(p.x, p.y, 8, '#78350f');
        } else if (p.type === 'chakra') {
          this.player.chakra = Math.min(this.player.maxChakra, this.player.chakra + 45);
          window.shinobiAudio.playPickupScroll();
          this.particles.spawnChakraFlames(p.x, p.y, '#00bfff', 10);
        }
      }
    }

    // 2. Player vs Obstacles
    for (const o of this.obstacles) {
      if (!o.destroyed && this.checkAABB(playerBounds, o.getBounds())) {
        const result = this.player.takeDamage(25, this.particles);
        if (result === 'clone' || result === 'substitution') {
          o.destroyed = true;
        }
      }
    }

    // 3. Player vs Enemies
    for (const e of this.enemies) {
      if (!e.destroyed && this.checkAABB(playerBounds, e.getBounds())) {
        this.player.takeDamage(20, this.particles);
        e.destroyed = true;
      }
    }

    // 4. Player vs Boss Projectiles
    for (const proj of this.projectiles) {
      if (proj.owner === 'boss' && proj.active && this.checkAABB(playerBounds, proj.getBounds())) {
        this.player.takeDamage(proj.damage, this.particles);
        proj.active = false;
      }
    }

    // 5. Player Projectiles vs Obstacles, Enemies & Boss
    for (const proj of this.projectiles) {
      if (proj.owner !== 'player' || !proj.active) continue;
      const projBounds = proj.getBounds();

      // Projectiles vs Obstacles
      for (const o of this.obstacles) {
        if (!o.destroyed && this.checkAABB(projBounds, o.getBounds())) {
          o.destroyed = true;
          this.score += 50;
          this.particles.spawnExplosion(o.x + o.width / 2, o.y + o.height / 2, 8);
          proj.pierce--;
          if (proj.pierce <= 0) proj.active = false;
        }
      }

      // Projectiles vs Enemies
      for (const e of this.enemies) {
        if (!e.destroyed && this.checkAABB(projBounds, e.getBounds())) {
          e.hp -= proj.damage;
          this.particles.spawnSparks(e.x + 20, e.y + 20, 8, '#ef4444');
          if (e.hp <= 0) {
            e.destroyed = true;
            this.score += 120;
            this.particles.spawnSubstitutionSmoke(e.x + 20, e.y + 20, 15);
          }
          proj.pierce--;
          if (proj.pierce <= 0) proj.active = false;
        }
      }

      // Projectiles vs Boss
      const boss = this.bossManager.activeBoss;
      if (boss && !boss.defeated && this.checkAABB(projBounds, boss.getBounds())) {
        boss.takeDamage(proj.damage);
        this.particles.spawnSparks(proj.x, proj.y, 10, '#ffcc00');
        proj.pierce--;
        if (proj.pierce <= 0) proj.active = false;
      }
    }
  }

  // ==========================================
  // HUD UPDATES
  // ==========================================
  updateHud() {
    // HP
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    this.dom.hpBarFill.style.width = `${hpPct}%`;
    this.dom.hpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    // Chakra
    const chakraPct = Math.max(0, Math.min(100, (this.player.chakra / this.player.maxChakra) * 100));
    this.dom.chakraBarFill.style.width = `${chakraPct}%`;
    this.dom.chakraText.textContent = `${Math.floor(this.player.chakra)} / ${this.player.maxChakra}`;

    // Counters
    this.dom.subCount.textContent = `x${this.player.substitutionLogs}`;
    this.dom.hudScore.textContent = Math.floor(this.score);
    this.dom.hudDistance.textContent = Math.floor(this.distance);
    this.dom.hudScrolls.textContent = this.scrollsGatheredThisRun;

    // Jutsu Cooldown Overlays
    const j1 = this.player.config.j1;
    const j1Pct = (this.player.j1Cooldown / j1.cd) * 100;
    this.dom.j1Cooldown.style.height = `${j1Pct}%`;

    const j2 = this.player.config.j2;
    const j2Pct = (this.player.j2Cooldown / j2.cd) * 100;
    this.dom.j2Cooldown.style.height = `${j2Pct}%`;

    const ult = this.player.config.ult;
    const ultPct = (this.player.ultCooldown / ult.cd) * 100;
    this.dom.ultCooldown.style.height = `${ultPct}%`;

    // Boss HUD
    const activeBoss = this.bossManager.activeBoss;
    if (activeBoss) {
      this.dom.bossHud.classList.remove('hidden');
      this.dom.bossName.textContent = activeBoss.name;
      this.dom.bossTitle.textContent = activeBoss.hasSandShield ? 'SAND SHIELD ACTIVE' : activeBoss.title;
      const bossHpPct = Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100));
      this.dom.bossBarFill.style.width = `${bossHpPct}%`;
      this.dom.bossHpText.textContent = `${Math.ceil(activeBoss.hp)} / ${activeBoss.maxHp}`;
    } else {
      this.dom.bossHud.classList.add('hidden');
    }
  }

  // ==========================================
  // RENDER MASTER
  // ==========================================
  render() {
    this.ctx.clearRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // 1. Background
    this.background.draw(this.ctx, this.currentBiome);

    // 2. Pickups
    for (const p of this.pickups) {
      p.draw(this.ctx, this.animTime);
    }

    // 3. Obstacles
    for (const o of this.obstacles) {
      o.draw(this.ctx, this.animTime);
    }

    // 4. Rogue Enemies
    for (const e of this.enemies) {
      e.draw(this.ctx, this.animTime);
    }

    // 5. Boss
    if (this.bossManager.activeBoss) {
      this.bossManager.activeBoss.draw(this.ctx, this.animTime);
    }

    // 6. Projectiles
    for (const proj of this.projectiles) {
      proj.draw(this.ctx, this.animTime);
    }

    // 7. Player (if not in menu)
    if (this.player) {
      ShinobiRenderer.drawPlayer(this.ctx, this.player, this.animTime);
    }

    // 8. Particles (Top Layer)
    this.particles.draw(this.ctx);

    // 9. Mist layer in mist biome
    if (this.currentBiome === 'mist') {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(203, 213, 225, 0.18)';
      this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
      this.ctx.restore();
    }
  }
}

// Start game instance on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.narutoNinjaRun = new ShinobiGame();
});
