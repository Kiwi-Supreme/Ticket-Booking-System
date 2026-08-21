import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { apiErrorMessage } from '../lib/api';
import { formatDateTime, formatMoney } from '../lib/format';
import { Alert, Badge, Button, Card, Loading, PageTitle } from '../components/ui';

export default function BookingDetail() {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const justBooked = (location.state as { justBooked?: boolean } | null)?.justBooked;
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.booking(reference!),
    queryFn: () => bookingsApi.get(reference!),
    enabled: Boolean(reference),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(query.data!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.booking(reference!) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not cancel this booking.')),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <Alert tone="error">Booking not found.</Alert>;
  const booking = query.data;
  const cancelled = booking.status === 'CANCELLED';

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Your ticket" right={<Link to="/bookings" className="text-sm text-brand hover:underline">← All bookings</Link>} />

      {justBooked && (
        <div className="mb-4">
          <Alert tone="success">Booking confirmed! A QR ticket has been emailed to you.</Alert>
        </div>
      )}
      {cancelled && (
        <div className="mb-4">
          <Alert tone="info">This booking was cancelled. The seats have been released.</Alert>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 border-b border-dashed border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-start">
          {booking.qrDataUrl ? (
            <img
              src={booking.qrDataUrl}
              alt={`QR ticket ${booking.reference}`}
              className={cancelled ? 'h-40 w-40 opacity-30 grayscale' : 'h-40 w-40'}
            />
          ) : (
            <div className="grid h-40 w-40 place-items-center rounded bg-white text-slate-300">
              No QR
            </div>
          )}
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-wide text-slate-400">Booking reference</p>
            <p className="font-mono text-lg font-bold text-slate-900">{booking.reference}</p>
            <p className="mt-2 font-semibold text-slate-800">{booking.show.eventTitle}</p>
            <p className="text-sm text-slate-500">{formatDateTime(booking.show.startsAt)}</p>
            <p className="text-sm text-slate-500">{booking.show.venueName}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Seats</h3>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {booking.seats.map((s, i) => (
              <Badge key={i}>
                {s.rowLabel}
                {s.colNumber} · {s.categoryName} · {formatMoney(s.price)}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="font-semibold text-slate-900">Total paid</span>
            <span className="font-semibold text-slate-900">{formatMoney(booking.totalAmount)}</span>
          </div>

          {!cancelled && (
            <div className="mt-6 space-y-3">
              {error && <Alert tone="error">{error}</Alert>}
              <Button
                variant="danger"
                className="w-full"
                loading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Cancel booking
              </Button>
              <p className="text-center text-xs text-slate-400">
                Cancelling frees your seats and offers them to the next person on the waitlist.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
