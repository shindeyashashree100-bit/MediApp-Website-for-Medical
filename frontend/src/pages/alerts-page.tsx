import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import {
  getExpiredItems,
  getExpiringItems,
  getLowStockItems,
} from '@/services/dashboard.service';

import type { DashboardAlertBatch } from '@/types/dashboard';

type LowStockItem = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  sku: string | null;
  unitId: string;
  unitRelation: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
  };
  minimumStock: number;
  currentStock: number;
  batches: {
    id: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
  }[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getDaysUntilExpiry(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function matchesSearch(
  values: Array<string | null | undefined>,
  search: string,
) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return values.some((value) =>
    value?.toLowerCase().includes(query),
  );
}

export function AlertsPage() {
  const [lowStock, setLowStock] = useState<
    LowStockItem[]
  >([]);

  const [expiring, setExpiring] = useState<
    DashboardAlertBatch[]
  >([]);

  const [expired, setExpired] = useState<
    DashboardAlertBatch[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState('');

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  async function loadAlerts() {
    setIsLoading(true);
    setError(null);

    try {
      const [
        lowStockItems,
        expiringItems,
        expiredItems,
      ] = await Promise.all([
        getLowStockItems(),
        getExpiringItems(),
        getExpiredItems(),
      ]);

      setLowStock(lowStockItems);
      setExpiring(expiringItems);
      setExpired(expiredItems);

      setSuccessMessage(
        'Alerts refreshed successfully.',
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load inventory alerts.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage]);

  const filteredLowStock = useMemo(() => {
    return lowStock.filter((item) =>
      matchesSearch(
        [
          item.name,
          item.genericName,
          item.brandName,
          item.sku,
        ],
        search,
      ),
    );
  }, [lowStock, search]);

  const filteredExpiring = useMemo(() => {
    return expiring.filter((item) =>
      matchesSearch(
        [
          item.medicine.name,
          item.medicine.genericName,
          item.medicine.brandName,
          item.medicine.sku,
          item.batchNumber,
        ],
        search,
      ),
    );
  }, [expiring, search]);

  const filteredExpired = useMemo(() => {
    return expired.filter((item) =>
      matchesSearch(
        [
          item.medicine.name,
          item.medicine.genericName,
          item.medicine.brandName,
          item.medicine.sku,
          item.batchNumber,
        ],
        search,
      ),
    );
  }, [expired, search]);

  const totalAlerts =
    lowStock.length +
    expiring.length +
    expired.length;

  return (
    <div className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="fixed right-5 top-5 z-[100] w-[min(420px,calc(100vw-2rem))] rounded-xl border border-emerald-200 bg-white p-4 shadow-xl ring-1 ring-emerald-100"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={20}
                className="text-emerald-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-emerald-900">
                  Success
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setSuccessMessage(null)
                  }
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Dismiss success message"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Alerts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor low stock, expiring batches, and
            expired inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAlerts()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
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
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Alerts
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalAlerts}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Current inventory warnings
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {lowStock.length}
          </p>

          <p className="mt-1 text-xs text-amber-600">
            Medicines at or below minimum
          </p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
            Expiring Soon
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-700">
            {expiring.length}
          </p>

          <p className="mt-1 text-xs text-orange-600">
            Batches within warning period
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600">
            Expired
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {expired.length}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Batches already expired
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search medicine or batch..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading alerts...
          </div>
        </div>
      ) : (
        <>
          {/* LOW STOCK */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                  <AlertTriangle
                    size={19}
                    className="text-amber-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Low Stock
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Medicines requiring replenishment
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {filteredLowStock.length}
              </span>
            </div>

            {filteredLowStock.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2
                  size={34}
                  className="mx-auto text-emerald-400"
                />

                <p className="mt-3 font-medium text-slate-800">
                  No low-stock medicines
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? 'No matching medicines found.'
                    : 'All medicines are currently above their minimum stock level.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">
                        Medicine
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Current Stock
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Minimum Stock
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Unit
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredLowStock.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {item.name}
                            </p>

                            {item.genericName && (
                              <p className="mt-1 text-xs text-slate-500">
                                {item.genericName}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-red-700">
                              {item.currentStock}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {item.minimumStock}
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {item.unitRelation.name}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Reorder
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* EXPIRING */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                  <Clock
                    size={19}
                    className="text-orange-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Expiring Soon
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Batches approaching their expiry date
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                {filteredExpiring.length}
              </span>
            </div>

            {filteredExpiring.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2
                  size={34}
                  className="mx-auto text-emerald-400"
                />

                <p className="mt-3 font-medium text-slate-800">
                  No batches expiring soon
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? 'No matching batches found.'
                    : 'There are no batches inside the configured expiry warning period.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">
                        Medicine
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Batch
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Quantity
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Expiry Date
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredExpiring.map(
                      (item) => {
                        const days =
                          getDaysUntilExpiry(
                            item.expiryDate,
                          );

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900">
                                {item.medicine.name}
                              </p>

                              {item.medicine.genericName && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    item
                                      .medicine
                                      .genericName
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 font-medium text-slate-800">
                              {item.batchNumber}
                            </td>

                            <td className="px-5 py-4 text-slate-700">
                              {item.quantity}
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {formatDate(
                                  item.expiryDate,
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                <Clock size={13} />
                                {days === 0
                                  ? 'Expires today'
                                  : `Expires in ${days} day${
                                      days === 1
                                        ? ''
                                        : 's'
                                    }`}
                              </span>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* EXPIRED */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle
                    size={19}
                    className="text-red-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Expired Inventory
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Expired batches that still have stock
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                {filteredExpired.length}
              </span>
            </div>

            {filteredExpired.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2
                  size={34}
                  className="mx-auto text-emerald-400"
                />

                <p className="mt-3 font-medium text-slate-800">
                  No expired inventory
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? 'No matching expired batches found.'
                    : 'There are currently no expired batches with available stock.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">
                        Medicine
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Batch
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Quantity
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Expiry Date
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredExpired.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-red-50/30"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {item.medicine.name}
                            </p>

                            {item.medicine.genericName && (
                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  item
                                    .medicine
                                    .genericName
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 font-medium text-slate-800">
                            {item.batchNumber}
                          </td>

                          <td className="px-5 py-4 font-semibold text-red-700">
                            {item.quantity}
                          </td>

                          <td className="px-5 py-4">
                            {formatDate(
                              item.expiryDate,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <AlertTriangle
                                size={13}
                              />
                              Expired
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}