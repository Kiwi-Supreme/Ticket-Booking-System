import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Role } from '@ticket/shared';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../lib/api';
import { Alert, Button, Card, Field, Input, Select } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.CUSTOMER);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, role: role as 'CUSTOMER' | 'ORGANISER' });
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">
          Customers book seats; organisers create events and shows.
        </p>

        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Name" htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
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
          <Field label="Password" htmlFor="password" hint="At least 8 characters.">
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="new-password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="I am a…" htmlFor="role">
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value={Role.CUSTOMER}>Customer — browse & book</option>
              <option value={Role.ORGANISER}>Organiser — create events</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full" loading={submitting}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
