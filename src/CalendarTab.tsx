import { ChevronLeft, ChevronRight, CircleCheck, TriangleAlert } from 'lucide-react';
import { addMonths, dayState, monthGrid, monthTitle, SLOTS, startOfMonth, toKey, type Shift } from './data';
import { SlotIcon } from './icons';

export type Banner = 'none' | 'setup' | 'state';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  today: Date;
  monthOffset: number;
  maxOffset: number;
  shifts: Shift[];
  banner: Banner;
  onMonth: (offset: number) => void;
  onDay: (key: string) => void;
  onBanner: () => void;
}

export function CalendarTab({ today, monthOffset, maxOffset, shifts, banner, onMonth, onDay, onBanner }: Props) {
  const month = addMonths(startOfMonth(today), monthOffset);
  // With the "no shifts in your state" banner, nothing is bookable, so every slot is gray.
  const visibleShifts = banner === 'state' ? [] : shifts;

  return (
    <div className="pb-4">
      {banner !== 'none' && <BannerCard kind={banner} onClick={onBanner} />}

      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h2 className="text-[22px] font-bold text-ink-2">{monthTitle(month)}</h2>
        <div className="flex gap-6">
          <button
            onClick={() => onMonth(monthOffset - 1)}
            disabled={monthOffset === 0}
            aria-label="Previous month"
            className="text-brand disabled:cursor-default disabled:text-brand/35"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={() => onMonth(monthOffset + 1)}
            disabled={monthOffset === maxOffset}
            aria-label="Next month"
            className="text-brand disabled:cursor-default disabled:text-brand/35"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 pb-4 text-[13px] text-ink-2">
        <span className="font-bold">Shifts:</span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-brand" /> Available
        </span>
        <span className="flex items-center gap-1">
          <CircleCheck size={12} className="text-ok" /> Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full border border-ink-3" /> No shifts
        </span>
      </div>

      <div className="grid grid-cols-7 gap-0.5 px-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="grid h-7 place-items-center rounded-md bg-canvas text-[12px] text-ink-2 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid gap-0.5 px-0.5" role="grid" aria-label={monthTitle(month)}>
        {monthGrid(month).map((week, w) => (
          <div key={w} className="grid grid-cols-7 gap-0.5" role="row">
            {week.map((date, i) => {
              if (!date) return <div key={i} />;
              const state = dayState(date, today, visibleShifts);
              const key = toKey(date);
              if (state.disabled) {
                return (
                  <div key={i} role="gridcell" aria-disabled="true" className="flex h-[68px] items-end rounded-lg border border-line/40 bg-canvas/80 p-1.5 text-[12px] text-ink-3/60">
                    {date.getDate()}
                  </div>
                );
              }
              return (
                <button
                  key={i}
                  role="gridcell"
                  onClick={() => onDay(key)}
                  aria-label={date.toDateString()}
                  className={`flex h-[68px] flex-col justify-between rounded-lg border bg-white p-1.5 text-left transition-colors hover:bg-brand-soft/50 ${
                    state.isToday ? 'border-brand' : 'border-line'
                  }`}
                >
                  <span className="mt-3 flex w-full justify-between px-0.5">
                    {SLOTS.map((slot) => (
                      <SlotIcon key={slot} slot={slot} state={state.slots[slot]} size={13} />
                    ))}
                  </span>
                  <span className={`text-[13px] ${state.isToday ? 'text-brand' : 'text-ink-2'}`}>{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerCard({ kind, onClick }: { kind: Exclude<Banner, 'none'>; onClick: () => void }) {
  const copy =
    kind === 'setup'
      ? { title: 'Continue your account setup', body: 'Complete your account to start earning', tone: 'text-urgent' }
      : {
          title: 'No shifts in selected state',
          body: 'If you have a license in another state, please update it and set up your account',
          tone: 'text-amber-500',
        };
  return (
    <button onClick={onClick} className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-lg bg-canvas px-4 py-3 text-left">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
        <TriangleAlert size={18} className={`${copy.tone} fill-current [&>path:nth-child(n+2)]:text-white`} />
      </span>
      <span className="flex-1">
        <span className="block text-[14px] font-medium text-ink">{copy.title}</span>
        <span className="block text-[12px] leading-snug text-ink-2">{copy.body}</span>
      </span>
      <ChevronRight size={20} className="text-ink-2" />
    </button>
  );
}
