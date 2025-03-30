let currentComponent = null;
let hookIndex = 0;


/**
 * Sets the current component for hook operations
 * @param {object} component - Current functional component being rendered
 */
function setCurrentComponent(component) {
    currentComponent = component;
    hookIndex = 0;
}


/**
 * useState hook implementation
 * @param {any} initialState - Initial state value
 * @returns {Array} [state, setState]
 */
function useState(initialState) {
    const component = currentComponent;
    const index = hookIndex++;
    
    // Initialize hooks array if needed
    if (!component.hooks) {
      component.hooks = [];
    }
    
    // Initialize hook state if needed
    if (index >= component.hooks.length) {
      component.hooks[index] = {
        state: typeof initialState === 'function' ? initialState() : initialState,
        queue: []
      };
    }
    
    const hook = component.hooks[index];
    
    // Process state updates from previous render
    if (hook.queue.length > 0) {
      hook.queue.forEach(action => {
        hook.state = typeof action === 'function'
          ? action(hook.state)
          : action;
      });
      hook.queue = [];
    }
    
    // Return current state and setState function
    const setState = (action) => {
      hook.queue.push(action);
      scheduleUpdate(component);
    };
    
    return [hook.state, setState];
}

/**
 * useEffect hook implementation
 * @param {function} callback - Effect callback function
 * @param {Array} deps - Dependency array
 */
function useEffect(callback, deps) {
    const component = currentComponent;
    const index = hookIndex++;
    
    // Initialize hooks array if needed
    if (!component.hooks) {
      component.hooks = [];
    }
    
    const hook = component.hooks[index] || { deps: null, cleanup: null };
    const hasNoDeps = !deps;
    const hasDepsChanged = hook.deps
      ? !deps.every((dep, i) => dep === hook.deps[i])
      : true;
    
    // Run effect if needed
    if (hasNoDeps || hasDepsChanged) {
      // Run cleanup function if it exists
      if (hook.cleanup) {
        hook.cleanup();
      }
      
      // Run effect and store cleanup function
      const cleanup = callback();
      hook.cleanup = typeof cleanup === 'function' ? cleanup : null;
      hook.deps = deps;
    }
    
    // Update hook in component
    component.hooks[index] = hook;
}

/**
 * Schedule component update
 * @param {object} component - Component to update
 */
function scheduleUpdate(component) {
    // Connect to the window global that the renderer exposes
    if (typeof window.__REACT_SCHEDULE_UPDATE === 'function') {
      window.__REACT_SCHEDULE_UPDATE(component);
    } else {
      console.error("No update scheduler found. Make sure renderer.js is loaded first.");
    }
}

export { useState, useEffect, setCurrentComponent };