import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Role } from '@ticket/shared';
import { useAuth } from '../auth/AuthContext';
import { Button } from './ui';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-slate-100',
        )
      }
    >
      {children}
    </NavLink>
  );
}

const roleLabel: Record<Role, string> = {
  CUSTOMER: 'Customer',
  ORGANISER: 'Organiser',
  ADMIN: 'Admin',
};

export function Layout() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-2 flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">🎟</span>
            <span className="hidden sm:inline">TicketBox</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem to="/">Browse</NavItem>
            {hasRole(Role.CUSTOMER) && <NavItem to="/bookings">My Bookings</NavItem>}
            {hasRole(Role.ORGANISER) && <NavItem to="/organiser">Dashboard</NavItem>}
            {hasRole(Role.ADMIN) && <NavItem to="/admin/venues">Venues</NavItem>}
            {hasRole(Role.ORGANISER, Role.ADMIN) && <NavItem to="/verify">Verify</NavItem>}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{roleLabel[user.role]}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        TicketBox — seat holds auto-release, sold-out shows waitlist, every booking emails a QR ticket.
      </footer>
    </div>
  );
}
