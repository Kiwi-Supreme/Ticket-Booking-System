import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { BookingDTO } from '@ticket/shared';
import { bookingsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { formatDateTime, formatMoney } from '../lib/format';
import { Alert, Badge, Card, EmptyState, Loading, PageTitle } from '../components/ui';

function StatusBadge({ status }: { status: BookingDTO['status'] }) {
  return status === 'CONFIRMED' ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      Confirmed
    </span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
      Cancelled
    </span>
  );
}

export default function BookingHistory() {
  const query = useQuery({ queryKey: queryKeys.bookings, queryFn: () => bookingsApi.list() });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <Alert tone="error">Couldn’t load your bookings.</Alert>;
  const bookings = query.data ?? [];

  return (
    <div>
      <PageTitle title="My bookings" subtitle="Your tickets and booking history." />
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet">
          <Link to="/" className="text-brand hover:underline">
            Browse events
          </Link>{' '}
          to book your first seat.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} to={`/bookings/${b.reference}`} className="block">
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{b.show.eventTitle}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(b.show.startsAt)} · {b.show.venueName}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {b.seats.map((s, i) => (
                        <Badge key={i}>
                          {s.rowLabel}
                          {s.colNumber}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatMoney(b.totalAmount)}</p>
                    <p className="font-mono text-xs text-slate-400">{b.reference}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
