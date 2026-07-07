// In-memory clients store, same pattern as fleetStore and bookingsStore.
// Clients are the business's renters, booking counts and spend are derived
// live from bookingsStore, so the two stay in sync. Replaced by the clients
// API when it ships (docs/backend-api.md §5).

let clients = [];

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getClients() {
  return clients;
}

export function getClient(id) {
  return clients.find((c) => c.id === id);
}

export function removeClient(id) {
  clients = clients.filter((c) => c.id !== id);
  emit();
}
