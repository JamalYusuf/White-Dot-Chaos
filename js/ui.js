// DOM Elements
const startButton = document.getElementById('startButton');
const gameUI = document.getElementById('gameUI');
const scoreBox = document.getElementById('scoreBox');
const shapeStats = document.getElementById('shapeStats');
const shapeFreqCanvas = document.getElementById('shapeFreqCanvas');
const shapeFreqCtx = shapeFreqCanvas.getContext('2d');
const colorFreqCanvas = document.getElementById('colorFreqCanvas');
const colorFreqCtx = colorFreqCanvas.getContext('2d');
const modifiersDiv = document.getElementById('modifiers');
const modifierButtons = {
    '🚀': document.getElementById('speedMod'),
    '🎯': document.getElementById('aimMod'),
    '🛡️': document.getElementById('shieldMod'),
    '🌟': document.getElementById('growMod'),
    '❄️': document.getElementById('freezeMod')
};
const helpButton = document.getElementById('helpButton');
const settingsButton = document.getElementById('settingsButton');
const modeButton = document.getElementById('modeButton');
const copyright = document.getElementById('copyright');
const helpText = document.getElementById('helpText');
const settingsMenu = document.getElementById('settingsMenu');
const helpCanvas = document.getElementById('helpCanvas');
const helpCtx = helpCanvas.getContext('2d');
const settingsInputs = {
    spawnRate: document.getElementById('spawnRate'),
    heroSpeed: document.getElementById('heroSpeed'),
    maxShapes: document.getElementById('maxShapes'),
    mouseSensitivity: document.getElementById('mouseSensitivity'),
    useQuantumEntropy: document.getElementById('useQuantumEntropy')
};
const saveSettingsButton = document.getElementById('saveSettings');

// UI update function
function updateUI() {
    scoreBox.textContent = `Score: ${gameState.score}`;
    const sortedShapes = Object.entries(gameState.stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    shapeStats.innerHTML = 'Top Shapes: ' + sortedShapes.map(([type, count]) =>
        `<span class="shape-icon">${type === 'circle' ? '●' : type === 'square' ? '■' : '▲'}</span>${count}`
    ).join(' ');
    updateBarGraph(shapeFreqCtx, shapeFreqCanvas, gameState.stats, { circle: '#ff9999', square: '#99ff99', triangle: '#9999ff' });
    updateBarGraph(colorFreqCtx, colorFreqCanvas, gameState.colorCounts);
}

// Bar graph utility
function updateBarGraph(ctx, canvas, data, colors = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    let x = 0;
    Object.entries(data).forEach(([key, count]) => {
        const width = (count / total) * canvas.width;
        ctx.fillStyle = colors ? colors[key] : key;
        ctx.fillRect(x, 0, width, canvas.height);
        x += width;
    });
}

// Help scene drawing
function drawHelpScene() {
    helpCanvas.width = helpCanvas.clientWidth;
    helpCanvas.height = helpCanvas.clientHeight;
    helpCtx.clearRect(0, 0, helpCanvas.width, helpCanvas.height);
    helpCtx.beginPath();
    helpCtx.arc(helpCanvas.width / 2, helpCanvas.height / 2, 20, 0, Math.PI * 2);
    helpCtx.fillStyle = '#ffffff';
    helpCtx.fill();
    helpCtx.beginPath();
    helpCtx.arc(helpCanvas.width / 2 - 40, helpCanvas.height / 2 - 20, 15, 0, Math.PI * 2);
    helpCtx.fillStyle = 'hsl(0, 100%, 50%)';
    helpCtx.fill();
    helpCtx.beginPath();
    helpCtx.rect(helpCanvas.width / 2 + 25, helpCanvas.height / 2 - 20, 30, 30);
    helpCtx.fillStyle = 'hsl(120, 100%, 50%)';
    helpCtx.fill();
    helpCtx.beginPath();
    helpCtx.moveTo(helpCanvas.width / 2, helpCanvas.height / 2 + 30);
    helpCtx.lineTo(helpCanvas.width / 2 - 20, helpCanvas.height / 2 + 60);
    helpCtx.lineTo(helpCanvas.width / 2 + 20, helpCanvas.height / 2 + 60);
    helpCtx.closePath();
    helpCtx.fillStyle = 'hsl(240, 100%, 50%)';
    helpCtx.fill();
}

// UI control functions
function toggleHelp() {
    helpText.style.display = helpText.style.display === 'block' ? 'none' : 'block';
    if (helpText.style.display === 'block') {
        drawHelpScene();
        pauseGame();
    } else {
        resumeGame();
    }
}

function toggleSettings() {
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
    if (settingsMenu.style.display === 'block') {
        // Set checkbox state based on current setting
        settingsInputs.useQuantumEntropy.checked = gameState.settings.useQuantumEntropy;
        pauseGame();
    } else {
        resumeGame();
    }
}

function toggleMode() {
    gameState.mode = gameState.mode === 'auto' ? 'manual' : 'auto';
    modeButton.textContent = gameState.mode === 'auto' ? '🎮' : '🤖';
    if (gameState.hero) {
        gameState.hero.vx = 0;
        gameState.hero.vy = 0;
    }
}

function saveSettings() {
    gameState.settings.spawnRate = parseFloat(settingsInputs.spawnRate.value);
    gameState.settings.heroSpeed = parseFloat(settingsInputs.heroSpeed.value);
    gameState.settings.maxShapes = parseInt(settingsInputs.maxShapes.value);
    gameState.settings.mouseSensitivity = parseFloat(settingsInputs.mouseSensitivity.value);
    gameState.settings.useQuantumEntropy = settingsInputs.useQuantumEntropy.checked;
    gameState.hero.baseSpeed = gameState.settings.heroSpeed;

    // Update entropyManager with new setting
    entropyManager.useQuantum = gameState.settings.useQuantumEntropy;
    if (entropyManager.useQuantum && entropyManager.entropyPool.length === 0) {
        entropyManager.fetchEntropy();
    }

    settingsMenu.style.display = 'none';
    resumeGame();
}

function initializeUI() {
    startButton.style.display = 'none';
    gameUI.style.display = 'block';
    modifiersDiv.style.display = 'flex';
    helpButton.style.display = 'block';
    settingsButton.style.display = 'block';
    modeButton.style.display = 'block';
    copyright.style.display = 'block';
}

// Event listeners
startButton.addEventListener('click', () => {
    startGame();
    initializeUI();
});
Object.entries(modifierButtons).forEach(([type, button]) => {
    button.addEventListener('click', () => activateModifier(type));
});
helpButton.addEventListener('click', toggleHelp);
settingsButton.addEventListener('click', toggleSettings);
modeButton.addEventListener('click', toggleMode);
saveSettingsButton.addEventListener('click', saveSettings);
canvas.addEventListener('click', e => {
    if (canvas.style.display === 'block') spawnShapes(e.clientX, e.clientY);
});
canvas.addEventListener('mousemove', e => {
    gameState.mouseX = e.clientX;
    gameState.mouseY = e.clientY;
});
window.addEventListener('keydown', e => {
    gameState.keys.add(e.key.toLowerCase());
});
window.addEventListener('keyup', e => {
    gameState.keys.delete(e.key.toLowerCase());
});
window.addEventListener('resize', () => {
    if (canvas.style.display === 'block' && typeof resizeCanvas === 'function') {
        resizeCanvas();
    }
});