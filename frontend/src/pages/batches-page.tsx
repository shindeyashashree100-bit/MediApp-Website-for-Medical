import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Check,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import { getBatches } from '@/services/batch.service';
import type { Batch } from '@/types/batch';

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
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

function getExpiryStatus(expiryDate: string) {
  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return {
      label: 'Expired',
      className:
        'bg-red-100 text-red-700',
      icon: AlertTriangle,
    };
  }

  if (days <= 30) {
    return {
      label: `Expires in ${days} day${
        days === 1 ? '' : 's'
      }`,
      className:
        'bg-amber-100 text-amber-700',
      icon: Clock,
    };
  }

  if (days <= 90) {
    return {
      label: `Expires in ${days} days`,
      className:
        'bg-yellow-100 text-yellow-700',
      icon: Clock,
    };
  }

  return {
    label: 'Good',
    className:
      'bg-emerald-100 text-emerald-700',
    icon: Check,
  };
}

function getStockStatus(quantity: number) {
  if (quantity <= 0) {
    return {
      label: 'Out of stock',
      className:
        'bg-red-100 text-red-700',
    };
  }

  return {
    label: 'In stock',
    className:
      'bg-emerald-100 text-emerald-700',
  };
}

export function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>(
    [],
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState('');

  const [showInactive, setShowInactive] =
    useState(false);

  async function loadBatches() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getBatches(
        showInactive,
      );

      setBatches(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load batches.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBatches();
  }, [showInactive]);

  const filteredBatches = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return batches;
    }

    return batches.filter((batch) => {
      return [
        batch.batchNumber,
        batch.normalizedBatchNumber,
        batch.medicine.name,
        batch.medicine.genericName,
        batch.medicine.brandName,
      ].some((value) =>
        value
          ?.toLowerCase()
          .includes(query),
      );
    });
  }, [batches, search]);

  const summary = useMemo(() => {
    let totalStock = 0;
    let expired = 0;
    let expiringSoon = 0;
    let zeroStock = 0;

    for (const batch of batches) {
      totalStock += batch.quantity;

      if (batch.quantity <= 0) {
        zeroStock += 1;
      }

      const days =
        getDaysUntilExpiry(
          batch.expiryDate,
        );

      if (days < 0) {
        expired += 1;
      } else if (days <= 90) {
        expiringSoon += 1;
      }
    }

    return {
      total: batches.length,
      totalStock,
      expired,
      expiringSoon,
      zeroStock,
    };
  }, [batches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Batches
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track medicine batches, stock quantities,
            prices, and expiry dates.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadBatches()
          }
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
            aria-label="Dismiss error"
            className="shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Batches
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.totalStock}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600">
            Expired
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {summary.expired}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Expiring ≤ 90 Days
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.expiringSoon}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Zero Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.zeroStock}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(event) =>
                setShowInactive(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />

            Show inactive
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Batch Inventory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredBatches.length} batch
                {filteredBatches.length === 1
                  ? ''
                  : 'es'} displayed
              </p>
            </div>

            <Boxes
              size={20}
              className="text-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-5 py-16">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                size={20}
                className="animate-spin"
              />
              Loading batches...
            </div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Boxes
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-800">
              {search
                ? 'No batches match your search.'
                : 'No batches found.'}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Try a different medicine or batch number.'
                : 'Receive stock to create your first batch.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Medicine
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Batch
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Stock
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Purchase
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Selling
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Manufacturing
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Expiry
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map(
                    (batch) => {
                      const expiry =
                        getExpiryStatus(
                          batch.expiryDate,
                        );

                      const stock =
                        getStockStatus(
                          batch.quantity,
                        );

                      const ExpiryIcon =
                        expiry.icon;

                      return (
                        <tr
                          key={batch.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {batch.medicine.name}
                              </p>

                              {batch.medicine.genericName && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    batch
                                      .medicine
                                      .genericName
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800">
                              {batch.batchNumber}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {batch.quantity}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${stock.className}`}
                              >
                                {stock.label}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {formatPrice(
                              batch.purchasePrice,
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {formatPrice(
                              batch.sellingPrice,
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {formatDate(
                              batch.manufacturingDate,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-slate-800">
                                {formatDate(
                                  batch.expiryDate,
                                )}
                              </p>

                              <span
                                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${expiry.className}`}
                              >
                                <ExpiryIcon
                                  size={12}
                                />
                                {expiry.label}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {batch.isActive ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredBatches.map(
                (batch) => {
                  const expiry =
                    getExpiryStatus(
                      batch.expiryDate,
                    );

                  const stock =
                    getStockStatus(
                      batch.quantity,
                    );

                  const ExpiryIcon =
                    expiry.icon;

                  return (
                    <div
                      key={batch.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {batch.medicine.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Batch:{' '}
                            <span className="font-medium text-slate-700">
                              {batch.batchNumber}
                            </span>
                          </p>
                        </div>

                        {batch.isActive ? (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Current Stock
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {batch.quantity}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${stock.className}`}
                          >
                            {stock.label}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Expiry
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {formatDate(
                              batch.expiryDate,
                            )}
                          </p>

                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${expiry.className}`}
                          >
                            <ExpiryIcon
                              size={12}
                            />
                            {expiry.label}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Purchase Price
                          </p>

                          <p className="mt-1 font-medium text-slate-800">
                            {formatPrice(
                              batch.purchasePrice,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Selling Price
                          </p>

                          <p className="mt-1 font-medium text-slate-800">
                            {formatPrice(
                              batch.sellingPrice,
                            )}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">
                            Manufacturing Date
                          </p>

                          <p className="mt-1 text-sm text-slate-800">
                            {formatDate(
                              batch.manufacturingDate,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}