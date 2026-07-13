// Runtime client config served by the backend (GET /config). Today it carries
// the Mapbox token so the key lives in the backend environment, not the
// frontend build. VITE_MAPBOX_TOKEN stays as a local-dev fallback for when the
// endpoint isn't reachable yet.
import { fetchConfig } from "../lib/api";

let config = {
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || "",
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getConfig() {
  return config;
}

export function getMapboxToken() {
  return config.mapboxToken;
}

// One fetch per session; the server value wins over the env fallback.
let hydrating = null;

export function hydrateConfig() {
  if (!hydrating) {
    hydrating = (async () => {
      try {
        const data = await fetchConfig();
        const token = data?.mapbox_token ?? data?.mapboxToken;
        if (token) {
          config = { ...config, mapboxToken: token };
          emit();
        }
      } catch {
        /* keep the env fallback */
      }
    })().finally(() => {
      hydrating = null;
    });
  }
  return hydrating;
}
