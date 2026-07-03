// In-memory fleet store (mock backend). Pages subscribe via useSyncExternalStore,
// so add/delete actions reflect everywhere until a real API replaces this.

let vehicles = [
  { name: "Toyota Prado", plate: "KDL 482A", cat: "SUV", rate: 12000, util: 82, ins: "12 Jul 2026", inspection: "4 Feb 2027", added: "14 Mar 2025", status: "On booking", notes: "" },
  { name: "Mazda CX-5", plate: "KDQ 118F", cat: "SUV", rate: 9500, util: 74, ins: "3 Nov 2026", inspection: "21 May 2027", added: "2 Jun 2025", status: "On booking", notes: "" },
  { name: "Subaru Forester", plate: "KDN 226E", cat: "SUV", rate: 9000, util: 68, ins: "18 Sep 2026", inspection: "9 Apr 2027", added: "27 Aug 2025", status: "Available", notes: "" },
  { name: "Toyota Axio", plate: "KDJ 903C", cat: "Saloon", rate: 4500, util: 71, ins: "2 Oct 2026", inspection: "16 Jan 2027", added: "5 Jan 2025", status: "On booking", notes: "" },
  { name: "Toyota Premio", plate: "KCY 651H", cat: "Saloon", rate: 5000, util: 63, ins: "22 Aug 2026", inspection: "30 Nov 2026", added: "19 Feb 2025", status: "Available", notes: "" },
  { name: "Honda Fit", plate: "KDG 337J", cat: "Hatchback", rate: 3500, util: 58, ins: "9 Dec 2026", inspection: "12 Jun 2027", added: "8 Oct 2025", status: "Available", notes: "" },
  { name: "Mazda Demio", plate: "KCT 904K", cat: "Hatchback", rate: 3200, util: 49, ins: "15 Jan 2027", inspection: "23 Jul 2027", added: "1 Dec 2024", status: "Available", notes: "" },
  { name: "Nissan NV350", plate: "KCZ 771B", cat: "Van", rate: 7500, util: 66, ins: "17 Jul 2026", inspection: "8 Mar 2027", added: "11 Apr 2025", status: "On booking", notes: "" },
  { name: "Toyota HiAce", plate: "KDB 129D", cat: "Van", rate: 8000, util: 61, ins: "30 Sep 2026", inspection: "17 Feb 2027", added: "23 May 2025", status: "Available", notes: "" },
  { name: "Toyota Hilux", plate: "KDA 554D", cat: "Pickup", rate: 8500, util: 57, ins: "8 Aug 2026", inspection: "26 Oct 2026", added: "30 Jul 2025", status: "In maintenance", notes: "Gearbox service" },
  { name: "Isuzu D-Max", plate: "KCX 449G", cat: "Pickup", rate: 8000, util: 52, ins: "25 Oct 2026", inspection: "14 Apr 2027", added: "16 Sep 2025", status: "Available", notes: "" },
  { name: "Land Rover Defender", plate: "KDM 001Z", cat: "SUV", rate: 18000, util: 44, ins: "29 Jul 2026", inspection: "3 Dec 2026", added: "20 Jan 2026", status: "In maintenance", notes: "Suspension check after upcountry hire" },
];

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
