// Rental policy (mock backend): security deposit and late-return penalty.
// Used by agreements, check-in penalty math and the Settings page.

let policy = {
  deposit: 10000, // KES held per booking
  lateFeePerHour: 500, // KES charged for every hour past the return time
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getPolicy() {
  return policy;
}

export function setPolicy(next) {
  policy = { ...policy, ...next };
  emit();
}

// Vehicles are due back by 10:00 on the return date.
export const RETURN_HOUR = 10;
