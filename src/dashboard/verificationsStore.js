// Walk-in verification via Dojah lookups. The renter is present in person, so
// there's no selfie/liveness widget: staff type the National ID, Driver's
// Licence or KRA PIN number and we look it up against the registry.
//
// Live endpoints (Dojah, headers: AppId + Authorization = secret key):
//   National ID     GET /api/v1/ke/kyc/id?id=<number>
//   Driver's Licence GET /api/v1/ke/kyc/dl?license_number=<number>
//   KRA PIN         GET /api/v1/ke/kyc/kra?pin=<number>
// Each returns an `entity` with the person's registry details.

// Pay-as-you-go: flat price per lookup, drawn from a prepaid wallet
export const CHECK_PRICE = 100; // KES
export const WALLET_BALANCE = 0; // KES, real balance comes with the wallet API

export const LOOKUP_TYPES = ["National ID", "Driver's Licence", "KRA PIN"];

export const STATUS_CHIP = {
  Verified: "active",
  "Not found": "cancelled",
  Mismatch: "pending",
};

// Lookup history, populated by the verification API when it ships
export const LOOKUPS = [];

// Mock registry lookup: deterministic result per number so the demo feels
// real. Swap this for the live Dojah call (returns the `entity` object).
const POOL = [
  { firstName: "Wanjiku", middleName: "Njeri", lastName: "Kamau", gender: "Female", dob: "1991-04-12" },
  { firstName: "Kevin", middleName: "Otieno", lastName: "Omondi", gender: "Male", dob: "1988-11-03" },
  { firstName: "Grace", middleName: "Akinyi", lastName: "Achieng", gender: "Female", dob: "1994-07-21" },
  { firstName: "Samuel", middleName: "Kipchoge", lastName: "Kiptoo", gender: "Male", dob: "1985-02-16" },
  { firstName: "Faith", middleName: "Wanjiru", lastName: "Njeri", gender: "Female", dob: "1996-09-30" },
  { firstName: "Brian", middleName: "Mwangi", lastName: "Kariuki", gender: "Male", dob: "1990-05-08" },
];

// show the first 2 and last 2 characters, mask the middle (privacy)
export function maskNumber(n) {
  const s = String(n);
  if (s.length <= 4) return s;
  return `${s.slice(0, 2)}${"•".repeat(Math.max(3, s.length - 4))}${s.slice(-2)}`;
}

export function lookupIdentity(type, number) {
  const digits = String(number).replace(/\D/g, "");
  if (digits.length < 6) {
    return { found: false, reason: "That number looks too short. Check and try again." };
  }
  const sum = digits.split("").reduce((a, c) => a + Number(c), 0);
  const p = POOL[sum % POOL.length];
  return {
    found: true,
    entity: {
      ...p,
      idType: type,
      idNumber: number,
      matched: true,
    },
  };
}
