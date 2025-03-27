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

// DOM Elements used across game logic
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;