import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { waitlistApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { apiErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { HoldCountdown } from '../components/HoldCountdown';
import { Alert, Badge, Button, Card, Loading, PageTitle } from '../components/ui';

export default function WaitlistOffer() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.offer(token!),
    queryFn: () => waitlistApi.getOffer(token!),
    enabled: Boolean(token),
  });

  const acceptMutation = useMutation({
    mutationFn: () => waitlistApi.acceptOffer(token!),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      navigate(`/bookings/${booking.reference}`, { replace: true, state: { justBooked: true } });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not accept this offer.')),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <Alert tone="error">This offer link is invalid or has expired.</Alert>;

  const offer = query.data;
  const isOpen = offer.status === 'PENDING' && !expired;

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Your waitlist offer" />
      <Card className="p-6">
        <div className="mb-4 rounded-lg bg-brand/5 p-4 text-center">
          <p className="text-sm text-slate-500">A seat has opened up for</p>
          <p className="text-lg font-bold text-slate-900">{offer.eventTitle}</p>
          <p className="text-sm text-slate-500">
            {formatDateTime(offer.startsAt)} · {offer.venueName}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge>Seat {offer.seatLabel}</Badge>
            <Badge>{offer.categoryName}</Badge>
          </div>
        </div>

        {offer.status === 'ACCEPTED' ? (
          <Alert tone="success">
            You’ve already accepted this offer.{' '}
            <Link to="/bookings" className="font-medium underline">
              View your bookings
            </Link>
            .
          </Alert>
        ) : !isOpen ? (
          <Alert tone="warning">
            This offer has expired and the seat was passed to the next person in line.
          </Alert>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Claim within</span>
              <HoldCountdown expiresAt={offer.expiresAt} onExpire={() => setExpired(true)} />
            </div>
            {error && (
              <div className="mb-3">
                <Alert tone="error">{error}</Alert>
              </div>
            )}
            <Button
              className="w-full"
              loading={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              Accept & book this seat
            </Button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Payment is simulated — accepting books the seat and emails your QR ticket.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
