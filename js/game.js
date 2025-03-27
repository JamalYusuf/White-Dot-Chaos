// Constants
const SHAPE_TYPES = ['circle', 'square', 'triangle'];
const MODIFIER_TYPES = ['🚀', '🎯', '🛡️', '🌟', '❄️'];
const MODIFIER_COLORS = {
    '🚀': '#ff0000', '🎯': '#00ff00', '🛡️': '#0000ff', '🌟': '#ffff00', '❄️': '#00ffff'
};

// Game state
const gameState = {
    shapes: [],
    hero: null,
    explosions: [],
    flash: { timer: 0, color: 'rgba(255, 255, 255, 0)' },
    score: 0,
    activeModifiers: [],
    stats: { circle: 0, square: 0, triangle: 0 },
    colorCounts: {},
    modifierCounts: { '🚀': 0, '🎯': 0, '🛡️': 0, '🌟': 0, '❄️': 0 },
    animationFrameId: null,
    lastModifierTime: 0,
    mode: 'auto', // 'auto' or 'manual'
    mouseX: 0,
    mouseY: 0,
    keys: new Set(),
    settings: { spawnRate: 0.03, heroSpeed: 0.1, maxShapes: 20, mouseSensitivity: 0.15 }
};

// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Shape class for game objects
class Shape {
    constructor(isHero = false, isModifier = false, x = null, y = null) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;
        this.isHero = isHero;
        this.isModifier = isModifier;
        this.type = this.assignType();
        this.size = isHero ? 20 : isModifier ? 15 : 10 + Math.random() * 30;
        this.maxSize = isHero ? 20 : 40;
        this.color = isHero ? '#ffffff' : isModifier ? '#ffffff' : `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.health = isHero ? Infinity : this.size * 2;
        this.life = isHero ? Infinity : Math.random() * 600 + 400;
        this.age = 0;
        this.baseSpeed = isHero ? gameState.settings.heroSpeed : isModifier ? 0 : 0.03 + Math.random() * 0.06;
        this.speed = this.baseSpeed;
        this.vx = 0;
        this.vy = 0;
        this.targetX = isModifier ? this.x : this.newTarget('x');
        this.targetY = isModifier ? this.y : this.newTarget('y');
        this.trail = isHero ? [] : null;
        this.modifierColor = isModifier ? MODIFIER_COLORS[this.type] : null;
        this.marked = false;
        this.rotation = 0;
        this.charging = false;
    }

    assignType() {
        if (this.isHero) return 'circle';
        if (this.isModifier) return MODIFIER_TYPES[Math.floor(Math.random() * MODIFIER_TYPES.length)];
        return SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    }

    newTarget(axis) {
        const range = axis === 'x' ? canvas.width : canvas.height;
        return range * 0.1 + Math.random() * range * 0.8;
    }

    update() {
        this.applyModifiers();
        if (this.isHero) {
            gameState.mode === 'auto' ? this.updateAuto() : this.updateManual();
        } else if (!this.isModifier) {
            this.updateShape();
        }
        this.move();
        this.age++;
        if (this.isHero) this.updateTrail();
    }

    applyModifiers() {
        this.speed = gameState.activeModifiers.some(mod => mod.type === '❄️') && !this.isHero && !this.isModifier ? 0 : this.baseSpeed;
        if (this.isHero) {
            this.size = gameState.activeModifiers.some(mod => mod.type === '🌟') ? 40 : 20;
            if (gameState.activeModifiers.some(mod => mod.type === '🚀')) this.speed = this.baseSpeed * 3;
        }
    }

    updateAuto() {
        const nearest = gameState.shapes.find(s => s.isModifier && this.distanceTo(s) < 200);
        if (nearest) {
            this.targetX = nearest.x;
            this.targetY = nearest.y;
        } else if (this.distanceTo({ x: this.targetX, y: this.targetY }) < 15) {
            this.targetX = this.newTarget('x');
            this.targetY = this.newTarget('y');
        }
    }

    updateManual() {
        const dx = gameState.mouseX - this.x;
        const dy = gameState.mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const mouseSensitivity = gameState.settings.mouseSensitivity;
        const baseSpeed = this.speed * 100;
        const easing = 0.1;

        if (distance > 5) {
            this.vx += (dx / distance) * baseSpeed * mouseSensitivity * easing;
            this.vy += (dy / distance) * baseSpeed * mouseSensitivity * easing;
        }

        const boostFactor = gameState.keys.size > 0 ? 1.5 : 1;
        if (gameState.keys.has('arrowup') || gameState.keys.has('w')) this.vy -= this.speed * 20 * boostFactor;
        if (gameState.keys.has('arrowdown') || gameState.keys.has('s')) this.vy += this.speed * 20 * boostFactor;
        if (gameState.keys.has('arrowleft') || gameState.keys.has('a')) this.vx -= this.speed * 20 * boostFactor;
        if (gameState.keys.has('arrowright') || gameState.keys.has('d')) this.vx += this.speed * 20 * boostFactor;

        const drag = 0.9;
        this.vx *= drag;
        this.vy *= drag;

        const maxSpeed = baseSpeed * boostFactor;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            this.vx *= scale;
            this.vy *= scale;
        }
    }

    updateShape() {
        if (!gameState.hero) return;
        const distance = this.distanceTo(gameState.hero);
        if (distance < gameState.hero.size * 5) {
            const pull = (1 - distance / (gameState.hero.size * 5)) * 0.05;
            this.x += (gameState.hero.x - this.x) * pull;
            this.y += (gameState.hero.y - this.y) * pull;
        }
        if (this.distanceTo({ x: this.targetX, y: this.targetY }) < 5 && Date.now() - this.age > 1000) {
            this.charging = true;
            this.targetX = gameState.hero.x;
            this.targetY = gameState.hero.y;
            this.speed *= 2;
            this.rotation += 0.1;
        } else {
            this.charging = false;
        }
        if (gameState.score >= 100) this.rotation += 0.05 * Math.floor(gameState.score / 100);
    }

    move() {
        if (this.isHero && gameState.mode === 'manual') {
            this.x += this.vx;
            this.y += this.vy;
            this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
            this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
        } else if (!this.isModifier) {
            this.x += (this.targetX - this.x) * this.speed + (Math.random() - 0.5) * 2;
            this.y += (this.targetY - this.y) * this.speed + (Math.random() - 0.5) * 2;
        }
    }

    updateTrail() {
        const speedFactor = gameState.mode === 'manual' 
            ? Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 10 
            : this.speed * 100;
        this.trail.push({ x: this.x, y: this.y, opacity: 1, size: Math.min(20, 5 + speedFactor * 1.5) });
        if (this.trail.length > 20) this.trail.shift();
        this.trail.forEach(t => t.opacity -= 0.05);
    }

    draw() {
        const opacity = this.isHero || this.isModifier ? 1 : Math.max(0, this.health / (this.size * 2));
        ctx.save();
        if (this.charging || (gameState.score >= 100 && !this.isHero && !this.isModifier)) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.translate(-this.x, -this.y);
        }
        if (this.isHero) this.drawTrail();
        this.drawShape(opacity);
        if (this.isHero) this.drawActiveModifiers();
        ctx.restore();
    }

    drawTrail() {
        this.trail.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 200, 200, ${point.opacity * 0.2})`;
            ctx.fill();
        });
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.fill();
    }

    drawShape(opacity) {
        ctx.beginPath();
        if (this.type === 'circle') ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        else if (this.type === 'square') ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        else if (this.type === 'triangle') {
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x - this.size, this.y + this.size);
            ctx.lineTo(this.x + this.size, this.y + this.size);
            ctx.closePath();
        } else {
            ctx.font = `${this.size * 2}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.type, this.x, this.y);
        }
        ctx.fillStyle = this.isHero || this.isModifier ?
            `rgba(255, 255, 255, ${opacity})` :
            this.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
        ctx.fill();

        if (this.isModifier) {
            ctx.strokeStyle = this.modifierColor;
            ctx.lineWidth = Math.sin(Date.now() * 0.005) * 2 + 3;
            ctx.stroke();
        } else if (this.shouldDrawAimAssist()) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        if (!this.isHero && !this.isModifier && this.marked) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.size, this.y - this.size);
            ctx.lineTo(this.x + this.size, this.y + this.size);
            ctx.moveTo(this.x + this.size, this.y - this.size);
            ctx.lineTo(this.x - this.size, this.y + this.size);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    shouldDrawAimAssist() {
        if (!gameState.activeModifiers.some(mod => mod.type === '🎯') || this === gameState.hero) return false;
        return this.distanceTo(gameState.hero) < gameState.hero.size * 10;
    }

    drawActiveModifiers() {
        let offset = 0;
        gameState.activeModifiers.forEach(mod => {
            ctx.beginPath();
            ctx.arc(this.x + Math.cos(offset) * (this.size + 5), this.y + Math.sin(offset) * (this.size + 5), 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = mod.modifierColor;
            ctx.fillText(mod.type, this.x + Math.cos(offset) * (this.size + 5), this.y + Math.sin(offset) * (this.size + 5));
            offset += Math.PI / 2;
        });
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    collidesWith(other) {
        return this.distanceTo(other) < (this.size + other.size);
    }

    combineWith(other) {
        if (this.size < this.maxSize) {
            this.size = Math.min(this.maxSize, this.size + other.size * 0.5);
            this.health = this.size * 2;
        }
    }
}

// Explosion class for visual effects
class Explosion {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxSize = size * 2;
        this.color = color;
        this.life = 30;
        this.age = 0;
        this.particles = Array.from({ length: 10 }, () => ({
            x: this.x,
            y: this.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 5 + 2,
            life: Math.random() * 20 + 10
        }));
    }

    update() {
        this.age++;
        this.size = this.maxSize * (1 - this.age / this.life);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw() {
        const opacity = 1 - (this.age / this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `, ${opacity})`).replace('hsl', 'rgba');
        ctx.fill();

        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.random() * 100 + 100}, 0, ${p.life / 20})`;
            ctx.fill();
        });
    }

    isDone() {
        return this.age >= this.life && this.particles.length === 0;
    }
}

