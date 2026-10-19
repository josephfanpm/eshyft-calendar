import { CircleCheck, Moon, Sun, type LucideProps } from 'lucide-react';
import type { Slot, SlotState } from './data';

/** Half sun on the horizon, matching the design's evening icon (lucide's sunset has an arrow). */
function Evening({ size = 24, strokeWidth = 2, className, ...rest }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0z" className="[fill:inherit]" />
      <path d="M2 18h20M12 7v2M5 10.5l1.4 1.4M19 10.5l-1.4 1.4M3 14.5h1.5M19.5 14.5H21" />
    </svg>
  );
}

const SLOT_ICONS = { day: Sun, evening: Evening, night: Moon } as const;

/** Day / evening / night icon in one of the three calendar states. */
export function SlotIcon({ slot, state, size = 14 }: { slot: Slot; state: SlotState; size?: number }) {
  if (state === 'confirmed') {
    return <CircleCheck size={size} strokeWidth={2} className="text-ok" aria-label="confirmed" />;
  }
  const Icon = SLOT_ICONS[slot];
  if (state === 'available') {
    return <Icon size={size} strokeWidth={2} className="fill-brand text-brand" aria-label={`${slot} shifts available`} />;
  }
  return <Icon size={size} strokeWidth={1.25} className="text-ink-3" aria-label={`no ${slot} shifts`} />;
}

export function SlotBadge({ slot }: { slot: Slot }) {
  const Icon = SLOT_ICONS[slot];
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft">
      <Icon size={20} strokeWidth={1.75} className="text-brand" />
    </span>
  );
}

export function SlotGlyph({ slot, size = 14, className = 'text-brand' }: { slot: Slot; size?: number; className?: string }) {
  const Icon = SLOT_ICONS[slot];
  return <Icon size={size} strokeWidth={1.75} className={`shrink-0 ${className}`} />;
}
