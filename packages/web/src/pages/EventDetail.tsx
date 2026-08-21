import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { formatDateTime, formatMoney } from '../lib/format';
import type { ShowInEvent } from '../api/types';
import { Alert, Badge, Button, Card, Loading, PageTitle } from '../components/ui';

const typeLabel: Record<string, string> = { MOVIE: '🎬 Movie', CONCERT: '🎵 Concert' };

function ShowRow({ show }: { show: ShowInEvent }) {
  const pct = show.totalSeats ? Math.round((show.availableSeats / show.totalSeats) * 100) : 0;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{formatDateTime(show.startsAt)}</p>
          <p className="text-sm text-slate-500">
            {show.venue.name} · {show.venue.address}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {show.pricing.map((p) => (
              <Badge key={p.seatCategoryId} color={p.color}>
                {p.name} · {formatMoney(p.price)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-right">
          {show.soldOut ? (
            <Badge>Sold out</Badge>
          ) : (
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{show.availableSeats}</span> /{' '}
              {show.totalSeats} seats
            </p>
          )}
          <div className="mt-2">
            <Link to={`/shows/${show.id}`}>
              <Button variant={show.soldOut ? 'secondary' : 'primary'} size="sm">
                {show.soldOut ? 'View & join waitlist' : 'Select seats'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!show.soldOut && show.totalSeats > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      )}
    </Card>
  );
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: queryKeys.event(id!),
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <Alert tone="error">Event not found.</Alert>;
  const event = query.data;

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover" />
        )}
        <div className="p-6">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{typeLabel[event.type] ?? event.type}</Badge>
            {event.genre && <Badge>{event.genre}</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Presented by {event.organiser.name}</p>
          {event.description && <p className="mt-4 text-slate-600">{event.description}</p>}
        </div>
      </div>

      <PageTitle title="Showtimes" />
      {event.shows.length === 0 ? (
        <Alert tone="info">No shows have been scheduled for this event yet.</Alert>
      ) : (
        <div className="space-y-3">
          {event.shows.map((show) => (
            <ShowRow key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