// Main animation loop
function animate() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (Math.random() < gameState.settings.spawnRate && gameState.shapes.length < gameState.settings.maxShapes) {
            gameState.shapes.push(new Shape());
        }
        gameState.shapes.forEach(s => { s.update(); s.draw(); });
        gameState.explosions.forEach(e => { e.update(); e.draw(); });
        gameState.explosions = gameState.explosions.filter(e => !e.isDone());
        gameState.shapes = gameState.shapes.filter(s => s.isHero || (s.age < s.life && s.health > 0));
        gameState.activeModifiers.forEach(m => {
            m.timer--;
            if (m.type === '🎯') applyAimAssist();
        });
        gameState.activeModifiers = gameState.activeModifiers.filter(m => m.timer > 0);
        checkCollisions();
        awardModifiers();
        activateRandomModifier();
        drawEdgeFlash();
        gameState.animationFrameId = requestAnimationFrame(animate);
    } catch (e) {
        console.error('Animation error:', e);
        resumeGame();
    }
}

// Game logic functions
function drawEdgeFlash() {
    if (gameState.flash.timer > 0) {
        const edgeWidth = 20;
        const alpha = gameState.flash.timer / 10;
        ctx.fillStyle = gameState.flash.color.replace('0.5', alpha.toString());
        ctx.fillRect(0, 0, canvas.width, edgeWidth);
        ctx.fillRect(0, canvas.height - edgeWidth, canvas.width, edgeWidth);
        ctx.fillRect(0, 0, edgeWidth, canvas.height);
        ctx.fillRect(canvas.width - edgeWidth, 0, edgeWidth, canvas.height);
        gameState.flash.timer--;
    }
}

