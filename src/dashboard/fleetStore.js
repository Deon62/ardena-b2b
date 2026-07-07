// In-memory fleet store. Pages subscribe via useSyncExternalStore, so
// add/delete actions reflect everywhere until the fleet API replaces this
// (docs/backend-api.md §3).
import { markStep } from "./onboardingStore";

let vehicles = [];

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getVehicles() {
  return vehicles;
}

export function getVehicle(plate) {
  return vehicles.find((v) => v.plate === plate);
}

export function addVehicle(v) {
  vehicles = [{ notes: "", util: 0, ...v }, ...vehicles];
  markStep("vehicle");
  emit();
}

export function removeVehicle(plate) {
  vehicles = vehicles.filter((v) => v.plate !== plate);
  emit();
}

/* ---- date helpers (mock data uses display strings) ---- */

const FMT = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// "2026-08-12" (date input) -> "12 Aug 2026"
export function formatDateInput(iso) {
  if (!iso) return "";
  return FMT.format(new Date(`${iso}T00:00:00`));
}

// days from today until a display date like "12 Jul 2026"; null if unparsable
export function daysUntil(display) {
  const t = Date.parse(display);
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

// warn threshold shared by table + details
export function expiringSoon(display) {
  const d = daysUntil(display);
  return d !== null && d >= 0 && d <= 30 ? d : null;
}
