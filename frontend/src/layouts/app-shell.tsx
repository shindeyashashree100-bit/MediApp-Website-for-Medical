import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { OnlineStatus } from '@/components/common/online-status';
import { appRoutes } from '@/routes/app-routes';
import { cn } from '@/lib/utils';

function Navigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  // Keep /units registered as a route, but don't show it
  // as a separate item in the main sidebar.
  const navigationRoutes = appRoutes.filter(
    ({ path }) => path !== '/units',
  );

  return (
    <nav
      aria-label="Main navigation"
      className="space-y-1"
    >
      {navigationRoutes.map(
        ({
          path,
          label,
          icon: Icon,
        }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        <div className="mb-8 px-3">
          <p className="text-lg font-semibold text-teal-800">
            Medical Inventory
          </p>

          <p className="text-xs text-slate-500">
            Store management
          </p>
        </div>

        <Navigation />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">

          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() =>
              setIsMenuOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <div className="hidden text-sm font-semibold text-slate-800 lg:block">
            Medical Inventory
          </div>

          <OnlineStatus />
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          role="dialog"
          aria-modal="true"
        >

          {/* Overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30"
            aria-label="Close navigation"
            onClick={() =>
              setIsMenuOpen(false)
            }
          />

          {/* Sidebar */}
          <aside className="relative h-full w-72 bg-white p-4 shadow-xl">

            <div className="mb-8 flex items-center justify-between px-3">

              <div>
                <p className="text-lg font-semibold text-teal-800">
                  Medical Inventory
                </p>

                <p className="text-xs text-slate-500">
                  Store management
                </p>
              </div>

              <button
                type="button"
                aria-label="Close navigation"
                className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
                onClick={() =>
                  setIsMenuOpen(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <Navigation
              onNavigate={() =>
                setIsMenuOpen(false)
              }
            />

          </aside>
        </div>
      )}
    </div>
  );
}