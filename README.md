# White Dot Chaos
## Table of Contents
- [Overview](#overview)
- [Future Goals: Quantum Randomness](#future-goals-quantum-randomness)
  - [Why Quantum Entropy?](#why-quantum-entropy)
  - [Implementation Plan](#implementation-plan)
  - [Expected Outcomes](#expected-outcomes)
- [Quick Start](#quick-start)
- [Gameplay](#gameplay)
- [Features](#features)
- [Project Structure](#project-structure)
- [Developer Guide](#developer-guide)
  - [Core Mechanics](#core-mechanics)
  - [File Breakdown](#file-breakdown)
  - [Game Loop](#game-loop)
  - [State Management](#state-management)
  - [Entropy Integration](#entropy-integration)
  - [Event Listeners](#event-listeners)
- [Configuration](#configuration)
- [Customization Tips](#customization-tips)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)
## Overview
"White Dot Chaos" is an interactive HTML5 canvas game built with vanilla HTML, CSS, and JavaScript, where players control a white dot navigating a chaotic universe of shapes. The objective is to collide with shapes to score points, collect modifiers, and thrive amidst escalating madness. Featuring two control modes (Auto and Manual), dynamic UI, and an innovative entropy system, the game now supports plugging external randomness sources via HTTP (with a fallback to `Math.random()`). [Play the game now](https://htmlpreview.github.io/?https://github.com/JamalYusuf/White-Dot-Chaos/blob/main/index.html)!

![White Dot Chaos Gameplay](/gameplay.gif)
## Future Goals: Quantum Randomness
A primary vision for "White Dot Chaos" is to integrate a **Quantum Random Number Generator (QRNG)** as an entropy source, bridging quantum mechanics into the macro world. By replacing `Math.random()` with true quantum randomness fetched via HTTP, the game aims to explore how real randomness affects gameplay and player decision-making.

### Why Quantum Entropy?
- **Novelty**: Unlike pseudo-randomness, QRNGs (e.g., from quantum vacuum fluctuations) offer true unpredictability.
- **Impact**: I hypothesize that quantum entropy introduces a richer set of possible game states, subtly altering player choices. This could increase decision complexity and engagement by injecting "quantum chaos" into the macro experience.
- **Macro Connection**: Playing with quantum-derived randomness might influence a player’s brain entropy, potentially expanding their perceived range of actions and strategies.

### Implementation Plan
1. **QRNG Source**: Use an API like ANU QRNG (e.g., `https://qrng.anu.edu.au/API/jsonI.php?length=100&type=uint8`) to fetch random numbers.
2. **Entropy Manager**: Extend `gameState.js` with:
   ```javascript
   const entropyManager = {
       entropyPool: [],
       entropyUrl: 'https://qrng.anu.edu.au/API/jsonI.php?length=100&type=uint8',
       async fetchEntropy() {
           const response = await fetch(this.entropyUrl);
           const data = await response.json();
           this.entropyPool = data.data.map(n => n / 255); // Normalize 0-255 to 0-1
       },
       getRandom() {
           if (!this.entropyPool.length) return Math.random();
           return this.entropyPool.shift();
       }
   };
   ```
3. **Integration**: Replace `Math.random()` calls (e.g., in `animate()`, `Shape` constructor) with `entropyManager.getRandom()`.
4. **Testing**: Compare gameplay with QRNG vs. `Math.random()` to observe differences in shape distribution, modifier timing, and player experience.

### Expected Outcomes
- **Gameplay**: More organic, unpredictable patterns (e.g., clustering or streaks).
- **Player Effect**: Increased entropy in decision-making, potentially measurable via playtime or strategy diversity.
- **Research**: A novel way to study quantum effects in interactive systems.

---

## Quick Start
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/JamalYusuf/White-Dot-Chaos.git
   cd white-dot-chaos
   ```
2. **Run in web browser** (Recommended):
   - Open `index.html` in file explorer, then: drag it into your web browser.
     ```bash
     open .index.html
     ```
3. **Run with Go** :
   - Install Go ([golang.org](https://go.dev/dl/)), then:
     ```bash
     go run main.go
     ```
   - Open `http://localhost:8000` in your browser.
4. **Alternative Servers**:
   - Python: `python -m http.server 8000`
   - Node.js: Use `http-server` (`npm install -g http-server && http-server -p 8000`)

Click "Start Adventure!" to begin controlling the white dot and smashing shapes!

## Gameplay
- **Objective**: Guide the white dot to collide with shapes, earn points, and collect modifiers to boost your abilities.
- **Controls**:
  - **Auto Mode**: The dot moves autonomously, seeking modifiers or random targets.
  - **Manual Mode**:
    - **Mouse**: Follows the cursor with smooth easing (adjustable sensitivity).
    - **WASD/Arrow Keys**: Adds a 50% speed boost.
    - Toggle modes with the `🎮` button (`🤖` in Manual).
    - **Click**: Spawns 3 random shapes at the click position.
- **Scoring**: 
  - 1 point per shape destroyed.
  - Every 10 points awards a modifier; every 100 points increases shape spin speed.
- **Modifiers**: Temporary power-ups (e.g., Speed Boost, Shield) auto-trigger every 5 seconds or activate on click.
- **Settings**: Customize spawn rate, hero speed, mouse sensitivity, and max shapes via the `⚙️` menu.

## Features
- **Dynamic Shapes**: Circles (●), squares (■), and triangles (▲) spawn with random sizes (10-40px), colors, and lifespans.
- **Modifiers**: Five types with unique effects (e.g., 🚀 Speed Boost, ❄️ Freeze).
- **UI**: Real-time score, shape stats, frequency bars, and modifier inventory.
- **Entropy Integration**: Supports external randomness via HTTP, enhancing unpredictability.

## Project Structure
```
white-dot-chaos/
├── index.html        # Main HTML file with game structure
├── css/
│   └── styles.css    # All CSS styles for the game
├── js/
│   ├── utils.js      # Utility functions (e.g., resizeCanvas)
│   ├── gameState.js  # Game state and constants
│   ├── shapes.js     # Shape and Explosion classes
│   ├── gameLogic.js  # Core game logic (animation, collisions, modifiers)
│   └── ui.js         # UI updates and event listeners
├── main.go           # Go server to serve static files
└── README.md         # This documentation
```

---

## Developer Guide

### Core Mechanics
- **White Dot (Hero)**:
  - Size: 20px (40px with Growth modifier).
  - Speed: Configurable (default 0.1).
  - Magnet Range: Pulls shapes within 100px.
  - Trail: Visualizes movement speed.
- **Shapes**:
  - Behavior: Move to random targets; charge the hero after 1s if near.
  - Collision: Same types merge (up to 40px); different types burst.
- **Modifiers**:
  - Awarded every 10 points (max: score/10).
  - Effects (10s duration):
    - 🚀 **Speed Boost**: Triples speed.
    - 🎯 **Aim Assist**: Clears shapes within 200px.
    - 🛡️ **Shield**: Marks and wipes all shapes.
    - 🌟 **Growth**: Doubles size.
    - ❄️ **Freeze**: Halts shape movement.
- **Explosions**: Particle effects on shape destruction.

### File Breakdown
- **`index.html`**: Defines UI and loads scripts in order: `utils.js` → `gameState.js` → `shapes.js` → `gameLogic.js` → `ui.js`.
- **`css/styles.css`**: Styles layout, buttons, and overlays with absolute positioning and transitions.
- **`js/utils.js`**: 
  - `resizeCanvas()`: Resizes canvas to window size.
- **`js/gameState.js`**:
  - Defines `SHAPE_TYPES`, `MODIFIER_TYPES`, `MODIFIER_COLORS`, and `gameState` (shapes, score, etc.).
- **`js/shapes.js`**:
  - `Shape`: Manages entity properties and behavior (movement, drawing).
  - `Explosion`: Handles destruction effects.
- **`js/gameLogic.js`**:
  - `animate()`: Main game loop.
  - Collision, modifier, and control logic.
- **`js/ui.js`**:
  - UI updates (`updateUI()`) and event listeners for interactivity.

### Game Loop
- **Function**: `animate()` in `js/gameLogic.js`.
- **Flow**:
  1. Clear canvas.
  2. Spawn shapes randomly (`spawnRate`).
  3. Update/draw shapes and explosions.
  4. Filter expired objects.
  5. Apply modifiers.
  6. Check collisions.
  7. Award/activate modifiers.
  8. Render edge flash.
  9. Loop via `requestAnimationFrame`.
- **Control**: Paused with `pauseGame()`, resumed with `resumeGame()`.

### State Management
- **Core**: `gameState` object in `js/gameState.js`.
- **Properties**: Tracks shapes, hero, score, modifiers, mode, inputs, and settings.
- **Updates**: Modified by collisions (`triggerCollision()`), UI (`saveSettings()`), etc.
- **Access**: Global, ensuring consistency across scripts.

### Entropy Integration
- **Purpose**: Introduces randomness for unpredictable gameplay.
- **Current Implementation**:
  - Uses `Math.random()` for shape spawning, properties, movement jitter, and modifier selection.
- **Future-Ready**: Designed to integrate external HTTP entropy sources (see Future Goals).
- **Usage**:
  - Spawning: `Math.random() < spawnRate`.
  - Properties: Random size, speed, color, etc.
  - Movement: ±2px jitter.

### Event Listeners
- **Defined**: `js/ui.js`.
- **Key Events**:
  - `startButton.click`: Starts game.
  - `canvas.click`: Spawns shapes.
  - `canvas.mousemove`: Updates mouse position.
  - `window.keydown/keyup`: Tracks movement keys.
  - `modifierButtons.click`: Activates modifiers.
  - `modeButton.click`: Toggles control mode.

---
## Configuration
- **Game Settings** (`gameState.js`):
  ```javascript
  settings: { spawnRate: 0.03, heroSpeed: 0.1, maxShapes: 20, mouseSensitivity: 0.15 }
  ```
  - Adjustable via `⚙️` menu.
- **Entropy**:
  - Set `entropyUrl` to your QRNG endpoint.
  - Example API: Returns JSON array of 0-1 values.

## Customization Tips
- **New Shapes**: Add to `SHAPE_TYPES` and extend `drawShape()`.
- **Modifiers**: Expand `MODIFIER_TYPES` and implement new effects.
- **Visuals**: Tweak colors in `Shape` or enhance `Explosion` particles.
- **Controls**: Add key bindings in `ui.js` (e.g., spacebar action).

## Requirements
- Browser with Canvas and JavaScript support.
- Web server for local testing (Go, Python, or Node.js).
- Optional: HTTP entropy source for advanced randomness.

## Contributing
- Fork and submit PRs with enhancements (e.g., QRNG integration, new features).
- Report issues or suggest ideas via GitHub Issues.

## License
© Jamal Yusuf. Open-source; feel free to adapt and share!

