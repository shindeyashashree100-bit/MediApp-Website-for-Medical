import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import { getDashboardSummary } from '@/services/dashboard.service';
import { ApiError } from '@/services/api';
import type { DashboardSummary } from '@/types/dashboard';

function formatCurrency(value: string | number): string {
  const amount =
    typeof value === 'number'
      ? value
      : Number.parseFloat(value);

  if (!Number.isFinite(amount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition ${
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-200'
          : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
          <Icon size={22} />
        </div>

      </div>
    </button>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getDashboardSummary();

      setSummary(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load dashboard data.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="space-y-6">

        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
        </div>

      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="space-y-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Inventory and sales overview.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-3">

            <AlertTriangle
              className="mt-0.5 text-red-600"
              size={20}
            />

            <div>

              <p className="font-semibold text-red-800">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadDashboard()
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                <RefreshCw size={16} />
                Retry
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Inventory and sales overview for today.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={16}
            className={
              isLoading
                ? 'animate-spin'
                : ''
            }
          />

          Refresh

        </button>

      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* MAIN STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Medicines"
          value={summary.medicines.active}
          description={`${summary.medicines.total} total medicines`}
          icon={Package}
          onClick={() =>
            navigate('/medicines')
          }
        />

        <StatCard
          title="Suppliers"
          value={summary.suppliers.active}
          description="Active suppliers"
          icon={Truck}
          onClick={() =>
            navigate('/suppliers')
          }
        />

        <StatCard
          title="Today's Sales"
          value={summary.today.salesCount}
          description="Completed sales"
          icon={ShoppingCart}
          onClick={() =>
            navigate('/sales')
          }
        />

        <StatCard
          title="Today's Revenue"
          value={formatCurrency(
            summary.today.revenue,
          )}
          description="Total sales revenue"
          icon={IndianRupee}
          onClick={() =>
            navigate('/sales')
          }
        />

      </div>

      {/* ALERT CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">

        <button
          type="button"
          onClick={() =>
            navigate('/alerts')
          }
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
        >

          <div className="flex items-center gap-3">

            <AlertTriangle
              className="text-amber-600"
              size={22}
            />

            <div>

              <p className="text-sm font-medium text-amber-800">
                Low Stock
              </p>

              <p className="text-2xl font-bold text-amber-900">
                {
                  summary.inventory
                    .lowStockCount
                }
              </p>

            </div>

          </div>

          <p className="mt-3 text-xs text-amber-700">
            Click to view stock alerts
          </p>

        </button>

        <button
          type="button"
          onClick={() =>
            navigate('/alerts')
          }
          className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200"
        >

          <div className="flex items-center gap-3">

            <Boxes
              className="text-orange-600"
              size={22}
            />

            <div>

              <p className="text-sm font-medium text-orange-800">
                Expiring Soon
              </p>

              <p className="text-2xl font-bold text-orange-900">
                {
                  summary.inventory
                    .expiringSoonBatchCount
                }
              </p>

            </div>

          </div>

          <p className="mt-3 text-xs text-orange-700">
            Click to view expiry alerts
          </p>

        </button>

        <button
          type="button"
          onClick={() =>
            navigate('/alerts')
          }
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200"
        >

          <div className="flex items-center gap-3">

            <AlertTriangle
              className="text-red-600"
              size={22}
            />

            <div>

              <p className="text-sm font-medium text-red-800">
                Expired
              </p>

              <p className="text-2xl font-bold text-red-900">
                {
                  summary.inventory
                    .expiredBatchCount
                }
              </p>

            </div>

          </div>

          <p className="mt-3 text-xs text-red-700">
            Click to view expired batches
          </p>

        </button>

      </div>

      {/* LOWER SECTIONS */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* LOW STOCK */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <button
            type="button"
            onClick={() =>
              navigate('/alerts')
            }
            className="w-full border-b border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-slate-900">
                  Low Stock Medicines
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Medicines at or below their minimum
                  stock level. Click to view alerts.
                </p>

              </div>

              <Package
                size={20}
                className="text-slate-400"
              />

            </div>

          </button>

          {summary.inventory.lowStock.length ===
          0 ? (
            <div className="px-5 py-10 text-center">

              <Package
                size={32}
                className="mx-auto text-emerald-500"
              />

              <p className="mt-3 font-medium text-slate-900">
                Stock levels look good
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No medicines are currently below
                minimum stock.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {summary.inventory.lowStock.map(
                (medicine) => (
                  <button
                    key={medicine.id}
                    type="button"
                    onClick={() =>
                      navigate('/alerts')
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-medium text-slate-900">
                        {medicine.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Minimum:{' '}
                        {medicine.minimumStock}{' '}
                        {medicine.unitRelation?.name ??
                          'unit'}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="font-semibold text-red-700">
                        {medicine.currentStock}{' '}
                        {medicine.unitRelation?.name ??
                          'unit'}
                      </p>

                      <p className="text-xs text-slate-500">
                        Current stock
                      </p>

                    </div>

                  </button>
                ),
              )}

            </div>
          )}

        </section>

        {/* INVENTORY STATUS */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <button
            type="button"
            onClick={() =>
              navigate('/alerts')
            }
            className="w-full border-b border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-slate-900">
                  Inventory Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current inventory alerts. Click to
                  view all alerts.
                </p>

              </div>

              <Boxes
                size={20}
                className="text-slate-400"
              />

            </div>

          </button>

          <div className="divide-y divide-slate-100">

            <button
              type="button"
              onClick={() =>
                navigate('/alerts')
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="font-medium text-slate-900">
                  Low stock
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Requires replenishment
                </p>

              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                {
                  summary.inventory
                    .lowStockCount
                }
              </span>

            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/alerts')
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="font-medium text-slate-900">
                  Expiring soon
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Within configured warning period
                </p>

              </div>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                {
                  summary.inventory
                    .expiringSoonBatchCount
                }
              </span>

            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/alerts')
              }
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="font-medium text-slate-900">
                  Expired
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Expired batches with stock
                </p>

              </div>

              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                {
                  summary.inventory
                    .expiredBatchCount
                }
              </span>

            </button>

          </div>

        </section>

      </div>

    </div>
  );
}