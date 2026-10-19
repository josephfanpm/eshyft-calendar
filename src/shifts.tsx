import { ArrowUpDown, ChevronDown, ChevronRight, CircleAlert, CircleCheck, CircleDollarSign, Heart, House, Search, SlidersHorizontal, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DateBar } from './chrome';
import { fromKey, longDate, money, shiftTotal, SLOT_INFO, SLOTS, toKey, type Role, type Shift, type Slot } from './data';
import { SlotBadge, SlotGlyph } from './icons';

const ROLE_COLOR: Record<Role, string> = { CNA: 'bg-brand', LPN: 'bg-lpn', RN: 'bg-rn' };

function DateBlock({ shift }: { shift: Shift }) {
  const d = fromKey(shift.date);
  return (
    <div className="flex w-[60px] shrink-0 flex-col items-center">
      <div className="flex items-center gap-1">
        <span className="text-[10px] leading-tight text-ink-2 uppercase">
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
          <br />
          {d.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-[30px] leading-none font-light text-ink-2">{String(d.getDate()).padStart(2, '0')}</span>
      </div>
      <span className={`mt-1.5 w-full rounded-full py-0.5 text-center text-[12px] text-white ${ROLE_COLOR[shift.role]}`}>{shift.role}</span>
    </div>
  );
}

function Meta({ shift }: { shift: Shift }) {
  return (
    <>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
        {shift.town} <span className="text-line">|</span> <House size={11} className="fill-ink-3" /> {shift.miles} mi
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] whitespace-nowrap text-ink-2">
        <SlotGlyph slot={shift.slot} size={13} />
        {SLOT_INFO[shift.slot].time} <span className="text-line">|</span> <span className="text-ink-3">7h 30min</span>
      </p>
    </>
  );
}

