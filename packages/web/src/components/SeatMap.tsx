import { useMemo } from 'react';
import { clsx } from 'clsx';
import { SeatStatus, type SeatMapDTO, type SeatMapSeatDTO } from '@ticket/shared';

interface SeatMapProps {
  seatMap: SeatMapDTO;
  selectedIds: Set<string>;
  onToggle: (seat: SeatMapSeatDTO) => void;
  disabled?: boolean;
}

/** Group seats into rows (by gridRow), each sorted left-to-right by gridCol. */
function groupRows(seats: SeatMapSeatDTO[]): SeatMapSeatDTO[][] {
  const byRow = new Map<number, SeatMapSeatDTO[]>();
  for (const seat of seats) {
    const row = byRow.get(seat.gridRow) ?? [];
    row.push(seat);
    byRow.set(seat.gridRow, row);
  }
  return [...byRow.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => row.sort((a, b) => a.gridCol - b.gridCol));
}

function seatClasses(seat: SeatMapSeatDTO, selected: boolean): string {
  if (selected) return 'bg-brand text-white border-brand shadow-sm';
  if (seat.heldByMe) return 'bg-brand/80 text-white border-brand';
  if (seat.status === SeatStatus.BOOKED)
    return 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed';
  if (seat.status === SeatStatus.HELD)
    return 'bg-amber-200 text-amber-800 border-amber-300 cursor-not-allowed';
  // Available — tinted with its category colour.
  return 'bg-white text-slate-600 hover:bg-slate-50';
}

export function SeatMap({ seatMap, selectedIds, onToggle, disabled }: SeatMapProps) {
  const rows = useMemo(() => groupRows(seatMap.seats), [seatMap.seats]);

  return (
    <div className="thin-scroll overflow-x-auto">
      <div className="mx-auto inline-block min-w-full">
        <div className="mb-6 rounded-md bg-gradient-to-b from-slate-200 to-slate-100 py-1.5 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          Screen / Stage
        </div>

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row[0].gridRow} className="flex items-center justify-center gap-1.5">
              <span className="w-5 shrink-0 text-right text-xs font-medium text-slate-400">
                {row[0].rowLabel}
              </span>
              <div className="flex gap-1.5">
                {row.map((seat) => {
                  const selected = selectedIds.has(seat.id);
                  const isAvailable = seat.status === SeatStatus.AVAILABLE && !seat.heldByMe;
                  const clickable = !disabled && (isAvailable || selected);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => onToggle(seat)}
                      title={`${seat.rowLabel}${seat.colNumber} · ${seat.categoryName}`}
                      style={
                        isAvailable && !selected
                          ? { borderColor: seat.categoryColor }
                          : undefined
                      }
                      className={clsx(
                        'grid h-7 w-7 place-items-center rounded-md border text-[10px] font-medium transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                        seatClasses(seat, selected),
                      )}
                    >
                      {seat.colNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
