import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, LineChart, LogOut, Moon, PlaneTakeoff, RefreshCcw, Sun } from 'lucide-react';
import { useAuth } from '@features/auth/auth-context';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTheme } from './theme-provider';
import { cn } from '@lib/utils/cn';

const navItems: Array<{
  to: string;
  label: string;
  description: string;
  roles: Array<'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN'>;
  icon: LucideIcon;
}> = [
  {
    to: '/advances',
    label: 'My advances',
    description: 'Track requests & retirements',
    roles: ['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'],
    icon: LayoutDashboard
  },
  {
    to: '/advances/new',
    label: 'Request advance',
    description: 'Launch a guided cash request',
    roles: ['EMPLOYEE', 'ADMIN'],
    icon: PlaneTakeoff
  },
  {
    to: '/finance',
    label: 'Finance hub',
    description: 'Oversight & reconciliation',
    roles: ['FINANCE', 'ADMIN'],
    icon: LineChart
  }
];

export function AppLayout() {
  const { user, signInAs, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRoleChange = async () => {
    const nextRole =
      user?.role === 'EMPLOYEE' ? 'MANAGER' : user?.role === 'MANAGER' ? 'FINANCE' : 'EMPLOYEE';
    await signInAs(nextRole);
    navigate('/advances');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-[-10%] h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/20 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-base font-bold text-white shadow-lg shadow-brand-500/30">
                IF
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">ImprestFlow</p>
                <p className="text-xs text-slate-400">Cash advance command center</p>
              </div>
            </Link>
            <nav className="hidden gap-3 overflow-x-auto lg:flex">
              {navItems
                .filter((item) => (user ? item.roles.includes(user.role) : item.roles.includes('EMPLOYEE')))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex min-w-[200px] items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200',
                          isActive
                            ? 'border-white/40 bg-white/15 shadow-lg shadow-brand-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        )
                      }
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-slate-300">{item.description}</p>
                      </div>
                    </NavLink>
                  );
                })}
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs leading-tight">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-slate-400">{user.email}</p>
                  </div>
                  <Badge variant="info" className="uppercase tracking-wide">
                    {user.role}
                  </Badge>
                  <Button variant="secondary" size="sm" onClick={handleRoleChange} className="gap-1">
                    <RefreshCcw className="h-4 w-4" />
                    Switch
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-rose-200 hover:text-rose-100">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => signInAs('EMPLOYEE')}>Sign in</Button>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-10">
          <div className="space-y-8">
            <nav className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
              {navItems
                .filter((item) => (user ? item.roles.includes(user.role) : item.roles.includes('EMPLOYEE')))
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex min-w-[180px] flex-col rounded-2xl border px-4 py-3 text-left transition-all',
                        isActive
                          ? 'border-white/40 bg-white/15 text-white shadow-lg shadow-brand-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                      )
                    }
                  >
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                    <span className="text-xs text-slate-300">{item.description}</span>
                  </NavLink>
                ))}
            </nav>
            {user && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-brand-500/10 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 text-lg font-semibold text-white shadow-inner">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-300">Active persona</p>
                    <p className="text-lg font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Workspace optimised for <strong className="text-white">{user.role.toLowerCase()}</strong>
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Realtime policy guardrails</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">OCR-ready receipts</span>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
