import { describe, expect, it } from 'vitest';
import { dayState, generateShifts, monthGrid, toKey, type Shift } from './data';

const today = new Date(2025, 9, 15); // Wednesday, October 15, 2025

function shift(overrides: Partial<Shift>): Shift {
  return {
    id: Math.random().toString(36),
    date: '2025-10-20',
    slot: 'day',
    role: 'CNA',
    facility: 'Test',
    town: 'Ephrata, PA',
    miles: 1,
    rate: 25,
    instantBook: false,
    urgent: false,
    favorite: false,
    status: 'open',
    ...overrides,
  };
}

describe('monthGrid', () => {
  it('pads October 2025 to start on Wednesday', () => {
    const weeks = monthGrid(new Date(2025, 9, 1));
    expect(weeks).toHaveLength(5);
    expect(weeks[0]!.slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0]![3]!.getDate()).toBe(1);
    expect(weeks[4]![5]!.getDate()).toBe(31);
    expect(weeks[4]![6]).toBeNull();
  });
});

describe('dayState', () => {
  it('disables past days and marks today', () => {
    expect(dayState(new Date(2025, 9, 14), today, []).disabled).toBe(true);
    const t = dayState(today, today, []);
    expect(t.disabled).toBe(false);
    expect(t.isToday).toBe(true);
  });

  it('shows green for confirmed, blue for open, gray for nothing', () => {
    const date = new Date(2025, 9, 20);
    const state = dayState(date, today, [
      shift({ slot: 'day', status: 'confirmed' }),
      shift({ slot: 'day', status: 'open' }),
      shift({ slot: 'evening', status: 'open' }),
    ]);
    expect(state.slots).toEqual({ day: 'confirmed', evening: 'available', night: 'none' });
  });
});

describe('generateShifts', () => {
  it('is deterministic and puts confirmed shifts on the usual free days', () => {
    const a = generateShifts(today);
    const b = generateShifts(today);
    expect(a).toEqual(b);
    const confirmed = a.filter((s) => s.status === 'confirmed');
    expect(confirmed.length).toBeGreaterThan(0);
    for (const s of confirmed) {
      expect([4, 6]).toContain(new Date(`${s.date}T12:00`).getDay());
      expect(s.date > toKey(today)).toBe(true);
    }
  });
});
