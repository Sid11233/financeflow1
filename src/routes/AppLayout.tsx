import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useAuth } from '@/features/auth/hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/requests', label: 'Requests' },
  { to: '/activity', label: 'Activity' },
  { to: '/settings/team', label: 'Team' },
  { to: '/settings/notifications', label: 'Settings' },
];

// Below lg (1024px — comfortably past tablet-portrait width), the sidebar
// is an off-canvas drawer instead of a permanent column: a fixed 224px
// column left always-visible would eat most of a phone's width. At lg and
// up this renders exactly as the old permanent sidebar did.
export function AppLayout() {
  const { profile, user, signOut } = useAuth();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  // NotificationBell owns a realtime subscription — mounting it in both the
  // mobile top bar and the sidebar header at once (visually hidden via CSS
  // doesn't stop it from mounting) makes two subscribers open the same
  // channel and crashes the second `.on()` call, since Supabase's realtime
  // client reuses an already-subscribed channel instance for a repeated
  // topic name. Only ever mount one, matching whichever the `lg` CSS
  // breakpoint would actually show.
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-5">
        <span className="text-lg font-serif font-semibold text-neutral-900">Finly</span>
        <div className="flex items-center gap-1">
          {isDesktop && <NotificationBell />}
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'block min-h-[44px] rounded-md px-3 py-2 text-sm font-medium leading-[28px] transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
        {profile?.is_staff && (
          <NavLink
            to="/admin/metrics"
            className={({ isActive }) =>
              cn(
                'block min-h-[44px] rounded-md px-3 py-2 text-sm font-medium leading-[28px] transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )
            }
          >
            Pilot metrics
          </NavLink>
        )}
      </nav>
      <div className="border-t border-neutral-100 p-2">
        <div className="truncate px-3 py-1 text-xs text-neutral-400">{profile?.full_name ?? user?.email}</div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-neutral-50 lg:flex-row">
      {/* Mobile/tablet top bar — replaces the sidebar's own header when the
          sidebar itself is off-canvas. */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="text-base font-serif font-semibold text-neutral-900">Finly</span>
        {!isDesktop && <NotificationBell />}
      </div>

      {isNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:w-56 lg:max-w-none lg:translate-x-0',
          isNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
