import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { Alert, Badge, Button, Card, EmptyState, Loading, PageTitle } from '../components/ui';

const typeLabel: Record<string, string> = { MOVIE: '🎬 Movie', CONCERT: '🎵 Concert' };

export default function OrganiserDashboard() {
  const query = useQuery({ queryKey: queryKeys.myEvents, queryFn: () => eventsApi.mine() });

  return (
    <div>
      <PageTitle
        title="Organiser dashboard"
        subtitle="Create events, schedule shows, and track revenue."
        right={
          <Link to="/organiser/events/new">
            <Button>+ New event</Button>
          </Link>
        }
      />

      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Alert tone="error">Couldn’t load your events.</Alert>
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title="No events yet">Create your first event to start scheduling shows.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {query.data!.map((e) => (
            <Card key={e.id} className="flex flex-col p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge>{typeLabel[e.type] ?? e.type}</Badge>
                {e.genre && <Badge>{e.genre}</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900">{e.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {e.showCount} show{e.showCount === 1 ? '' : 's'}
              </p>
              <div className="mt-4 flex gap-2">
                <Link to={`/organiser/events/${e.id}/summary`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Summary
                  </Button>
                </Link>
                <Link to={`/organiser/events/${e.id}/shows/new`} className="flex-1">
                  <Button size="sm" className="w-full">
                    Add show
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
