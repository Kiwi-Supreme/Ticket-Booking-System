import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { formatDateTime, formatMoney } from '../lib/format';
import { Alert, Card, Loading, PageTitle } from '../components/ui';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}

export default function EventSummary() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: queryKeys.eventSummary(id!),
    queryFn: () => eventsApi.summary(id!),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <Alert tone="error">Couldn’t load the summary.</Alert>;
  const s = query.data;
  const occupancy = s.totalCapacity ? Math.round((s.totalBooked / s.totalCapacity) * 100) : 0;

  return (
    <div>
      <PageTitle
        title={s.title}
        subtitle="Bookings & revenue"
        right={
          <Link to={`/organiser/events/${id}/shows/new`} className="text-sm text-brand hover:underline">
            + Add show
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total revenue" value={formatMoney(s.totalRevenue)} />
        <Stat label="Seats booked" value={`${s.totalBooked} / ${s.totalCapacity}`} />
        <Stat label="Occupancy" value={`${occupancy}%`} />
      </div>

      {s.shows.length === 0 ? (
        <Alert tone="info">No shows scheduled yet.</Alert>
      ) : (
        <div className="space-y-4">
          {s.shows.map((show) => (
            <Card key={show.showId} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{formatDateTime(show.startsAt)}</p>
                  <p className="text-sm text-slate-500">{show.venueName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatMoney(show.revenue)}</p>
                  <p className="text-sm text-slate-500">
                    {show.booked} / {show.capacity} booked
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 text-right font-medium">Price</th>
                      <th className="px-4 py-2 text-right font-medium">Booked</th>
                      <th className="px-4 py-2 text-right font-medium">Available</th>
                      <th className="px-4 py-2 text-right font-medium">Revenue</th>
                      <th className="px-4 py-2 text-right font-medium">Waiting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {show.categories.map((c) => (
                      <tr key={c.seatCategoryId} className="border-t border-slate-100">
                        <td className="px-4 py-2">
                          <span className="flex items-center gap-2 text-slate-700">
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-slate-600">{formatMoney(c.price)}</td>
                        <td className="px-4 py-2 text-right text-slate-800">{c.booked}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{c.available}</td>
                        <td className="px-4 py-2 text-right font-medium text-slate-900">
                          {formatMoney(c.revenue)}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-600">
                          {c.waiting > 0 ? (
                            <span className="font-medium text-amber-600">{c.waiting}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
