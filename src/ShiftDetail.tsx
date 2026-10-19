import { Building2, Heart, House, MessageSquare, Phone, Zap } from 'lucide-react';
import { useState } from 'react';
import { fromKey, money, shiftTotal, SLOT_INFO, type Shift } from './data';
import { SlotGlyph } from './icons';

const ROLE_COLOR = { CNA: 'bg-brand', LPN: 'bg-lpn', RN: 'bg-rn' } as const;

interface Props {
  shift: Shift;
  onApply: () => void;
  onWithdraw: () => void;
  onCallOut: () => void;
  onContact: (what: string) => void;
}

export function ShiftDetail({ shift, onApply, onWithdraw, onCallOut, onContact }: Props) {
  const [confirmingCallOut, setConfirmingCallOut] = useState(false);
  const d = fromKey(shift.date);

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <div className="flex gap-3 bg-white px-4 py-3">
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
        <span className="w-px self-stretch bg-line" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-snug font-medium text-ink-2">{shift.facility}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
            {shift.town} <span className="text-line">|</span> <House size={11} className="fill-ink-3" /> {shift.miles} mi
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
            <SlotGlyph slot={shift.slot} size={13} /> {SLOT_INFO[shift.slot].time}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[16px] font-bold text-ink-2">{money(shiftTotal(shift))}</p>
          <p className="mt-1 text-[13px] text-ink-2">{money(shift.rate)}/hr</p>
        </div>
      </div>

      <FacilityArt />

      <div className="relative z-10 mx-4 -mt-8 flex rounded-xl bg-white shadow-sm">
        <button onClick={() => onContact('Calling the facility')} className="flex flex-1 items-center gap-3 p-3 text-left">
          <span className="grid size-10 place-items-center rounded-full bg-brand text-white">
            <Phone size={17} className="fill-current" />
          </span>
          <span>
            <span className="block text-[14px] text-ink">Call facility</span>
            <span className="block text-[11px] text-ink-3">(555) 010-2481</span>
          </span>
        </button>
        <span className="w-px bg-line" />
        <button onClick={() => onContact('Opening a chat with the manager')} className="flex flex-1 items-center gap-3 p-3 text-left">
          <span className="grid size-10 place-items-center rounded-full bg-brand text-white">
            <MessageSquare size={16} className="fill-current" />
          </span>
          <span>
            <span className="block text-[14px] text-ink">Questions?</span>
            <span className="block text-[11px] text-ink-3">Chat with Manager</span>
          </span>
        </button>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white">
            <Building2 size={26} className="text-ink-2" />
          </span>
          <p className="flex-1 text-[17px] font-bold text-ink">{shift.facility}</p>
          <Heart size={20} className={shift.favorite ? 'fill-urgent text-urgent' : 'text-ink-2'} />
        </div>
        <h3 className="mt-5 text-[16px] font-medium text-ink">Facility description</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
          A {shift.miles < 5 ? 'small neighborhood' : 'mid-size'} skilled nursing facility with long-term care and short-term rehab units.
          Parking is free, and per diem staff check in at the front desk 15 minutes before the shift.
        </p>
      </div>

      <div className="sticky bottom-0 bg-white p-3 shadow-[0_-2px_6px_rgba(0,0,0,0.05)]">
        {shift.status === 'confirmed' &&
          (confirmingCallOut ? (
            <div className="flex flex-col gap-2">
              <p className="text-center text-[13px] text-ink-2">Call out of this shift? The facility will be notified.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmingCallOut(false)} className="h-11 flex-1 rounded-md border border-line text-[15px] text-ink-2">
                  Keep shift
                </button>
                <button onClick={onCallOut} className="h-11 flex-1 rounded-md bg-urgent text-[15px] font-medium text-white">
                  Call out
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmingCallOut(true)} className="h-11 w-full rounded-md bg-urgent text-[15px] font-medium text-white">
              Call out
            </button>
          ))}
        {shift.status === 'open' && (
          <button
            onClick={onApply}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-md text-[15px] font-medium text-white ${shift.instantBook ? 'bg-instant' : 'bg-brand'}`}
          >
            {shift.instantBook ? (
              <>
                <Zap size={16} className="fill-current" /> Instant book
              </>
            ) : (
              'Apply for this shift'
            )}
          </button>
        )}
        {shift.status === 'applied' && (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-[13px] text-ink-2">Applied. The facility will confirm or decline.</p>
            <button onClick={onWithdraw} className="h-10 rounded-md border border-line px-4 text-[14px] text-ink-2">
              Withdraw
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Stand-in for the facility photo: a simple illustrated building. */
function FacilityArt() {
  return (
    <svg viewBox="0 0 375 170" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfdcfb" />
          <stop offset="1" stopColor="#eaf3fe" />
        </linearGradient>
      </defs>
      <rect width="375" height="170" fill="url(#sky)" />
      <rect y="132" width="375" height="38" fill="#cfd6df" />
      <rect x="70" y="58" width="236" height="80" fill="#f4f1ec" />
      <rect x="58" y="50" width="260" height="12" fill="#e2ddd5" />
      <rect x="160" y="88" width="56" height="50" fill="#8fb3d9" />
      <rect x="187" y="88" width="2" height="50" fill="#f4f1ec" />
      {[86, 118, 236, 268].map((x) => (
        <rect key={x} x={x} y="80" width="22" height="22" fill="#a9c6e6" />
      ))}
      <rect x="145" y="62" width="10" height="76" fill="#b5654a" />
      <rect x="221" y="62" width="10" height="76" fill="#b5654a" />
      <circle cx="34" cy="120" r="20" fill="#9cc79a" />
      <circle cx="344" cy="116" r="24" fill="#9cc79a" />
    </svg>
  );
}
