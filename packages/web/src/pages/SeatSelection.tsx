import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SeatStatus, type SeatMapSeatDTO } from '@ticket/shared';
import { showsApi, waitlistApi } from '../api/endpoints';
import type { CheckoutState, HeldSeatLine } from '../api/types';
import { queryKeys } from '../lib/queryKeys';
import { apiErrorMessage } from '../lib/api';
import { formatDateTime, formatMoney } from '../lib/format';
import { useAuth } from '../auth/AuthContext';
import { useShowSocket } from '../realtime/useShowSocket';
import { SeatMap } from '../components/SeatMap';
import { SeatMapLegend } from '../components/SeatMapLegend';
import { Alert, Badge, Button, Card, Loading } from '../components/ui';

const MAX_SEATS = 10;

export default function SeatSelection() {
  const { id: showId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useShowSocket(showId);

  const showQuery = useQuery({
    queryKey: queryKeys.show(showId!),
    queryFn: () => showsApi.get(showId!),
    enabled: Boolean(showId),
  });
  const seatQuery = useQuery({
    queryKey: queryKeys.seatMap(showId!),
    queryFn: () => showsApi.seats(showId!),
    enabled: Boolean(showId),
  });
  const waitlistQuery = useQuery({
    queryKey: queryKeys.myWaitlist(showId!),
    queryFn: () => showsApi.myWaitlist(showId!),
    enabled: Boolean(showId) && isAuthenticated,
  });

  const seatMap = seatQuery.data;

  // Drop any selected seat that another customer just took (via live updates).
  useEffect(() => {
    if (!seatMap) return;
    setSelectedIds((prev) => {
      const stillFree = new Set(
        seatMap.seats.filter((s) => s.status === SeatStatus.AVAILABLE && !s.heldByMe).map((s) => s.id),
      );
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (stillFree.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [seatMap]);

  const selectedSeats = useMemo(
    () => (seatMap ? seatMap.seats.filter((s) => selectedIds.has(s.id)) : []),
    [seatMap, selectedIds],
  );
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const holdMutation = useMutation({
    mutationFn: () => showsApi.createHold(showId!, [...selectedIds]),
    onSuccess: (hold) => {
      const seats: HeldSeatLine[] = selectedSeats.map((s) => ({
        id: s.id,
        label: `${s.rowLabel}${s.colNumber}`,
        categoryName: s.categoryName,
        price: s.price,
      }));
      const state: CheckoutState = {
        hold,
        seats,
        show: {
          id: showId!,
          title: showQuery.data?.event.title ?? 'Show',
          venueName: showQuery.data?.venue.name ?? '',
          startsAt: showQuery.data?.startsAt ?? hold.expiresAt,
        },
      };
      navigate('/checkout', { state });
    },
    onError: (err) => {
      setError(apiErrorMessage(err, 'Those seats were just taken. Please pick again.'));
      setSelectedIds(new Set());
      void queryClient.invalidateQueries({ queryKey: queryKeys.seatMap(showId!) });
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: (categoryId: string) => showsApi.joinWaitlist(showId!, categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myWaitlist(showId!) });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not join the waitlist.')),
  });

  const leaveMutation = useMutation({
    mutationFn: (entryId: string) => waitlistApi.leave(entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myWaitlist(showId!) });
    },
  });

  const toggleSeat = (seat: SeatMapSeatDTO) => {
    setError(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else if (next.size < MAX_SEATS) {
        next.add(seat.id);
      }
      return next;
    });
  };

  if (showQuery.isLoading || seatQuery.isLoading) return <Loading label="Loading seat map…" />;
  if (showQuery.isError || !showQuery.data || !seatMap)
    return <Alert tone="error">Couldn’t load this show.</Alert>;

  const show = showQuery.data;
  const waitlistByCat = new Map((waitlistQuery.data ?? []).map((e) => [e.seatCategoryId, e]));

  return (
    <div>
      <div className="mb-6">
        <Link to={`/events/${show.event.id}`} className="text-sm text-brand hover:underline">
          ← {show.event.title}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{formatDateTime(show.startsAt)}</h1>
        <p className="text-sm text-slate-500">
          {show.venue.name} · {show.venue.address}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="warning">{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-4 sm:p-6">
          <SeatMap
            seatMap={seatMap}
            selectedIds={selectedIds}
            onToggle={toggleSeat}
            disabled={holdMutation.isPending}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SeatMapLegend categories={seatMap.categories} />
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-slate-800">Your selection</h2>
            {selectedSeats.length === 0 ? (
              <p className="text-sm text-slate-500">Tap available seats to select them.</p>
            ) : (
              <ul className="mb-3 space-y-1 text-sm">
                {selectedSeats.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span className="text-slate-600">
                      {s.rowLabel}
                      {s.colNumber} · {s.categoryName}
                    </span>
                    <span className="text-slate-800">{formatMoney(s.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-4 flex justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
            {isAuthenticated ? (
              <Button
                className="w-full"
                disabled={selectedSeats.length === 0}
                loading={holdMutation.isPending}
                onClick={() => holdMutation.mutate()}
              >
                Hold {selectedSeats.length || ''} seat{selectedSeats.length === 1 ? '' : 's'} & checkout
              </Button>
            ) : (
              <Link to="/login" state={{ from: { pathname: `/shows/${showId}` } }}>
                <Button className="w-full" variant="secondary">
                  Log in to book
                </Button>
              </Link>
            )}
            <p className="mt-2 text-center text-xs text-slate-400">
              Seats are held for a limited time during checkout.
            </p>
          </Card>

          {seatMap.soldOutCategoryIds.length > 0 && (
            <Card className="p-4">
              <h2 className="mb-3 font-semibold text-slate-800">Sold-out categories</h2>
              <div className="space-y-3">
                {seatMap.categories
                  .filter((c) => seatMap.soldOutCategoryIds.includes(c.id))
                  .map((c) => {
                    const entry = waitlistByCat.get(c.id);
                    return (
                      <div key={c.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge color={c.color}>{c.name}</Badge>
                          <span className="text-xs text-slate-400">{formatMoney(c.price)}</span>
                        </div>
                        {!isAuthenticated ? (
                          <Link to="/login" state={{ from: { pathname: `/shows/${showId}` } }}>
                            <Button size="sm" variant="secondary" className="w-full">
                              Log in to join waitlist
                            </Button>
                          </Link>
                        ) : entry?.status === 'OFFERED' && entry.offer ? (
                          <Link to={`/waitlist/offer/${entry.offer.token}`}>
                            <Button size="sm" className="w-full">
                              🎉 A seat is yours — claim it
                            </Button>
                          </Link>
                        ) : entry?.status === 'WAITING' ? (
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-slate-600">
                              You’re <strong>#{entry.position}</strong> in line
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={leaveMutation.isPending}
                              onClick={() => leaveMutation.mutate(entry.id)}
                            >
                              Leave
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            loading={waitlistMutation.isPending}
                            onClick={() => waitlistMutation.mutate(c.id)}
                          >
                            Join waitlist
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
