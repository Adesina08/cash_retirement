import { FormEvent, ReactNode, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, Sparkles, UploadCloud, Users } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useAuth } from '@features/auth/auth-context';
import { Role } from '@lib/types';
import { cn } from '@lib/utils/cn';

const personaCopy: Record<Role, { title: string; subtitle: string; gradient: string; highlights: string[] }> = {
  EMPLOYEE: {
    title: 'Employee traveller',
    subtitle: 'Request cash advances, capture receipts on the go, and retire in minutes.',
    gradient: 'from-brand-500 via-sky-500 to-emerald-500',
    highlights: ['Guided advance wizard', 'Instant OCR on receipts', 'Real-time policy checks']
  },
  MANAGER: {
    title: 'Team manager',
    subtitle: 'Approve trips confidently with built-in policy guardrails and audit trails.',
    gradient: 'from-purple-500 via-brand-500 to-cyan-400',
    highlights: ['One-click approvals', 'Policy breach alerts', 'Live spending insights']
  },
  FINANCE: {
    title: 'Finance controller',
    subtitle: 'Monitor float exposure, reconcile retirements, and export ledgers effortlessly.',
    gradient: 'from-emerald-500 via-teal-500 to-brand-500',
    highlights: ['Aging dashboards', 'Automated compliance flags', 'GL-ready exports']
  },
  ADMIN: {
    title: 'System admin',
    subtitle: 'Fine-tune policies, manage users, and orchestrate seamless cash operations.',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    highlights: ['Policy automation', 'Delegated access', 'Full visibility']
  }
};

const personaOrder: Role[] = ['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'];

export function LoginPage() {
  const { user, loading, signInAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('EMPLOYEE');
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: Location } | undefined;
  const redirectTo = state?.from?.pathname ?? '/advances';

  const persona = personaCopy[selectedRole];

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setError(null);
    try {
      await signInAs(selectedRole);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in with the selected persona.';
      setError(message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-15%] top-[-10%] h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-500/20 via-transparent to-transparent" />
        <div className="absolute inset-y-0 left-1/2 hidden w-px translate-x-[-50%] bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <section className="space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                ImprestFlow 2.0
              </span>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Cash advance workflows that feel crafted for people.
              </h1>
              <p className="max-w-xl text-base text-slate-300 md:text-lg">
                Move from tangled spreadsheets to a delightful, intelligent workspace. Capture receipts instantly, reconcile in real
                time, and empower every role with the context they need.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard icon={<UploadCloud className="h-5 w-5" />} title="Instant capture" description="Snap or drag receipts and let OCR do the heavy lifting." />
              <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} title="Policy smart" description="Policy breaches surface instantly with actionable nudges." />
              <FeatureCard icon={<Building2 className="h-5 w-5" />} title="Finance-ready" description="Auto-build ledgers with GL mappings and audit trails." />
            </div>
          </section>

          <section>
            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Sign in to ImprestFlow</h2>
                <p className="text-sm text-slate-200">Choose a persona to experience tailored dashboards and controls.</p>
              </div>

              <div className="mt-6 space-y-3">
                {personaOrder.map((role) => {
                  const content = personaCopy[role];
                  const isActive = role === selectedRole;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                        isActive
                          ? 'border-white/60 bg-white/20 shadow-lg shadow-brand-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{content.title}</p>
                          <p className="mt-1 text-xs text-slate-200">{content.subtitle}</p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white',
                            `bg-gradient-to-br ${content.gradient}`
                          )}
                        >
                          {role.slice(0, 2)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] text-slate-200">
                        {content.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 font-medium uppercase tracking-wide"
                          >
                            <Users className="h-3 w-3" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 space-y-3">
                <Button type="submit" disabled={signingIn} className="w-full text-base font-semibold">
                  {signingIn ? 'Signing you in…' : `Continue as ${persona.title}`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-slate-200/90">
                  Passwordless demo access. Switch personas anytime after signing in.
                </p>
                {error && <p className="rounded-lg bg-rose-500/20 p-3 text-center text-xs text-rose-100">{error}</p>}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-100">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-200/80">{description}</p>
    </div>
  );
}
