// In-memory bookings store (mock backend), same pattern as fleetStore.
import { markStep } from "./onboardingStore";
import { subscribe as subscribeDemo, getSampleData } from "./demoStore";

const EMPTY = [];
// Pages subscribe via useSyncExternalStore, so create/status actions
// reflect everywhere until a real API replaces this.
// Lifecycle: Pending → Confirmed → Active → Completed, or Cancelled early.

let bookings = [
  { ref: "BK-2438", customer: "Kevin Omondi", phone: "0715 402 118", vehicle: "Toyota Premio", plate: "KCY 651H", pickup: "2026-07-10", dropoff: "2026-07-12", location: "Westlands office", rate: 5000, status: "Pending", payment: "Unpaid", verification: "Pending", created: "2026-07-03", notes: "" },
  { ref: "BK-2437", customer: "Mercy Wambui", phone: "0728 664 903", vehicle: "Honda Fit", plate: "KDG 337J", pickup: "2026-07-08", dropoff: "2026-07-11", location: "JKIA, Terminal 1", rate: 3500, status: "Pending", payment: "Prompt sent", verification: "Pending", created: "2026-07-02", notes: "Arriving on KQ311, evening pickup." },
  { ref: "BK-2436", customer: "Dennis Mutua", phone: "0733 218 447", vehicle: "Toyota HiAce", plate: "KDB 129D", pickup: "2026-07-18", dropoff: "2026-07-20", location: "Mombasa Rd depot", rate: 8000, status: "Confirmed", payment: "Unpaid", verification: "Pending", created: "2026-07-01", notes: "Church group trip to Naivasha." },
  { ref: "BK-2435", customer: "Grace Achieng", phone: "0701 559 232", vehicle: "Subaru Forester", plate: "KDN 226E", pickup: "2026-07-09", dropoff: "2026-07-13", location: "Westlands office", rate: 9000, status: "Confirmed", payment: "Prompt sent", verification: "Verified", created: "2026-06-30", notes: "" },
  { ref: "BK-2434", customer: "James Otieno", phone: "0722 807 154", vehicle: "Toyota Prado", plate: "KDL 482A", pickup: "2026-07-12", dropoff: "2026-07-15", location: "Karen branch", rate: 12000, status: "Confirmed", payment: "Paid", verification: "Verified", created: "2026-06-28", notes: "" },
  { ref: "BK-2431", customer: "Wanjiku Kamau", phone: "0722 118 340", vehicle: "Toyota Prado", plate: "KDL 482A", pickup: "2026-07-02", dropoff: "2026-07-06", location: "Karen branch", rate: 12000, status: "Active", payment: "Paid", verification: "Verified", created: "2026-06-25", notes: "" },
  { ref: "BK-2429", customer: "Brian Mwangi", phone: "0740 331 806", vehicle: "Mazda CX-5", plate: "KDQ 118F", pickup: "2026-06-30", dropoff: "2026-07-07", location: "Westlands office", rate: 9500, status: "Active", payment: "Paid", verification: "Verified", created: "2026-06-22", notes: "Upcountry use approved, Nakuru." },
  { ref: "BK-2426", customer: "Faith Njeri", phone: "0712 990 574", vehicle: "Toyota Axio", plate: "KDJ 903C", pickup: "2026-07-01", dropoff: "2026-07-05", location: "Westlands office", rate: 4500, status: "Active", payment: "Paid", verification: "Verified", created: "2026-06-20", notes: "" },
  { ref: "BK-2424", customer: "Samuel Kiptoo", phone: "0723 447 019", vehicle: "Nissan NV350", plate: "KCZ 771B", pickup: "2026-06-28", dropoff: "2026-07-10", location: "Mombasa Rd depot", rate: 7500, status: "Active", payment: "Paid", verification: "Verified", created: "2026-06-18", notes: "Corporate hire, Chemonics field team." },
  { ref: "BK-2421", customer: "Daniel Kimani", phone: "0733 605 281", vehicle: "Toyota Hilux", plate: "KDA 554D", pickup: "2026-06-25", dropoff: "2026-06-28", location: "Karen branch", rate: 8500, status: "Cancelled", payment: "Refunded", verification: "Verified", created: "2026-06-15", notes: "Vehicle pulled into maintenance; customer refunded." },
  { ref: "BK-2419", customer: "Alice Muthoni", phone: "0708 772 460", vehicle: "Mazda Demio", plate: "KCT 904K", pickup: "2026-06-20", dropoff: "2026-06-24", location: "Westlands office", rate: 3200, status: "Completed", payment: "Paid", verification: "Verified", created: "2026-06-12", notes: "" },
  { ref: "BK-2415", customer: "Peter Njoroge", phone: "0721 348 995", vehicle: "Isuzu D-Max", plate: "KCX 449G", pickup: "2026-06-12", dropoff: "2026-06-18", location: "Mombasa Rd depot", rate: 8000, status: "Completed", payment: "Paid", verification: "Verified", created: "2026-06-05", notes: "" },
  { ref: "BK-2411", customer: "Rose Chebet", phone: "0736 210 583", vehicle: "Toyota Prado", plate: "KDL 482A", pickup: "2026-06-05", dropoff: "2026-06-09", location: "Karen branch", rate: 12000, status: "Completed", payment: "Paid", verification: "Verified", created: "2026-05-29", notes: "" },
];

