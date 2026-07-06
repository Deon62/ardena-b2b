// Preview toggle: with sample data (Acme's mock records) vs empty, so we
// can see how a brand-new business looks and backend devs can see what the
// UI expects. Data stores read getSampleData() and re-emit when it flips.

const KEY = "ardena-sample-data";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) return raw === "true";
  } catch {
    /* private mode etc. */
  }
  return true; // default: show the demo data
}

let sample = load();

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSampleData() {
  return sample;
}

export function toggleSampleData() {
  sample = !sample;
  try {
    localStorage.setItem(KEY, String(sample));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}
