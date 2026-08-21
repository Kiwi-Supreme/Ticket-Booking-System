import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { TicketVerifyDTO } from '@ticket/shared';
import { ticketsApi } from '../api/endpoints';
import { apiErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { Alert, Badge, Button, Card, Field, PageTitle, Textarea } from '../components/ui';

function Result({ result }: { result: TicketVerifyDTO }) {
  return (
    <Card className={result.valid ? 'border-emerald-300 p-5' : 'border-rose-300 p-5'}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`text-2xl ${result.valid ? 'text-emerald-600' : 'text-rose-600'}`}>
          {result.valid ? '✓' : '✗'}
        </span>
        <span className={`text-lg font-bold ${result.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
          {result.valid ? 'Valid ticket' : 'Not valid'}
        </span>
      </div>
      {result.reason && <p className="mb-3 text-sm text-slate-600">{result.reason}</p>}
      {result.reference && (
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Reference</dt>
            <dd className="font-mono text-slate-800">{result.reference}</dd>
          </div>
          {result.eventTitle && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Event</dt>
              <dd className="text-slate-800">{result.eventTitle}</dd>
            </div>
          )}
          {result.startsAt && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Showtime</dt>
              <dd className="text-slate-800">{formatDateTime(result.startsAt)}</dd>
            </div>
          )}
          {result.customerName && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Customer</dt>
              <dd className="text-slate-800">{result.customerName}</dd>
            </div>
          )}
          {result.seats && result.seats.length > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Seats</dt>
              <dd className="flex flex-wrap justify-end gap-1">
                {result.seats.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  );
}

export default function TicketVerify() {
  const [token, setToken] = useState('');

  const mutation = useMutation({
    mutationFn: () => ticketsApi.verify(token.trim()),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (token.trim()) mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Verify ticket" subtitle="Paste the token encoded in a ticket’s QR code." />
      <Card className="mb-4 p-5">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Scanned QR token" htmlFor="token">
            <Textarea
              id="token"
              rows={4}
              className="font-mono text-xs"
              placeholder="eyJhbGciOi…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!token.trim()}>
            Verify
          </Button>
        </form>
      </Card>

      {mutation.isError && <Alert tone="error">{apiErrorMessage(mutation.error)}</Alert>}
      {mutation.data && <Result result={mutation.data} />}
    </div>
  );
}
