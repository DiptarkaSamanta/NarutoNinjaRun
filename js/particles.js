/**
 * NARUTO NINJA RUN - Particle System
 * Realistic anime visual effects: falling leaves, chakra auras, smoke puffs, lightning, shockwaves
 */

class Particle {
  constructor(x, y, vx, vy, color, size, life, type = 'generic', extra = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.type = type;
    this.extra = extra;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.2;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.rotation += this.vRot;

    if (this.type === 'leaf') {
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy = Math.sin(this.life * 5) * 0.5 + 1.2;
    } else if (this.type === 'dust' || this.type === 'smoke') {
      this.vy *= 0.96;
      this.vx *= 0.96;
      this.size += 0.3;
    } else if (this.type === 'chakra') {
      this.vy -= 0.15; // float upward
      this.size = Math.max(0, this.size - 0.2);
    } else if (this.type === 'shockwave') {
      this.size += 4.5;
    }
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const progress = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'leaf') {
      ctx.globalAlpha = Math.min(1, progress * 1.5);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'dust' || this.type === 'smoke') {
      ctx.globalAlpha = progress * 0.6;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'chakra') {
      ctx.globalAlpha = progress * 0.85;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'shockwave') {
      ctx.globalAlpha = progress * 0.8;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4 * progress;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'lightning') {
      ctx.globalAlpha = progress;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(0, 5);
      ctx.lineTo(8, -2);
      ctx.lineTo(15, 12);
      ctx.stroke();
    } else {
      ctx.globalAlpha = progress;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  // Spawns running / sliding dust puffs
  spawnDust(x, y, count = 3, color = '#cbd5e1') {
    for (let i = 0; i < count; i++) {
      const vx = -(Math.random() * 2 + 1.5);
      const vy = -(Math.random() * 1.5 + 0.5);
      const size = Math.random() * 6 + 4;
      const life = Math.random() * 0.25 + 0.2;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'dust'));
    }
  }

  // Spawns falling Cherry Blossom & Konoha leaves
  spawnLeaves(width, height, count = 2) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (width + 200) - 100;
      const y = -10;
      const vx = -(Math.random() * 1.5 + 1.0);
      const vy = Math.random() * 1.2 + 0.8;
      const isSakura = Math.random() > 0.4;
      const color = isSakura ? '#ffb7c5' : '#48bb78';
      const size = Math.random() * 4 + 3;
      const life = 14;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'leaf'));
    }
  }

  // Kawariami Substitution Smoke Poof
  spawnSubstitutionSmoke(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 12 + 8;
      const life = Math.random() * 0.4 + 0.3;
      const shade = Math.floor(Math.random() * 40 + 210);
      const color = `rgb(${shade}, ${shade}, ${shade})`;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'smoke'));
    }
  }

  // Chakra Aura Flame (blue for normal, orange for Kyuubi, green for 8-gates, purple for Susanoo)
  spawnChakraFlames(x, y, color = '#26e6e6', count = 3) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 1.5 - 1.5; // trailing behind
      const vy = -(Math.random() * 2 + 1);
      const size = Math.random() * 8 + 4;
      const life = Math.random() * 0.3 + 0.2;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'chakra'));
    }
  }

  // Chidori Lightning sparks
  spawnLightning(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 4;
      const vy = (Math.random() - 0.5) * 4;
      const life = 0.12;
      this.particles.push(new Particle(x, y, vx, vy, '#67e8f9', 2, life, 'lightning'));
    }
  }

  // Ground Slam / Rasengan Shockwave
  spawnShockwave(x, y, color = '#26e6e6') {
    this.particles.push(new Particle(x, y, 0, 0, color, 8, 0.35, 'shockwave'));
  }

  // Shuriken / Projectile Spark Clashes
  spawnSparks(x, y, count = 10, color = '#ffcc00') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 3 + 1.5;
      const life = Math.random() * 0.2 + 0.1;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'generic'));
    }
  }

  // Explosion bursts (for Paper Bombs / Boss Hits)
  spawnExplosion(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 10 + 5;
      const life = Math.random() * 0.35 + 0.2;
      const colors = ['#ff2200', '#ff7700', '#ffcc00', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'generic'));
    }
    this.spawnShockwave(x, y, '#ff5500');
  }
}
