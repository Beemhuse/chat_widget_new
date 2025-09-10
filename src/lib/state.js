// Simple pub/sub state manager
export function createStore(initialState = {}) {
  let state = { ...initialState };
  let listeners = [];

  function getState() {
    return state;
  }

  function setState(updates) {
    state = { ...state, ...updates };
    listeners.forEach((cb) => cb(state));
  }

  function subscribe(cb) {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter((fn) => fn !== cb);
    };
  }

  return { getState, setState, subscribe };
}
