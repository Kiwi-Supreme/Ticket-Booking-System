import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div>
        <p className="text-6xl font-bold text-slate-200">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-800">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to browse</Button>
        </Link>
      </div>
    </div>
  );
}
