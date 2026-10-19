import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CalendarTab } from './CalendarTab';
import { BottomNav, Header, HomeIndicator, ViewTabs, type Tab } from './chrome';
import { generateShifts, MONTHS_VISIBLE, type Shift, type Slot } from './data';
import { ShiftDetail } from './ShiftDetail';
import { DayScreen, ListTab, MapTab, SlotScreen } from './shifts';

type Route = { name: 'tabs' } | { name: 'day'; date: string } | { name: 'slot'; date: string; slot: Slot } | { name: 'shift'; id: string };

const REPO = 'https://github.com/josephfanpm/eshyft-calendar';

export function App() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [shifts, setShifts] = useState<Shift[]>(() => generateShifts(today));
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [tab, setTab] = useState<Tab>('calendar');
  const [monthOffset, setMonthOffset] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const route = stack[stack.length - 1]!;
  const push = (r: Route) => setStack((s) => [...s, r]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [route, tab]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const updateShift = (id: string, status: Shift['status']) => setShifts((all) => all.map((s) => (s.id === id ? { ...s, status } : s)));

  const reset = () => {
    setShifts(generateShifts(today));
    setStack([{ name: 'tabs' }]);
    setTab('calendar');
    setMonthOffset(0);
  };

  let title = 'Find shifts';
  let body: ReactNode;
  if (route.name === 'tabs') {
    body =
      tab === 'calendar' ? (
        <CalendarTab
          today={today}
          monthOffset={monthOffset}
          maxOffset={MONTHS_VISIBLE - 1}
          shifts={shifts}
          onMonth={setMonthOffset}
          onDay={(date) => push({ name: 'day', date })}
        />
      ) : tab === 'list' ? (
        <ListTab today={today} shifts={shifts} onShift={(id) => push({ name: 'shift', id })} onFilter={() => setToast('Filters are outside this prototype')} />
      ) : (
        <MapTab onCalendar={() => setTab('calendar')} />
      );
  } else if (route.name === 'day') {
    body = <DayScreen date={route.date} shifts={shifts} onSlot={(slot) => push({ name: 'slot', date: route.date, slot })} onShift={(id) => push({ name: 'shift', id })} />;
  } else if (route.name === 'slot') {
    body = <SlotScreen date={route.date} slot={route.slot} shifts={shifts} onShift={(id) => push({ name: 'shift', id })} />;
  } else {
    title = 'Shift';
    const shift = shifts.find((s) => s.id === route.id)!;
    body = (
      <ShiftDetail
        shift={shift}
        onApply={() => {
          updateShift(shift.id, shift.instantBook ? 'confirmed' : 'applied');
          setToast(shift.instantBook ? 'Booked! It now shows as confirmed on your calendar.' : 'Application sent');
        }}
        onWithdraw={() => {
          updateShift(shift.id, 'open');
          setToast('Application withdrawn');
        }}
        onCallOut={() => {
          updateShift(shift.id, 'open');
          setToast('You called out. The shift is open again.');
          back();
        }}
        onContact={(what) => setToast(`${what} is outside this prototype`)}
      />
    );
  }

  const onTabs = route.name === 'tabs';

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-10 md:flex-row md:p-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white md:h-[min(812px,calc(100vh-48px))] md:w-[375px] md:shrink-0 md:rounded-[44px] md:border-[10px] md:border-ink md:shadow-2xl">
        <Header title={title} onBack={onTabs ? undefined : back} onHelp={() => setToast('Help is outside this prototype')} onProfile={onTabs ? () => setToast('Profile is outside this prototype') : undefined} />
        {onTabs && <ViewTabs tab={tab} onChange={setTab} />}
        <main ref={scrollRef} key={stack.length} className={`no-scrollbar flex flex-1 flex-col overflow-y-auto ${onTabs ? 'bg-white' : 'screen-enter bg-canvas'}`}>
          {body}
        </main>
        {onTabs && <BottomNav onOther={(label) => setToast(`${label} is outside this prototype`)} />}
        <div className={onTabs ? 'bg-white' : 'bg-canvas'}>
          <HomeIndicator />
        </div>
        {toast && (
          <div role="status" className="absolute inset-x-4 bottom-24 rounded-lg bg-ink/90 px-4 py-3 text-center text-[13px] text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>

      <aside className="w-full max-w-[380px] px-5 pb-12 md:px-0 md:pb-0">
        <p className="text-[12px] font-bold tracking-widest text-brand uppercase">Product case study</p>
        <h2 className="mt-2 text-[28px] leading-tight font-bold text-ink">A calendar for booking nursing shifts</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          Most nurses on per diem apps already have a full-time job and keep a few staffing apps on their phone. Their free days repeat week to week,
          so the question they bring to the app is "what's open on my usual days off?" The calendar answers it at a glance.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          I tested it against the existing list and map, tracking shift applications with hours worked, confirmed shifts and call-outs as counter metrics.
          The calendar lifted applications without hurting the counter metrics, and it shipped to every nurse.
        </p>

        <h3 className="mt-6 text-[14px] font-bold text-ink">Try it</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-ink-2">
          <li>The demo nurse is usually free on Thursdays and Saturdays. Green checks show the shifts they've already booked.</li>
          <li>Tap a day with blue icons, pick a shift type, and book a shift. Instant-book shifts turn green on the calendar.</li>
          <li>Open a confirmed shift to call out of it, or step to a later month to see how listings thin out.</li>
        </ul>

        <button onClick={reset} className="mt-6 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink-2">
          Reset demo
        </button>

        <p className="mt-6 text-[13px] text-ink-2">
          <a className="font-medium text-brand underline-offset-2 hover:underline" href={`${REPO}/blob/main/docs/CASE_STUDY.md`}>
            Read the full case study
          </a>{' '}
          ·{' '}
          <a className="font-medium text-brand underline-offset-2 hover:underline" href={REPO}>
            Source on GitHub
          </a>
        </p>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
          An independent recreation of a feature I shipped as a product manager. Facilities, rates and schedules are fictional, and this is not an official app.
        </p>
      </aside>
    </div>
  );
}
