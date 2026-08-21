import type { SeatCategorySummaryDTO } from '@ticket/shared';
import { formatMoney } from '../lib/format';

/** Category colour key + seat-status legend shown beside the seat map. */
export function SeatMapLegend({ categories }: { categories: SeatCategorySummaryDTO[] }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="mb-2 font-medium text-slate-700">Categories</p>
        <ul className="space-y-1.5">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: c.color }} />
              <span className="text-slate-700">{c.name}</span>
              <span className="ml-auto text-slate-500">{formatMoney(c.price)}</span>
              <span className="w-16 text-right text-xs text-slate-400">
                {c.available}/{c.total} left
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-medium text-slate-700">Seat status</p>
        <ul className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> Available
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-brand" /> Selected
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-amber-200" /> Held
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-slate-300" /> Booked
          </li>
        </ul>
      </div>
    </div>
  );
}
