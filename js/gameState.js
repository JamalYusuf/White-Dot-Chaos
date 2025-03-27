// Constants
const SHAPE_TYPES = ['circle', 'square', 'triangle'];
const MODIFIER_TYPES = ['🚀', '🎯', '🛡️', '🌟', '❄️'];
const MODIFIER_COLORS = {
    '🚀': '#ff0000', '🎯': '#00ff00', '🛡️': '#0000ff', '🌟': '#ffff00', '❄️': '#00ffff'
};

// Entropy Manager for randomness (including ANU QRNG)
const entropyManager = {
    entropyPool: [], // Pool of random numbers
    entropyUrl: 'https://qrng.anu.edu.au/API/jsonI.php?length=100&type=uint8', // ANU QRNG API
    isFetching: false,
    useQuantum: false, // Toggle for quantum randomness (default off)

    // Fetch quantum random numbers from ANU QRNG
    async fetchEntropy() {
        if (this.isFetching || !this.useQuantum) return;
        this.isFetching = true;
        try {
            const response = await fetch(this.entropyUrl);
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                // Normalize uint8 (0-255) to 0-1 range
                this.entropyPool = data.data.map(n => n / 255);
            } else {
                console.error('Failed to fetch quantum randomness:', data);
            }
        } catch (error) {
            console.error('Error fetching quantum randomness:', error);
        } finally {
            this.isFetching = false;
        }
    },

    // Get a random number (quantum if available, else Math.random)
    getRandom() {
        if (!this.useQuantum || this.entropyPool.length === 0) {
            return Math.random(); // Fallback to Math.random()
        }
        return this.entropyPool.shift(); // Use quantum random number
    },

    // Pre-fetch entropy pool on initialization if quantum is enabled
    initialize() {
        if (this.useQuantum) {
            this.fetchEntropy();
            // Refetch when pool is low
            setInterval(() => {
                if (this.entropyPool.length < 10 && !this.isFetching) {
                    this.fetchEntropy();
                }
            }, 5000); // Check every 5 seconds
        }
    }
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
    settings: {
        spawnRate: 0.03,
        heroSpeed: 0.1,
        maxShapes: 20,
        mouseSensitivity: 0.15,
        useQuantumEntropy: false // New setting for quantum randomness
    }
};

// DOM Elements used across game logic
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Initialize entropy manager with current settings
entropyManager.useQuantum = gameState.settings.useQuantumEntropy;
entropyManager.initialize();