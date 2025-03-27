
# White Dot Chaos

## Overview
"White Dot Chaos" is an interactive HTML5 canvas game where players control a white dot navigating a chaotic universe of shapes. The goal is to collide with shapes to score points, collect modifiers, and survive the escalating madness. The game supports two control modes (Auto and Manual) and now includes an entropy system for plugging in external randomness sources via HTTP, with a fallback to `Math.random()` [Click here to play the game now](https://htmlpreview.github.io/?https://github.com/JamalYusuf/White-Dot-Chaos/blob/main/white_dot_chaos.html).
![White Dot Chaos](/gameplay.gif){ .image25percent }
## Setup and Running
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/JamalYusuf/White-Dot-Chaos.git
 
This README provides an in-depth look at the game’s mechanics, configuration, and developer-relevant details to facilitate customization and experimentation.

## Gameplay
- **Objective**: Control the White Dot to smash shapes for points, collect modifiers, and rack up a high score.
## Controls:
- **Auto Mode**: The white dot moves autonomously, targeting modifiers or random points.
- **Manual Mode**: 
  - **Mouse**: Primary control— the white dot follows the cursor with smooth easing.
  - **WASD/Arrow Keys**: Optional speed boost (50% increase) for fine-tuning movement.
  - Toggle between modes using the `🎮` button (switches to `🤖` in Manual mode).
  - **Click**: Spawns 3 random shapes at the click location.  
- **Scoring**: Colliding with shapes earns 1 point each. Every 10 points awards a modifier; every 100 points increases shape spin speed.
- **Settings**: Adjust spawn rate, hero speed, mouse sensitivity, and max shapes via the `⚙️` menu.

- **Modifiers**: Temporary power-ups (e.g., speed boost, shield) that trigger automatically or via player clicks.

## Features
- **Dynamic Shapes**: Circles, squares, and triangles spawn with random sizes, colors, and lifespans.
- **Modifiers**: Five types (Speed Boost, Aim Assist, Shield, Growth, Freeze) with unique effects.
- **UI**: Displays score, top shapes, frequency bars, and modifier counts.
- **Settings**: Adjustable spawn rate, hero speed, mouse sensitivity, and max shapes.
- **Entropy Integration**: Supports external randomness via HTTP with fallback to local randomness.

## Requirements
- **Browser**: Modern browser with JavaScript and Canvas support (e.g., Chrome, Firefox).
- **Server**: A web server (e.g., `python -m http.server`, Node.js) for HTTP entropy fetching.
- **Entropy Source**: Optional HTTP endpoint providing random numbers (0 to 1) in JSON format.

## Installation
1. **Obtain the Code**: Clone the repository or download `white_dot_chaos.html`.
2. **Host the Game**: Serve the file via a web server:
   - Python: `python -m http.server 8000`
   - Node.js: Use a simple static server (e.g., `serve`).
3. **Open in Browser**: Navigate to `http://localhost:8000/white_dot_chaos.html`.

## Game Logic
### Core Mechanics
- **White Dot (Hero)**:
  - Size: 20px (40px with Growth modifier).
  - Speed: Configurable via settings (default 0.1).
  - Magnet Range: Pulls shapes within 100px (5x size).
  - Trail: Visual feedback of movement speed.
- **Shapes**:
  - Types: Circles (●), Squares (■), Triangles (▲)
  - Size: 10-40px (randomly assigned).
  - Behavior: Move toward random targets; charge at the hero after 1 second if close.
  - Collision: Same types merge (up to 40px); different types damage each other.
- **Behavior**:
  - Same-type shapes merge (up to 40px), increasing size and health.
  - Different-type shapes burst, reducing health and triggering explosions.
  - Shapes are drawn to the hero within a 100px "magnet" radius.
- **Modifiers**: Modifiers spawn randomly and provide temporary boosts when collected:
  - Awarded every 10 points.
  - Auto-triggered randomly every 5 seconds or manually clicked.
  - Effects:
    - 🚀 **Speed Boost**: Triples hero speed (10s).
    - 🎯 **Aim Assist**: Destroys shapes within 200px (10s).
    - 🛡️ **Shield**: Marks and wipes all shapes (10s).
    - 🌟 **Growth**: Doubles hero size (10s).
    - ❄️ **Freeze**: Stops shape movement (10s).
- **Explosions**: Visual effect on shape destruction with particles.
- **Scoring**:
    - **Points**: Earn 1 point per shape destroyed.
    - **Modifiers**: Every 10 points awards a random modifier (up to score/10 limit).
    - **Spins**: At 100 points, shapes begin spinning, increasing difficulty.

### Control Modes
- **Auto Mode**:
  - Hero seeks nearest modifier within 200px or moves to random targets.
  - Uses simple linear interpolation for movement.
- **Manual Mode**:
  - Mouse-driven with easing (sensitivity adjustable, default 0.15).
  - WASD/Arrow keys provide a 50% speed boost.
  - Drag (0.9) and max speed cap ensure smooth control.

### Randomness
- **Entropy Manager**: Manages randomness with an external HTTP source or `Math.random()` fallback.
- **Affected Elements**:
  - Shape spawning (position, size, type, color, life, speed).
  - Modifier selection and timing.
  - Movement jitter (±2px).
  - Explosion particle properties (velocity, size, life, color).

## Configuration
### Game Settings
Accessible via the settings menu (`⚙️`):
- **Shape Spawn Rate**: 0.01-0.1 (default 0.03) - Probability of spawning per frame.
- **White Dot Speed**: 0.05-0.2 (default 0.1) - Base movement speed.
- **Mouse Sensitivity**: 0.05-0.3 (default 0.15) - Manual mode responsiveness.
- **Max Shapes**: 10-50 (default 20) - Maximum concurrent shapes on screen.

Update these in `gameState.settings`:
```javascript
settings: { spawnRate: 0.03, heroSpeed: 0.1, maxShapes: 20, mouseSensitivity: 0.15 }
```

### Entropy Configuration
Managed by `entropyManager`:
```javascript
const entropyManager = {
    entropyPool: [],
    entropyUrl: 'https://example.com/entropy', // Customizable endpoint
    isFetching: false,
    // ... methods ...
};
```
- **entropyUrl**: Replace with your API endpoint (e.g., `http://localhost:3000/entropy`).
- **API Format**: Must return a JSON array of numbers (0 to 1), e.g., `[0.234, 0.789, 0.123]`.

#### Example Entropy API
```javascript
const express = require('express');
const app = express();
app.get('/entropy', (req, res) => {
    const entropy = Array.from({ length: 100 }, () => Math.random());
    res.json(entropy);
});
app.listen(3000, () => console.log('Entropy server on port 3000'));
```

### Constants
Modify these in the `<script>` section:
- **SHAPE_TYPES**: `['circle', 'square', 'triangle']` - Add/remove shape types.
- **MODIFIER_TYPES**: `['🚀', '🎯', '🛡️', '🌟', '❄️']` - Add/remove modifiers.
- **MODIFIER_COLORS**: Maps modifier emojis to colors (e.g., `'🚀': '#ff0000'`).

## Developer Documentation
### File Structure
- **Single File**: `white_dot_chaos.html` contains HTML, CSS, and JavaScript.
  - **HTML**: Structure for canvas, UI, buttons, and menus.
  - **CSS**: Styling for game elements and UI.
  - **JavaScript**: Game logic, rendering, and entropy management.

### Key Classes
- **Shape**:
  - Properties: `x`, `y`, `type`, `size`, `color`, `health`, `speed`, `vx`, `vy`, `trail`.
  - Methods:
    - `update()`: Handles movement and modifier effects.
    - `draw()`: Renders shape and trail.
    - `collidesWith()`: Collision detection.
    - `combineWith()`: Merges same-type shapes.
- **Explosion**:
  - Properties: `x`, `y`, `size`, `color`, `particles`.
  - Methods:
    - `update()`: Animates explosion and particles.
    - `draw()`: Renders explosion effect.

### Game Loop
The `animate` function drives the game:
1. Clears the canvas.
2. Spawns shapes based on `spawnRate` (capped at `maxShapes`).
3. Updates and draws all shapes and explosions.
4. Checks collisions, awards modifiers, and updates the UI.
5. Uses `requestAnimationFrame` for smooth 60 FPS rendering.

### Game State (`gameState`)
- **shapes**: Array of all active shapes (including hero).
- **hero**: Reference to the White Dot instance.
- **score**: Current player score.
- **activeModifiers**: Array of active modifier objects (`{type, timer, modifierColor}`).
- **stats**: Tracks shape collision counts (`{circle, square, triangle}`).
- **modifierCounts**: Tracks available modifiers (`{🚀, 🎯, 🛡️, 🌟, ❄️}`).
- **settings**: Configurable game parameters.

### Entropy Integration
- **entropyManager**:
  - `fetchEntropy()`: Async fetch from `entropyUrl`, filters valid numbers, logs status.
  - `getRandom()`: Returns next entropy value or `Math.random()`.
  - `getRandomInt(min, max)`: Integer from entropy for array indexing.
- **Usage**: Replaces all `Math.random()` calls. Refetches when `entropyPool` < 10.
- **Fallback**: If fetch fails or pool is empty, uses `Math.random()`.

### Event Listeners
- **Canvas**: Click to spawn shapes, mousemove for manual mode.
- **Window**: Keydown/keyup for WASD/arrows, resize for canvas adjustment.
- **Buttons**: Start, help, settings, mode toggle, modifier activation.

### Animation Loop (`animate`)
- Clears canvas, spawns shapes, updates/draws all objects, handles collisions, and refetches entropy.
- Uses `requestAnimationFrame` for smooth rendering.
- Includes error handling to resume on failure.

## Customization Tips
- **Add New Shapes**: Extend `SHAPE_TYPES` and update `drawShape()` with new rendering logic.
- **New Modifiers**: Add to `MODIFIER_TYPES` and `MODIFIER_COLORS`, implement effects in `applyModifiers()` or new functions.
- **Entropy Testing**: Use a biased API (e.g., `Array(100).fill(0.2)`) to study distribution effects.
- **UI Enhancements**: Modify CSS in `<style>` or add new DOM elements in `<body>`.

## Testing
- **Entropy Effects**: Test with a good source (e.g., quantum RNG) vs. biased source (e.g., low values) to observe shape clustering or modifier bias.
- **Manual Mode**: Adjust `mouseSensitivity` and key boost in settings to refine controls.
- **Performance**: Monitor frame rate with many shapes (`maxShapes`) or slow entropy API.
- **Fallback**: Disconnect the entropy API to verify `Math.random()` usage.

## Limitations
- **Single-Threaded**: Heavy entropy fetching may impact performance if not optimized.
- **Entropy Dependency**: Relies on network for external randomness; fallback mitigates this.
- **Fixed Refetch**: Threshold of 10 may need tuning for different use cases.

## Contributing
- Fork the repository and submit pull requests with improvements.
- Report bugs or suggest features via issues.
- Focus areas: entropy sources, new modifiers, performance optimizations.

## License
© Jamal Yusuf. Distributed under the original game’s license (specify if applicable).