let nextRef = 2439;

/* Deposits and handover records (mock until the backend lands).
   depositStatus: Pending (not yet collected) → Held → Refunded / Forfeited.
   handover.out is recorded at pickup, handover.in at return. */
const HANDOVERS = {
  // live rentals: checked out, not yet back
  "BK-2431": { out: { odometer: 48210, fuel: "Full", at: "2 Jul, 09:05", notes: "" }, in: null },
  "BK-2429": { out: { odometer: 61340, fuel: "3/4", at: "30 Jun, 10:20", notes: "Small scratch on rear bumper noted." }, in: null },
  "BK-2426": { out: { odometer: 30115, fuel: "Full", at: "1 Jul, 08:40", notes: "" }, in: null },
  "BK-2424": { out: { odometer: 88770, fuel: "Full", at: "28 Jun, 07:55", notes: "" }, in: null },
  // completed, returned on time
  "BK-2415": {
    out: { odometer: 74020, fuel: "Full", at: "12 Jun, 09:10", notes: "" },
    in: { odometer: 75184, fuel: "3/4", at: "18 Jun, 09:40", lateHours: 0, penalty: 0, notes: "" },
  },
  "BK-2411": {
    out: { odometer: 47180, fuel: "Full", at: "5 Jun, 08:30", notes: "" },
    in: { odometer: 47905, fuel: "Full", at: "9 Jun, 09:15", lateHours: 0, penalty: 0, notes: "" },
  },
  // completed, returned 4 hours past the 10:00 due time
  "BK-2419": {
    out: { odometer: 52440, fuel: "Full", at: "20 Jun, 08:50", notes: "" },
    in: { odometer: 53078, fuel: "1/2", at: "24 Jun, 14:00", lateHours: 4, penalty: 2000, notes: "Returned after lunch, fuel below handover level." },
  },
};

const DEPOSIT_BY_STATUS = {
  Pending: "Pending",
  Confirmed: "Pending",
  Active: "Held",
  Completed: "Refunded",
  Cancelled: "Refunded",
};

bookings = bookings.map((b) => ({
  ...b,
  // Alice's deposit stays held until her late fee is settled
  depositStatus: b.ref === "BK-2419" ? "Held" : DEPOSIT_BY_STATUS[b.status],
  handover: HANDOVERS[b.ref] || { out: null, in: null },
}));

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

subscribeDemo(emit);

export function getBookings() {
  return getSampleData() ? bookings : EMPTY;
}

export function getBooking(ref) {
  return bookings.find((b) => b.ref === ref);
}

export function addBooking(b) {
  const ref = `BK-${nextRef++}`;
  bookings = [
    {
      ref,
      status: "Pending",
      payment: "Unpaid",
      verification: "Pending",
      notes: "",
      depositStatus: "Pending",
      handover: { out: null, in: null },
      ...b,
    },
    ...bookings,
  ];
  markStep("booking");
  emit();
  return ref;
}

export function setStatus(ref, status) {
  bookings = bookings.map((b) =>
    b.ref === ref
      ? {
          ...b,
          status,
          payment: status === "Cancelled" && b.payment === "Paid" ? "Refunded" : b.payment,
          depositStatus:
            status === "Active" && b.depositStatus === "Pending" ? "Held" : b.depositStatus,
        }
      : b
  );
  emit();
}

export function setDepositStatus(ref, depositStatus) {
  bookings = bookings.map((b) => (b.ref === ref ? { ...b, depositStatus } : b));
  emit();
}

export function recordCheckOut(ref, out) {
  bookings = bookings.map((b) =>
    b.ref === ref ? { ...b, handover: { ...b.handover, out } } : b
  );
  emit();
}

export function recordCheckIn(ref, inn) {
  bookings = bookings.map((b) =>
    b.ref === ref ? { ...b, handover: { ...b.handover, in: inn } } : b
  );
  emit();
}

export function setPayment(ref, payment) {
  bookings = bookings.map((b) => (b.ref === ref ? { ...b, payment } : b));
  if (payment === "Prompt sent") markStep("prompt");
  emit();
}

// what the primary action on a booking does next, per lifecycle
export const NEXT_STEP = {
  Pending: { label: "Confirm booking", to: "Confirmed" },
  Confirmed: { label: "Start rental", to: "Active" },
  Active: { label: "Mark completed", to: "Completed" },
};

export const CANCELLABLE = ["Pending", "Confirmed"];

/* ---- date helpers (bookings store ISO dates) ---- */

const DAY_MONTH = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short" });
const FULL = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" });

export function fmtDate(iso) {
  if (!iso) return "—";
  return FULL.format(new Date(`${iso}T00:00:00`));
}

// "2 Jul – 6 Jul 2026"
export function fmtRange(a, b) {
  return `${DAY_MONTH.format(new Date(`${a}T00:00:00`))} – ${FULL.format(new Date(`${b}T00:00:00`))}`;
}

export function rentalDays(a, b) {
  const ms = Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`);
  return Math.max(1, Math.round(ms / 86400000));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
