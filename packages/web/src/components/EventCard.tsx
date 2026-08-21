import { Link } from 'react-router-dom';
import type { EventListItem } from '../api/types';
import { formatDateTime, formatMoneyRange } from '../lib/format';
import { Badge, Card } from './ui';

const typeLabel: Record<string, string> = { MOVIE: '🎬 Movie', CONCERT: '🎵 Concert' };

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Link to={`/events/${event.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center text-4xl">🎟</div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <Badge>{typeLabel[event.type] ?? event.type}</Badge>
            {event.genre && <Badge>{event.genre}</Badge>}
          </div>
          <h3 className="line-clamp-1 font-semibold text-slate-900">{event.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-500">{event.description || '—'}</p>
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="text-slate-500">
              {event.nextShowAt ? formatDateTime(event.nextShowAt) : 'No shows yet'}
            </span>
            <span className="font-medium text-slate-800">
              {formatMoneyRange(event.minPrice, event.maxPrice)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
