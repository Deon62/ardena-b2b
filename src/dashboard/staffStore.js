// In-memory staff store (mock backend), same pattern as the other stores.
// Seats are unlimited on the Fleet plan.

export const ROLES = ["Manager", "Booking agent", "Finance", "Viewer"];

export const ROLE_NOTES = [
  { role: "Owner", note: "Full access, including billing and staff." },
  { role: "Manager", note: "Everything except billing and workspace deletion." },
  { role: "Booking agent", note: "Creates and manages bookings and clients." },
  { role: "Finance", note: "Payments, refunds and payout reports." },
  { role: "Viewer", note: "Read-only across all modules." },
];

let staff = [
  { id: "ST-01", name: "Amina Yusuf", email: "amina@acmecarhire.co.ke", role: "Owner", status: "Active", lastActive: "Today, 08:42" },
  { id: "ST-02", name: "David Kariuki", email: "david@acmecarhire.co.ke", role: "Manager", status: "Active", lastActive: "Today, 07:15" },
  { id: "ST-03", name: "Lucy Wanjiru", email: "lucy@acmecarhire.co.ke", role: "Booking agent", status: "Active", lastActive: "Yesterday, 17:30" },
  { id: "ST-04", name: "Mark Odhiambo", email: "mark@acmecarhire.co.ke", role: "Booking agent", status: "Active", lastActive: "Today, 09:05" },
  { id: "ST-05", name: "Susan Njoki", email: "susan@acmecarhire.co.ke", role: "Finance", status: "Active", lastActive: "2 Jul, 16:11" },
  { id: "ST-06", name: "Paul Mworia", email: "paul.mworia@gmail.com", role: "Viewer", status: "Invited", lastActive: "—" },
];

let nextId = 7;

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getStaff() {
  return staff;
}

export function findByEmail(email) {
  const e = email.trim().toLowerCase();
  return staff.find((s) => s.email.toLowerCase() === e);
}

export function inviteStaff({ name, email, role }) {
  staff = [
    ...staff,
    {
      id: `ST-${String(nextId++).padStart(2, "0")}`,
      name,
      email,
      role,
      status: "Invited",
      lastActive: "—",
    },
  ];
  emit();
}

export function removeStaff(id) {
  staff = staff.filter((s) => s.id !== id);
  emit();
}
