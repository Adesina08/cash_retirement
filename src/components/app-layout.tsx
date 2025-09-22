import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/auth-context';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTheme } from './theme-provider';

const navItems = [
  { to: '/advances', label: 'My Advances', roles: ['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'] },
  { to: '/advances/new', label: 'Request Advance', roles: ['EMPLOYEE', 'ADMIN'] },
  { to: '/finance', label: 'Finance Dashboard', roles: ['FINANCE', 'ADMIN'] }
] as const;

export function AppLayout() {
  const { user, signInAs, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRoleChange = async () => {
    const nextRole = user?.role === 'EMPLOYEE' ? 'MANAGER' : user?.role === 'MANAGER' ? 'FINANCE' : 'EMPLOYEE';
    await signInAs(nextRole);
    navigate('/advances');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            ImprestFlow
          </Link>
          <nav className="flex items-center gap-2">
            {navItems
              .filter((item) => (user ? item.roles.includes(user.role) : item.roles.includes('EMPLOYEE')))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                <Badge variant="info">{user.role}</Badge>
                <Button variant="secondary" size="sm" onClick={handleRoleChange}>
                  Switch role
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button onClick={() => signInAs('EMPLOYEE')}>Sign in</Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
