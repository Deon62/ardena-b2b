// Onboarding checklist state. Steps flip to done when the real action
// happens anywhere in the app (stores call markStep), and progress
// survives reloads via localStorage.

const KEY = "ardena-onboarding";

const DEFAULTS = {
  vehicle: true, // the demo workspace already has a fleet
  booking: true, // and bookings on record
  prompt: false,
  verify: false,
  team: false,
  dismissed: false,
};

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

export function getOnboarding() {
  return state;
}

export function markStep(step) {
  if (state[step]) return;
  state = { ...state, [step]: true };
  persist();
  emit();
}

export function dismissOnboarding() {
  state = { ...state, dismissed: true };
  persist();
  emit();
}
