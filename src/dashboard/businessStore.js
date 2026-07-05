// Business profile (name + logo). Shared by the sidebar avatar and Settings,
// persisted to localStorage so an uploaded logo survives reloads.

const KEY = "ardena-business";

const DEFAULTS = { name: "Acme Car Hire", logo: null };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* private mode etc. — run in-memory */
  }
  return { ...DEFAULTS };
}

let state = load();

const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getBusiness() {
  return state;
}

export function setBusiness(next) {
  state = { ...state, ...next };
  persist();
  emit();
}

// First letter for the fallback avatar
export function businessInitial(name) {
  return (name || "A").trim().charAt(0).toUpperCase();
}
