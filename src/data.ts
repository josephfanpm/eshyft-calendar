/**
 * Shift data and calendar logic. All facilities, towns, pairings,
 * rates and schedules here are made up for this demo.
 */

export type Slot = 'day' | 'evening' | 'night';
export type Role = 'CNA' | 'LPN' | 'RN';
export type ShiftStatus = 'open' | 'applied' | 'confirmed';

export interface Shift {
  id: string;
  /** Local date the shift starts on, as YYYY-MM-DD. */
  date: string;
  slot: Slot;
  role: Role;
  facility: string;
  town: string;
  miles: number;
  rate: number;
  instantBook: boolean;
  urgent: boolean;
  favorite: boolean;
  status: ShiftStatus;
}

export const SLOTS: Slot[] = ['day', 'evening', 'night'];

export const SLOT_INFO: Record<Slot, { label: string; time: string; paidHours: number }> = {
  day: { label: 'Day shifts', time: '7:00 am - 3:00 pm', paidHours: 7.5 },
  evening: { label: 'Evening shifts', time: '3:00 pm - 11:00 pm', paidHours: 7.5 },
  night: { label: 'Night shifts', time: '11:00 pm - 7:00 am', paidHours: 7.5 },
};

/** How many months ahead nurses can browse, counting the current month. */
export const MONTHS_VISIBLE = 5;

const FACILITIES = [
  { name: 'Ostley Glen Nursing Home', town: 'Fenwold, PA', miles: 2.1 },
  { name: 'Brindlewick Nursing Home', town: 'Fenwold, PA', miles: 2.4 },
  { name: 'Marrowfield Care Center', town: 'Quillan, PA', miles: 6.8 },
  { name: 'Quillan Ridge Rehabilitation and Nursing', town: 'Marrowfield, PA', miles: 11.3 },
  { name: 'Ashcombe Hollow Senior Living', town: 'Brindlewick, PA', miles: 4.5 },
  { name: 'Fenwold Health and Rehab', town: 'Ostley, PA', miles: 8.9 },
];

const RATE_RANGE: Record<Role, [number, number]> = {
  CNA: [22, 36],
  LPN: [34, 48],
  RN: [44, 62],
};

// --- dates ---------------------------------------------------------------------

export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Weeks of a month as rows of 7, with null padding before the 1st and after the last day. */
export function monthGrid(month: Date): Array<Array<Date | null>> {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array(first.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const longDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export const monthTitle = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// --- calendar cell state ---------------------------------------------------------

export type SlotState = 'available' | 'confirmed' | 'none';

export interface DayState {
  /** Past days can't be tapped and show no icons. */
  disabled: boolean;
  isToday: boolean;
  slots: Record<Slot, SlotState>;
}

/**
 * Icon rules from the design notes:
 *  - green check if the nurse is confirmed for a shift in that slot
 *  - blue if at least one shift is open to apply for
 *  - gray otherwise
 * Past dates are disabled and show no icons, because a confirmed shift in the
 * past doesn't mean the nurse actually worked it.
 */
export function dayState(date: Date, today: Date, shifts: Shift[]): DayState {
  const key = toKey(date);
  const todayKey = toKey(today);
  const disabled = key < todayKey;
  const slots = {} as Record<Slot, SlotState>;
  for (const slot of SLOTS) {
    const inSlot = shifts.filter((s) => s.date === key && s.slot === slot);
    slots[slot] = inSlot.some((s) => s.status === 'confirmed')
      ? 'confirmed'
      : inSlot.some((s) => s.status !== 'confirmed')
        ? 'available'
        : 'none';
  }
  return { disabled, isToday: key === todayKey, slots };
}

// --- demo data -----------------------------------------------------------------

/** Small seedable PRNG so the demo month looks the same on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The demo nurse works a full-time job Monday to Wednesday and picks up per
 * diem shifts on the days they're usually free: Thursdays and Saturdays.
 */
export const USUAL_FREE_DAYS = [4, 6];

export function generateShifts(today: Date): Shift[] {
  const shifts: Shift[] = [];
  const start = startOfMonth(today);
  const end = addMonths(start, MONTHS_VISIBLE);

  for (let d = new Date(start); d < end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const key = toKey(d);
    const random = mulberry32(hashKey(key));
    const monthsOut = d.getMonth() - today.getMonth() + 12 * (d.getFullYear() - today.getFullYear());
    // Facilities post fewer shifts the further out you look; the last month is mostly empty.
    const density = [1, 0.85, 0.6, 0.35, 0.12][monthsOut] ?? 0;
    const quietDay = random() < 0.08;

    for (const slot of SLOTS) {
      const count = quietDay || random() > density * 0.92 ? 0 : 1 + Math.floor(random() * 5);
      for (let i = 0; i < count; i++) {
        const role: Role = random() < 0.6 ? 'CNA' : random() < 0.6 ? 'LPN' : 'RN';
        const [min, max] = RATE_RANGE[role];
        const facility = FACILITIES[Math.floor(random() * FACILITIES.length)]!;
        shifts.push({
          id: `${key}-${slot}-${i}`,
          date: key,
          slot,
          role,
          facility: facility.name,
          town: facility.town,
          miles: facility.miles,
          rate: min + Math.floor(random() * (max - min + 1)),
          instantBook: random() < 0.45,
          urgent: random() < 0.12,
          favorite: random() < 0.2,
          status: 'open',
        });
      }
    }

    // Confirmed shifts land on the nurse's usual free days, after today.
    if (USUAL_FREE_DAYS.includes(d.getDay()) && key > toKey(today) && monthsOut < 2 && random() < 0.55) {
      const slot: Slot = random() < 0.6 ? 'day' : 'evening';
      const facility = FACILITIES[Math.floor(random() * 3)]!;
      shifts.push({
        id: `${key}-${slot}-confirmed`,
        date: key,
        slot,
        role: 'CNA',
        facility: facility.name,
        town: facility.town,
        miles: facility.miles,
        rate: 30,
        instantBook: false,
        urgent: false,
        favorite: true,
        status: 'confirmed',
      });
    }
  }
  return shifts;
}

export const money = (n: number) => `$${n.toFixed(2)}`;
export const shiftTotal = (s: Shift) => s.rate * SLOT_INFO[s.slot].paidHours;
