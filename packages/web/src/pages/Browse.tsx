import { useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventType, type EventFilterInput } from '@ticket/shared';
import { eventsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { EventCard } from '../components/EventCard';
import { Alert, Button, EmptyState, Input, Loading, PageTitle, Select } from '../components/ui';

export default function Browse() {
  const [filter, setFilter] = useState<EventFilterInput>({});
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');

  const query = useQuery({
    queryKey: queryKeys.events(filter as Record<string, string | undefined>),
    queryFn: () => eventsApi.list(filter),
  });

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    const next: EventFilterInput = {};
    if (search.trim()) next.search = search.trim();
    if (type) next.type = type as EventType;
    setFilter(next);
  };

  const events = query.data ?? [];
  const heading = useMemo(() => {
    if (type === EventType.MOVIE) return 'Movies';
    if (type === EventType.CONCERT) return 'Concerts';
    return 'What’s on';
  }, [type]);

  return (
    <div>
      <PageTitle title={heading} subtitle="Book seats from a live map — held seats auto-release." />

      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-40"
          aria-label="Event type"
        >
          <option value="">All types</option>
          <option value={EventType.MOVIE}>Movies</option>
          <option value={EventType.CONCERT}>Concerts</option>
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Alert tone="error">Couldn’t load events. Is the API running?</Alert>
      ) : events.length === 0 ? (
        <EmptyState title="No events found">Try clearing your filters.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