function applyAimAssist() {
    gameState.shapes = gameState.shapes.filter(s => {
        if (s === gameState.hero || s.isModifier) return true;
        if (s.distanceTo(gameState.hero) < gameState.hero.size * 10) {
            triggerCollision(s);
            return false;
        }
        return true;
    });
}

function applyShield() {
    gameState.shapes.forEach(s => { if (s !== gameState.hero && !s.isModifier) s.marked = true; });
    setTimeout(() => {
        gameState.shapes = gameState.shapes.filter(s => {
            if (s.marked) {
                triggerCollision(s);
                return false;
            }
            return true;
        });
    }, 500);
}

function triggerCollision(shape) {
    gameState.flash.timer = 10;
    gameState.flash.color = shape.color.replace(')', `, 0.5)`).replace('hsl', 'rgba');
    gameState.explosions.push(new Explosion(shape.x, shape.y, shape.size, shape.color));
    gameState.score++;
    gameState.stats[shape.type]++;
    gameState.colorCounts[shape.color] = (gameState.colorCounts[shape.color] || 0) + 1;
    updateUI(); // Defined in ui.js
}

function checkCollisions() {
    const toRemove = new Set();
    gameState.shapes.forEach((shape, i) => {
        if (shape.isHero) {
            gameState.shapes.forEach((other, j) => {
                if (i !== j && shape.collidesWith(other)) {
                    if (other.isModifier) {
                        gameState.activeModifiers.push({ ...other, timer: 600 });
                        toRemove.add(j);
                    } else {
                        triggerCollision(other);
                        toRemove.add(j);
                    }
                }
            });
        } else {
            gameState.shapes.forEach((other, j) => {
                if (i >= j || other.isHero) return;
                if (shape.collidesWith(other) && !shape.isModifier && !other.isModifier) {
                    if (shape.type === other.type) {
                        shape.combineWith(other);
                        toRemove.add(j);
                    } else {
                        shape.health -= other.size;
                        other.health -= shape.size;
                        if (shape.health <= 0) toRemove.add(i);
                        if (other.health <= 0) toRemove.add(j);
                    }
                }
            });
        }
    });
    gameState.shapes = gameState.shapes.filter((_, i) => !toRemove.has(i));
}

