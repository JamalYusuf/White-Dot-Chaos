// Main animation loop
function animate() {
    if (!ctx) return;
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (entropyManager.getRandom() < gameState.settings.spawnRate && gameState.shapes.length < gameState.settings.maxShapes) {
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
    if (!ctx || gameState.flash.timer <= 0) return;
    const edgeWidth = 20;
    const alpha = gameState.flash.timer / 10;
    ctx.fillStyle = gameState.flash.color.replace('0.5', alpha.toString());
    ctx.fillRect(0, 0, canvas.width, edgeWidth);
    ctx.fillRect(0, canvas.height - edgeWidth, canvas.width, edgeWidth);
    ctx.fillRect(0, 0, edgeWidth, canvas.height);
    ctx.fillRect(canvas.width - edgeWidth, 0, edgeWidth, canvas.height);
    gameState.flash.timer--;
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
        const modType = MODIFIER_TYPES[Math.floor(entropyManager.getRandom() * MODIFIER_TYPES.length)];
        gameState.modifierCounts[modType]++;
        modifierButtons[modType].textContent = `${modType}: ${gameState.modifierCounts[modType]}`; // modifierButtons from ui.js
    }
}

function activateRandomModifier() {
    const now = Date.now();
    if (now - gameState.lastModifierTime < 5000) return;
    const available = MODIFIER_TYPES.filter(t => gameState.modifierCounts[t] > 0);
    if (available.length === 0) return;
    const type = available[Math.floor(entropyManager.getRandom() * available.length)];
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
        gameState.shapes.push(new Shape(false, false, x + (entropyManager.getRandom() - 0.5) * 50, y + (entropyManager.getRandom() - 0.5) * 50));
    }
}

// Game control functions
function startGame() {
    if (typeof resizeCanvas === 'function') {
        resizeCanvas(); // From utils.js
    } else {
        console.error('resizeCanvas is not defined');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
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