/** One open shift in a list, as in the "Daily shifts" and list view designs. */
export function ShiftCard({ shift, onOpen }: { shift: Shift; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full gap-3 bg-white px-4 py-4 text-left hover:bg-canvas/40">
      <DateBlock shift={shift} />
      <span className="w-px self-stretch bg-line" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-snug font-medium text-ink-2">
          {shift.favorite && <Heart size={13} className="mr-1 inline fill-urgent text-urgent" />}
          {shift.facility}
        </p>
        <Meta shift={shift} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {shift.status === 'applied' && <span className="rounded bg-brand-soft px-2 py-0.5 text-[12px] text-brand">Applied</span>}
          {shift.instantBook && shift.status === 'open' && (
            <span className="flex items-center gap-1 rounded bg-instant-soft px-2 py-0.5 text-[12px] text-instant">
              <Zap size={11} className="fill-current" /> Instant book
            </span>
          )}
          {shift.urgent && (
            <span className="flex items-center gap-1 rounded bg-urgent-soft px-2 py-0.5 text-[12px] text-urgent">
              <CircleAlert size={11} className="fill-current [&>line]:text-white" /> Urgent
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[15px] font-bold text-ink-2">{money(shift.rate)}/hr</p>
        <p className="mt-1 text-[14px] text-ink-2">{money(shiftTotal(shift))}</p>
      </div>
    </button>
  );
}

function ConfirmedCard({ shift, onOpen }: { shift: Shift; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full overflow-hidden rounded-lg border border-ok border-l-4 bg-white text-left">
      <p className="flex items-center gap-1.5 border-b border-line/60 px-3 py-2 text-[12px] font-medium text-ok">
        <CircleCheck size={14} className="fill-ok text-white" /> Confirmed
      </p>
      <div className="flex gap-3 px-3 py-3">
        <DateBlock shift={shift} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-snug font-medium text-ink-2">{shift.facility}</p>
          <Meta shift={shift} />
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
            <CircleDollarSign size={13} className="text-ok" /> Estimated earnings: {money(shiftTotal(shift))}
          </p>
        </div>
      </div>
    </button>
  );
}

// --- Day view ---------------------------------------------------------------------

export function DayScreen({ date, shifts, onSlot, onShift }: { date: string; shifts: Shift[]; onSlot: (s: Slot) => void; onShift: (id: string) => void }) {
  const dayShifts = shifts.filter((s) => s.date === date);
  return (
    <>
      <DateBar>{longDate(fromKey(date))}</DateBar>
      {dayShifts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {SLOTS.map((slot) => {
            const inSlot = dayShifts.filter((s) => s.slot === slot);
            const open = inSlot.filter((s) => s.status !== 'confirmed');
            const confirmed = inSlot.filter((s) => s.status === 'confirmed');
            const summary = (
              <>
                <SlotBadge slot={slot} />
                <span className="flex-1">
                  <span className="block text-[16px] font-medium text-ink">{SLOT_INFO[slot].label}</span>
                  <span className="block text-[14px] text-ink-2">
                    {open.length > 0 ? (
                      <>
                        <span className="font-medium text-brand">
                          {open.length} shift{open.length === 1 ? '' : 's'}
                        </span>{' '}
                        available
                      </>
                    ) : (
                      'No shifts available'
                    )}
                  </span>
                </span>
              </>
            );
            return (
              <section key={slot} className="rounded-xl bg-white">
                {open.length > 0 ? (
                  <button onClick={() => onSlot(slot)} className="flex w-full items-center gap-4 p-4 text-left">
                    {summary}
                    <ChevronRight size={20} className="text-ink-2" />
                  </button>
                ) : (
                  <div className={`flex items-center gap-4 p-4 ${confirmed.length ? '' : 'opacity-60'}`}>{summary}</div>
                )}
                {confirmed.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-line/60 p-4 pt-3">
                    {confirmed.map((s) => (
                      <ConfirmedCard key={s.id} shift={s} onOpen={() => onShift(s.id)} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

// --- Shifts for one slot -----------------------------------------------------------

export function SlotScreen({ date, slot, shifts, onShift }: { date: string; slot: Slot; shifts: Shift[]; onShift: (id: string) => void }) {
  const [highestFirst, setHighestFirst] = useState(true);
  const list = shifts
    .filter((s) => s.date === date && s.slot === slot && s.status !== 'confirmed')
    .sort((a, b) => (highestFirst ? b.rate - a.rate : a.rate - b.rate));
  return (
    <>
      <DateBar
        right={
          <span className="flex items-center gap-1.5 text-ink-2">
            <SlotGlyph slot={slot} size={16} className="fill-brand text-brand" /> {SLOT_INFO[slot].label}
          </span>
        }
      >
        {longDate(fromKey(date))}
      </DateBar>
      <SortBar highestFirst={highestFirst} onToggle={() => setHighestFirst((v) => !v)} />
      <div className="flex flex-col gap-2 bg-canvas">
        {list.map((s) => (
          <ShiftCard key={s.id} shift={s} onOpen={() => onShift(s.id)} />
        ))}
      </div>
    </>
  );
}

function SortBar({ highestFirst, onToggle }: { highestFirst: boolean; onToggle: () => void }) {
  return (
    <div className="flex justify-end bg-canvas px-4 py-2.5">
      <button onClick={onToggle} className="flex items-center gap-1.5 text-[14px] text-brand">
        <ArrowUpDown size={15} /> Rate: {highestFirst ? 'highest to lowest' : 'lowest to highest'}
      </button>
    </div>
  );
}

// --- List tab ----------------------------------------------------------------------

export function ListTab({ today, shifts, onShift, onFilter }: { today: Date; shifts: Shift[]; onShift: (id: string) => void; onFilter: () => void }) {
  const [highestFirst, setHighestFirst] = useState(true);
  const todayKey = toKey(today);
  const list = useMemo(
    () =>
      shifts
        .filter((s) => s.date >= todayKey && s.status !== 'confirmed')
        .sort((a, b) => a.date.localeCompare(b.date) || (highestFirst ? b.rate - a.rate : a.rate - b.rate))
        .slice(0, 40),
    [shifts, todayKey, highestFirst]
  );
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 28);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-3">
        <button onClick={onFilter} className="flex h-12 w-full items-center gap-3 rounded-full border border-line px-4 text-left text-[15px] text-brand">
          <Search size={18} className="text-ink-3" /> Home address
          <span className="relative ml-auto grid size-8 place-items-center rounded-full bg-canvas">
            <SlidersHorizontal size={15} className="text-brand" />
            <span className="absolute -top-0.5 right-0 size-2 rounded-full bg-urgent" />
          </span>
        </button>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {['$15 - $100/hr', `${fmt(today)} - ${fmt(end)}`, '0-50 miles', 'All roles'].map((chip) => (
            <button key={chip} onClick={onFilter} className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-4 py-2 text-[14px] text-white">
              {chip} <ChevronDown size={15} />
            </button>
          ))}
        </div>
      </div>
      <SortBar highestFirst={highestFirst} onToggle={() => setHighestFirst((v) => !v)} />
      <div className="flex flex-col gap-2 bg-canvas">
        {list.map((s) => (
          <ShiftCard key={s.id} shift={s} onOpen={() => onShift(s.id)} />
        ))}
      </div>
    </>
  );
}

export function MapTab({ onCalendar }: { onCalendar: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-[16px] font-medium text-ink">The map isn't part of this prototype</p>
      <p className="text-[14px] text-ink-2">This recreation focuses on the calendar view.</p>
      <button onClick={onCalendar} className="mt-2 rounded-full bg-brand px-5 py-2 text-[14px] font-medium text-white">
        Open the calendar
      </button>
    </div>
  );
}

// --- Empty state -------------------------------------------------------------------

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 py-24 text-center">
      <svg width="140" height="120" viewBox="0 0 140 120" aria-hidden="true">
        <circle cx="70" cy="62" r="44" fill="#e8eef7" />
        <text x="58" y="12" fontSize="10" fill="#3699fa" fontFamily="inherit">CNA</text>
        <text x="8" y="56" fontSize="10" fill="#14b88a" fontFamily="inherit">LPN</text>
        <text x="118" y="92" fontSize="10" fill="#ef4444" fontFamily="inherit">RN</text>
        <circle cx="104" cy="24" r="2" fill="#14b88a" />
        <circle cx="112" cy="32" r="1.5" fill="#ef4444" />
        <circle cx="30" cy="88" r="2" fill="#ef4444" />
        <path d="M46 22h36l14 14v64a3 3 0 0 1-3 3H46a3 3 0 0 1-3-3V25a3 3 0 0 1 3-3z" fill="white" stroke="#1f2937" strokeWidth="1.5" />
        <path d="M82 22v14h14" fill="none" stroke="#1f2937" strokeWidth="1.5" />
        <rect x="52" y="32" width="22" height="3" rx="1.5" fill="#bcd9fb" />
        <text x="52" y="62" fontSize="22" fill="#3699fa" fontFamily="inherit">A</text>
        <rect x="68" y="48" width="20" height="3" rx="1.5" fill="#bcd9fb" />
        <rect x="68" y="55" width="16" height="3" rx="1.5" fill="#bcd9fb" />
        <rect x="52" y="70" width="34" height="3" rx="1.5" fill="#bcd9fb" />
        <rect x="52" y="78" width="26" height="3" rx="1.5" fill="#bcd9fb" />
        <circle cx="98" cy="96" r="13" fill="#3699fa" stroke="#1f2937" strokeWidth="1.5" />
        <path d="M92 92l12-3-5 11-2-5z" fill="white" />
      </svg>
      <p className="mt-5 text-[18px] font-medium text-ink">No shifts available today</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-2">There are no available shifts today, please try looking for shifts on other days.</p>
    </div>
  );
}
