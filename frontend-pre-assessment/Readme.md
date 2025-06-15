# Traffic Light Simulation

A simple traffic light UI built with React, demonstrating a pure Finite State Machine (FSM) model to manage state transitions and timer logic. This project simulates a traffic light cycling through Red, Green, and Yellow states with precise timing and controls for start, pause, and reset.

---

## Features

- Pure FSM implementation for traffic light state management.
- Traffic light cycles in the order: **Red → Green → Yellow → Red** (loop).
- Configurable durations for each light:
  - Red: 5 seconds
  - Green: 4 seconds
  - Yellow: 2 seconds
- Start, pause, and reset controls with timer state preservation.
- Timer uses `requestAnimationFrame` for smooth and accurate countdown.
- Separation of concerns: FSM logic is decoupled from UI rendering.
- Scalable design allowing easy addition of new states (e.g., pedestrian light).
- Clean and well-structured React component with custom hooks.

---

## Installation

Ensure you have Node.js version 18 or higher installed.

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. Install dependencies:

```bash
npm install
```

---

## Running the Project

Start the development server with:

```bash
npm start
```

This will launch the app in your default browser, typically at `http://localhost:3000`.

---

## Usage

- **Start/Pause Button**: Toggles the traffic light cycling. When paused, the current state and timer freeze.
- **Reset Button**: Stops the cycling and resets the light to Red.
- The current light color, state name, and remaining time in seconds are displayed.
- The traffic light UI visually highlights the active light with glowing effects.

---

## Architecture and Design

The core of the project is a pure Finite State Machine (FSM) implemented in the `TrafficLightFSM` class, which manages:

- Current state (`RED`, `GREEN`, `YELLOW`).
- State durations and transitions.
- Running/paused status.
- Timer countdown and transitions triggered by elapsed time.

---

## Code Structure

- `src/components/TrafficLight.jsx`: Main React component and FSM implementation.
- `src/App.jsx`: Application root component (renders `TrafficLight`).
- `src/main.jsx`: Entry point for React DOM rendering.
- `public/index.html`: HTML template.
- `docs/traffic-light.gif`: Animated demonstration of the traffic light behavior.

---
