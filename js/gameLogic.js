// Main animation loop
function animate() {
    if (!ctx) return;
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
        i