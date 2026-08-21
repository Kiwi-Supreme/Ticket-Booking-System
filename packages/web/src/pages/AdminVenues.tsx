import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { venuesApi } from '../api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import { Alert, Badge, Button, Card, EmptyState, Loading, PageTitle } from '../components/ui';

export default function AdminVenues() {
  const query = useQuery({ queryKey: queryKeys.venues, queryFn: () => venuesApi.list() });

  return (
    <div>
      <PageTitle
        title="Venues"
        subtitle="Manage venues, seat categories, and layouts."
        right={
          <Link to="/admin/venues/new">
            <Button>+ New venue</Button>
          </Link>
        }
      />

      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Alert tone="error">Couldn’t load venues.</Alert>
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title="No venues yet">Create a venue to define its seating.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {query.data!.map((v) => (
            <Link key={v.id} to={`/admin/venues/${v.id}`} className="block">
              <Card className="p-4 transition-shadow hover:shadow-md">
                <h3 className="font-semibold text-slate-900">{v.name}</h3>
                <p className="text-sm text-slate-500">{v.address}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.categories.map((c) => (
                    <Badge key={c.id} color={c.color}>
                      {c.name}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {v._count.seats} seats · {v._count.shows} show{v._count.shows === 1 ? '' : 's'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
