// Owner-blocked days per vehicle (mock backend). Blocking a day takes it
// out of the booking picker too, so blocked dates can never be booked.

let blocked = {
  "KDL 482A": ["2026-07-24", "2026-07-25"], // service days after the Otieno rental
  "KDG 337J": ["2026-07-18"],
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getBlocked() {
  return blocked;
}

export function toggleBlocked(plate, iso) {
  const days = blocked[plate] || [];
  blocked = {
    ...blocked,
    [plate]: days.includes(iso)
      ? days.filter((d) => d !== iso)
      : [...days, iso],
  };
  emit();
}
