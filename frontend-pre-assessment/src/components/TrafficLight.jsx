import React, { useState, useEffect, useRef, useCallback } from 'react';

// FSM State Configuration
const LIGHT_STATES = {
  RED: { 
    name: 'RED', 
    duration: 5000, // 5 seconds
    next: 'GREEN',
    color: '#ff0000'
  },
  GREEN: { 
    name: 'GREEN', 
    duration: 4000, // 4 seconds
    next: 'YELLOW',
    color: '#00ff00'
  },
  YELLOW: { 
    name: 'YELLOW', 
    duration: 2000, // 2 seconds
    next: 'RED',
    color: '#ffff00'
  }
};

// FSM Actions
const FSM_ACTIONS = {
  START: 'START',
  PAUSE: 'PAUSE',
  RESET: 'RESET',
  TICK: 'TICK',
  TRANSITION: 'TRANSITION'
};

// Pure FSM Class - Separated from UI
class TrafficLightFSM {
  constructor(initialState = 'RED') {
    this.currentState = LIGHT_STATES[initialState];
    this.isRunning = false;
    this.remainingTime = this.currentState.duration;
    this.listeners = new Set();
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Get current state snapshot
  getState() {
    return {
      currentState: this.currentState.name,
      color: this.currentState.color,
      remainingTime: this.remainingTime,
      isRunning: this.isRunning,
      secondsLeft: Math.ceil(this.remainingTime / 1000)
    };
  }

  // Handle FSM actions
  dispatch(action, payload = {}) {
    switch (action) {
      case FSM_ACTIONS.START:
        if (!this.isRunning) {
          this.isRunning = true;
          this.notify();
        }
        break;

      case FSM_ACTIONS.PAUSE:
        if (this.isRunning) {
          this.isRunning = false;
          this.notify();
        }
        break;

      case FSM_ACTIONS.RESET:
        this.isRunning = false;
        this.currentState = LIGHT_STATES.RED;
        this.remainingTime = this.currentState.duration;
        this.notify();
        break;

      case FSM_ACTIONS.TICK:
        if (this.isRunning) {
          const { deltaTime } = payload;
          this.remainingTime = Math.max(0, this.remainingTime - deltaTime);
          
          if (this.remainingTime <= 0) {
            this.dispatch(FSM_ACTIONS.TRANSITION);
          } else {
            this.notify();
          }
        }
        break;

      case FSM_ACTIONS.TRANSITION:
        const nextStateName = this.currentState.next;
        this.currentState = LIGHT_STATES[nextStateName];
        this.remainingTime = this.currentState.duration;
        this.notify();
        break;

      default:
        console.warn(`Unknown action: ${action}`);
    }
  }
}

// Custom hook for timer management
function useAnimationTimer(callback, isActive) {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [callback, isActive]);

  useEffect(() => {
    if (isActive) {
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, isActive]);
}

// Main Traffic Light Component
export default function TrafficLight() {
  const fsmRef = useRef(new TrafficLightFSM());
  const [state, setState] = useState(() => fsmRef.current.getState());

  // Subscribe to FSM state changes
  useEffect(() => {
    const fsm = fsmRef.current;
    const unsubscribe = fsm.subscribe(setState);
    return unsubscribe;
  }, []);

  // Timer tick handler
  const handleTick = useCallback((deltaTime) => {
    fsmRef.current.dispatch(FSM_ACTIONS.TICK, { deltaTime });
  }, []);

  // Use animation timer when running
  useAnimationTimer(handleTick, state.isRunning);

  // Event handlers
  const handleStartPause = useCallback(() => {
    const action = state.isRunning ? FSM_ACTIONS.PAUSE : FSM_ACTIONS.START;
    fsmRef.current.dispatch(action);
  }, [state.isRunning]);

  const handleReset = useCallback(() => {
    fsmRef.current.dispatch(FSM_ACTIONS.RESET);
  }, []);

  // Render individual light
  const renderLight = (lightState, isActive) => (
    <div
      key={lightState.name}
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        marginBottom: 15,
        backgroundColor: isActive ? lightState.color : '#333',
        border: '3px solid #666',
        boxShadow: isActive 
          ? `0 0 20px ${lightState.color}, inset 0 0 20px rgba(255,255,255,0.2)` 
          : 'inset 0 0 10px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease-in-out',
      }}
    />
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: '#white'
    }}>
      <h1 style={{ color: '#fff', marginBottom: '30px', fontSize: '2em' }}>
        Traffic Light FSM
      </h1>
      
      {/* Traffic Light Housing */}
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '20px',
        borderRadius: '20px',
        border: '4px solid #666',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        marginBottom: '30px'
      }}>
        {renderLight(LIGHT_STATES.RED, state.currentState === 'RED')}
        {renderLight(LIGHT_STATES.YELLOW, state.currentState === 'YELLOW')}
        {renderLight(LIGHT_STATES.GREEN, state.currentState === 'GREEN')}
      </div>

      {/* Status Display */}
      <div style={{ 
        backgroundColor: '#2c2c2c',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        minWidth: '200px',
        textAlign: 'center',
        border: '2px solid #666'
      }}>
        <div style={{ fontSize: '1.5em', color: state.color, fontWeight: 'bold' }}>
          {state.currentState}
        </div>
        <div style={{ fontSize: '2em', color: '#fff', margin: '10px 0' }}>
          {state.secondsLeft}s
        </div>
        <div style={{ fontSize: '0.9em', color: '#ccc' }}>
          Status: {state.isRunning ? 'Running' : 'Paused'}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={handleStartPause}
          style={{
            padding: '12px 24px',
            fontSize: '1.1em',
            backgroundColor: state.isRunning ? '#ff4444' : '#44ff44',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {state.isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={handleReset}
          style={{
            padding: '12px 24px',
            fontSize: '1.1em',
            backgroundColor: '#4488ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Reset
        </button>
      </div>
    </div>
  );

}
