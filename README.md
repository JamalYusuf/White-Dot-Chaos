# White Dot Chaos

Welcome to **White Dot Chaos**, a dynamic HTML5 canvas game where you control a white dot in a universe filled with colorful shapes and powerful modifiers. Smash shapes, collect power-ups, and rack up points in either Auto or Manual mode!

This README provides an overview of the game mechanics, code structure, and instructions for developers looking to explore or enhance the project.

## Table of Contents
- [Game Overview](#game-overview)
- [Game Mechanics](#game-mechanics)
  - [Controls](#controls)
  - [Shapes](#shapes)
  - [Modifiers](#modifiers)
  - [Scoring](#scoring)
- [Code Structure](#code-structure)
- [Logic Explained](#logic-explained)
  - [Game Loop](#game-loop)
  - [Shape Class](#shape-class)
  - [Manual Mode Mechanics](#manual-mode-mechanics)
- [Setup and Running](#setup-and-running)


## Game Overview
"White Dot Chaos" is a single-player game built with HTML, CSS, and JavaScript using the HTML5 Canvas API. You command a white dot (the "hero") that navigates a field of randomly spawning shapes. Your goal is to collide with shapes to earn points, collect modifiers to gain temporary advantages, and avoid overwhelming chaos as the game progresses.

- **Developer**: Jamal Yusuf
- **Current Version**: Updated March 27, 2025
- **Features**: Two control modes (Auto and Manual), customizable settings, and a vibrant UI.

## Game Mechanics

### Controls
- **Auto Mode**: The white dot moves autonomously, targeting modifiers or random points.
- **Manual Mode**: 
  - **Mouse**: Primary control— the white dot follows the cursor with smooth easing.
  - **WASD/Arrow Keys**: Optional speed boost (50% increase) for fine-tuning movement.
  - Toggle between modes using the `🎮` button (switches to `🤖` in Manual mode).

- **Click**: Spawns 3 random shapes at the click location.
- **Settings**: Adjust spawn rate, hero speed, mouse sensitivity, and max shapes via the `⚙️` menu.

### Shapes
- **Types**: Circles (●), Squares (■), Triangles (▲)
- **Size**: 10–40px (hero starts at 20px, max 40px with Growth modifier)
- **Behavior**:
  - Same-type shapes merge (up to 40px), increasing size and health.
  - Different-type shapes burst, reducing health and triggering explosions.
  - Shapes are drawn to the hero within a 100px "magnet" radius.

### Modifiers
Modifiers spawn randomly and provide temporary boosts when collected:
- **🚀 Speed Boost (Red)**: Triples hero speed for 10 seconds.
- **🎯 Aim Assist (Green)**: Destroys shapes within 200px of the hero for 10 seconds.
- **🛡️ Shield (Blue)**: Marks and wipes all shapes after a 0.5-second delay (10s duration).
- **🌟 Growth (Yellow)**: Doubles hero size to 40px for 10 seconds.
- **❄️ Freeze (Cyan)**: Freezes all shapes in place for 10 seconds.

Modifiers are auto-activated randomly every 5 seconds if available, or manually triggered by clicking their icons.

### Scoring
- **Points**: Earn 1 point per shape destroyed.
- **Modifiers**: Every 10 points awards a random modifier (up to score/10 limit).
- **Spins**: At 100 points, shapes begin spinning, increasing difficulty.

## Code Structure
The game is contained in a single HTML file with embedded CSS and JavaScript:
- **HTML**: Defines the game UI (canvas, buttons, menus).
- **CSS**: Styles the interface with a dark theme and responsive layout.
- **JavaScript**:
  - **Constants**: Shape types, modifier types, and colors.
  - **Game State**: Tracks shapes, hero, score, modifiers, and settings.
  - **Classes**: `Shape` (for hero, shapes, modifiers) and `Explosion` (visual effects).
  - **Logic**: Functions for collisions, UI updates, modifier handling, and animation.
  - **Event Listeners**: Handles mouse, keyboard, and window events.

## Logic Explained

### Game Loop
The `animate` function drives the game:
1. Clears the canvas.
2. Spawns shapes based on `spawnRate` (capped at `maxShapes`).
3. Updates and draws all shapes and explosions.
4. Checks collisions, awards modifiers, and updates the UI.
5. Uses `requestAnimationFrame` for smooth 60 FPS rendering.

### Shape Class
The `Shape` class is the core of the game:
- **Properties**: Position (`x`, `y`), `size`, `type`, `color`, `health`, `speed`, `trail` (hero only).
- **Methods**:
  - `update()`: Applies modifiers and mode-specific logic (`updateAuto` or `updateManual`).
  - `move()`: Updates position based on mode (velocity for Manual, target-based for Auto).
  - `draw()`: Renders shapes with trails, rotations, and modifier effects.
  - `collidesWith()`: Detects collisions for merging or bursting.

### Manual Mode Mechanics
Manual mode was recently enhanced for better mouse control:
- **Mouse Following**: 
  - The hero moves toward the mouse cursor with easing (`0.1`) for smoothness.
  - Adjustable via `mouseSensitivity` (0.05–0.3, default 0.15).
  - A 5px deadzone prevents jitter near the cursor.
- **Velocity**: 
  - `vx` and `vy` are updated based on mouse direction and speed, capped at `baseSpeed * boostFactor`.
  - Drag (`0.9`) ensures natural deceleration.
- **Keyboard Boost**: 
  - WASD/Arrow keys add a 50% speed boost, making them optional for quick maneuvers.
- **Trail**: Scales with velocity (up to 20px), providing visual feedback.

See `Shape.updateManual` and `Shape.updateTrail` for implementation details.

## Setup and Running
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/JamalYusuf/White-Dot-Chaos.git
 