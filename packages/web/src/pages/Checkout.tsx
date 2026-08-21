import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, holdsApi } from '../api/endpoints';
import type { CheckoutState } from '../api/types';
import { queryKeys } from '../lib/queryKeys';
import { apiErrorMessage } from '../lib/api';
import { formatDateTime, formatMoney } from '../lib/format';
import { HoldCountdown } from '../components/HoldCountdown';
import { Alert, Button, Card, PageTitle } from '../components/ui';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state = location.state as CheckoutState | null;

  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmMutation = useMutation({
    mutationFn: () => bookingsApi.create(state!.hold.id),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.seatMap(state!.show.id) });
      navigate(`/bookings/${booking.reference}`, { replace: true, state: { justBooked: true } });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not confirm the booking.')),
  });

  const releaseMutation = useMutation({
    mutationFn: () => holdsApi.release(state!.hold.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.seatMap(state!.show.id) });
      navigate(`/shows/${state!.show.id}`, { replace: true });
    },
  });

  // A hold can't be re-fetched by id, so a page refresh loses the flow.
  if (!state) return <Navigate to="/" replace />;

  const { hold, seats, show } = state;

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Checkout" subtitle={show.title} />

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800">{formatDateTime(show.startsAt)}</p>
            <p>{show.venueName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Held for</p>
            {expired ? (
              <span className="font-mono font-semibold text-rose-600">00:00</span>
            ) : (
              <HoldCountdown expiresAt={hold.expiresAt} onExpire={() => setExpired(true)} />
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody>
            {seats.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-2 text-slate-600">
                  Seat {s.label} · {s.categoryName}
                </td>
                <td className="py-2 text-right text-slate-800">{formatMoney(s.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-semibold text-slate-900">Total</td>
              <td className="pt-3 text-right font-semibold text-slate-900">
                {formatMoney(hold.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 space-y-3">
          {error && <Alert tone="error">{error}</Alert>}

          {expired ? (
            <Alert tone="warning">
              Your hold expired and the seats were released.{' '}
              <Link to={`/shows/${show.id}`} className="font-medium underline">
                Pick seats again
              </Link>
              .
            </Alert>
          ) : (
            <>
              <p className="text-center text-xs text-slate-400">
                Payment is simulated for this demo — confirming books instantly and emails your QR ticket.
              </p>
              <Button
                className="w-full"
                loading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
              >
                Confirm booking · {formatMoney(hold.totalAmount)}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                loading={releaseMutation.isPending}
                onClick={() => releaseMutation.mutate()}
              >
                Cancel & release seats
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
