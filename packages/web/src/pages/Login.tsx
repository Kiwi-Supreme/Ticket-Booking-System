import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../lib/api';
import { Alert, Button, Card, Field, Input } from '../components/ui';

interface LocationState {
  from?: { pathname: string };
}

const demoAccounts = [
  ['Customer', 'alice@ticket.dev'],
  ['Organiser', 'organiser@ticket.dev'],
  ['Admin', 'admin@ticket.dev'],
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(dest, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Log in to book seats and manage your tickets.</p>

        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" className="w-full" loading={submitting}>
            Log in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </Card>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <p className="mb-2 font-medium text-slate-600">Demo accounts (password: password123)</p>
        <ul className="space-y-1">
          {demoAccounts.map(([role, mail]) => (
            <li key={mail} className="flex justify-between">
              <span>{role}</span>
              <button
                type="button"
                className="font-mono text-brand hover:underline"
                onClick={() => {
                  setEmail(mail);
                  setPassword('password123');
                }}
              >
                {mail}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
