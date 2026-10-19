import {
  BatteryFull,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  House,
  List,
  MapPinned,
  MessageCircleQuestion,
  MessageSquare,
  Search,
  Signal,
  User,
  Wifi,
  CalendarCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type Tab = 'list' | 'map' | 'calendar';

/** Status bar and blue title bar shared by every screen. */
export function Header({ title, onBack, onHelp, onProfile }: { title: string; onBack?: () => void; onHelp: () => void; onProfile?: () => void }) {
  return (
    <header className="shrink-0 bg-brand text-white">
      <div className="flex h-11 items-center justify-between px-8 pt-1 text-[15px] font-medium">
        <span>9:41</span>
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <Signal size={15} strokeWidth={2.5} />
          <Wifi size={15} strokeWidth={2.5} />
          <BatteryFull size={20} strokeWidth={2} />
        </span>
      </div>
      <div className="relative flex h-11 items-center justify-center px-4">
        {onBack && (
          <button onClick={onBack} className="absolute left-3 flex items-center gap-1 text-[17px]">
            <ChevronLeft size={22} /> Back
          </button>
        )}
        <h1 className="text-[19px] font-normal tracking-wide uppercase">{title}</h1>
        <div className="absolute right-3 flex items-center gap-3">
          <button onClick={onHelp} aria-label="Help">
            <MessageCircleQuestion size={22} strokeWidth={1.75} />
          </button>
          {onProfile && (
            <button onClick={onProfile} aria-label="Profile">
              <User size={22} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const TABS: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: 'list', label: 'List', icon: <List size={20} /> },
  { id: 'map', label: 'Map', icon: <MapPinned size={20} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
];

export function ViewTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex shrink-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04)]" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => onChange(t.id)}
          className={`flex h-12 flex-1 items-center justify-center gap-2 border-b-2 text-[15px] font-medium uppercase ${
            tab === t.id ? 'border-brand text-brand' : 'border-transparent text-ink-2'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  );
}

const NAV = [
  { label: 'Home', icon: House },
  { label: 'Shifts', icon: Search },
  { label: 'My shifts', icon: CalendarCheck },
  { label: 'Earnings', icon: CircleDollarSign },
  { label: 'Chats', icon: MessageSquare },
];

export function BottomNav({ onOther }: { onOther: (label: string) => void }) {
  return (
    <nav className="flex h-[52px] shrink-0 border-t border-line/60 bg-white">
      {NAV.map(({ label, icon: Icon }) => {
        const active = label === 'Shifts';
        return (
          <button
            key={label}
            onClick={() => !active && onOther(label)}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium uppercase ${active ? 'text-brand' : 'text-ink-3'}`}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 2} className={active ? '' : 'fill-ink-3/30'} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function HomeIndicator() {
  return (
    <div className="flex h-[22px] shrink-0 items-start justify-center bg-inherit" aria-hidden="true">
      <span className="h-[5px] w-[134px] rounded-full bg-ink/80" />
    </div>
  );
}

/** The gray date strip under the header on day, list and empty-state screens. */
export function DateBar({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-white px-4 text-[15px] text-ink-2">
      <span>{children}</span>
      {right}
    </div>
  );
}