function awardModifiers() {
    const totalModifiers = Object.values(gameState.modifierCounts).reduce((a, b) => a + b, 0);
    if (gameState.score > 0 && gameState.score % 10 === 0 && totalModifiers < gameState.score / 10) {
        const modType = MODIFIER_TYPES[Math.floor(Math.random() * MODIFIER_TYPES.length)];
        gameState.modifierCounts[modType]++;
        modifierButtons[modType].textContent = `${modType}: ${gameState.modifierCounts[modType]}`; // modifierButtons from ui.js
    }
}

function activateRandomModifier() {
    const now = Date.now();
    if (now - gameState.lastModifierTime < 5000) return;
    const available = MODIFIER_TYPES.filter(t => gameState.modifierCounts[t] > 0);
    if (available.length === 0) return;
    const type = available[Math.floor(Math.random() * available.length)];
    activateModifier(type);
    gameState.lastModifierTime = now;
}

function activateModifier(type) {
    if (gameState.modifierCounts[type] <= 0) return;
    gameState.modifierCounts[type]--;
    const newMod = { type, modifierColor: MODIFIER_COLORS[type], timer: 600 };
    gameState.activeModifiers.push(newMod);
    if (type === '🛡️') applyShield();
    modifierButtons[type].textContent = `${type}: ${gameState.modifierCounts[type]}`; // modifierButtons from ui.js
}

function spawnShapes(x, y) {
    for (let i = 0; i < 3; i++) {
        gameState.shapes.push(new Shape(false, false, x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50));
    }
}

// Game control functions
function startGame() {
    resizeCanvas(); // From utils.js, should be available since utils.js is loaded first
    canvas.style.display = 'block';
    gameState.hero = new Shape(true);
    gameState.shapes.push(gameState.hero);
    animate();
}

function pauseGame() {
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.animationFrameId = null;
    }
}

function resumeGame() {
    if (!gameState.animationFrameId) {
        animate();
    }
}