
import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  PackagePlus,
  RefreshCw,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import { getMedicines } from '@/services/medicine.service';
import { createStockIn } from '@/services/stock-in.service';
import { getSuppliers } from '@/services/supplier.service';

import type { Medicine } from '@/types/medicine';
import type {
  StockInInput,
  StockInResult,
  StockInSupplier,
} from '@/types/stock-in';

type StockInFormState = {
  medicineId: string;
  supplierId: string;
  batchNumber: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: string;
  manufacturingDate: string;
  expiryDate: string;
  reference: string;
  notes: string;
};

const emptyForm: StockInFormState = {
  medicineId: '',
  supplierId: '',
  batchNumber: '',
  purchasePrice: '',
  sellingPrice: '',
  quantity: '',
  manufacturingDate: '',
  expiryDate: '',
  reference: '',
  notes: '',
};

function toIsoDateTime(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(
    today.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getFormError(
  form: StockInFormState,
): string | null {
  if (!form.medicineId) {
    return 'Please select a medicine.';
  }

  if (!form.supplierId) {
    return 'Please select a supplier.';
  }

  if (!form.batchNumber.trim()) {
    return 'Batch number is required.';
  }

  const purchasePrice = Number(
    form.purchasePrice,
  );

  if (
    !Number.isFinite(purchasePrice) ||
    purchasePrice < 0
  ) {
    return 'Purchase price must be a valid non-negative number.';
  }

  const sellingPrice = Number(
    form.sellingPrice,
  );

  if (
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0
  ) {
    return 'Selling price must be a valid non-negative number.';
  }

  const quantity = Number(form.quantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return 'Quantity must be a whole number greater than 0.';
  }

  if (!form.expiryDate) {
    return 'Expiry date is required.';
  }

  const expiryDate = new Date(
    `${form.expiryDate}T23:59:59`,
  );

  if (
    Number.isNaN(expiryDate.getTime()) ||
    expiryDate <= new Date()
  ) {
    return 'Expiry date must be in the future.';
  }

  if (form.manufacturingDate) {
    const manufacturingDate = new Date(
      `${form.manufacturingDate}T00:00:00`,
    );

    if (Number.isNaN(manufacturingDate.getTime())) {
      return 'Manufacturing date is invalid.';
    }

    if (manufacturingDate > expiryDate) {
      return 'Manufacturing date cannot be later than expiry date.';
    }
  }

  return null;
}

export function StockInPage() {
  const [medicines, setMedicines] = useState<
    Medicine[]
  >([]);

  const [suppliers, setSuppliers] = useState<
    StockInSupplier[]
  >([]);

  const [form, setForm] =
    useState<StockInFormState>(emptyForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successResult, setSuccessResult] =
    useState<StockInResult | null>(null);
    useEffect(() => {
    if (!successResult) {
        return;
    }

    const timeout = window.setTimeout(() => {
        setSuccessResult(null);
    }, 5000);

    return () => {
        window.clearTimeout(timeout);
    };
    }, [successResult]);
  async function loadData() {
    setIsLoading(true);
    setError(null);

    try {
      const [medicineData, supplierData] =
        await Promise.all([
          getMedicines(false),
          getSuppliers(false),
        ]);

      setMedicines(medicineData);
      setSuppliers(supplierData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load medicines and suppliers.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedMedicine = useMemo(
    () =>
      medicines.find(
        (medicine) =>
          medicine.id === form.medicineId,
      ) ?? null,
    [medicines, form.medicineId],
  );

  const selectedSupplier = useMemo(
    () =>
      suppliers.find(
        (supplier) =>
          supplier.id === form.supplierId,
      ) ?? null,
    [suppliers, form.supplierId],
  );

  function updateField(
    field: keyof StockInFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
    setSuccessResult(null);
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      expiryDate: '',
    });

    setError(null);
    setSuccessResult(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formError = getFormError(form);

    if (formError) {
      setError(formError);
      return;
    }

    const purchasePrice = Number(
      form.purchasePrice,
    );

    const sellingPrice = Number(
      form.sellingPrice,
    );

    const quantity = Number(form.quantity);

    const input: StockInInput = {
      medicineId: form.medicineId,
      supplierId: form.supplierId,
      batchNumber: form.batchNumber.trim(),
      purchasePrice,
      sellingPrice,
      quantity,
      manufacturingDate:
        form.manufacturingDate
          ? toIsoDateTime(
              form.manufacturingDate,
            )
          : null,
      expiryDate: toIsoDateTime(
        form.expiryDate,
      ),
      reference:
        form.reference.trim() || null,
      notes: form.notes.trim() || null,
    };

    setIsSubmitting(true);
    setError(null);
    setSuccessResult(null);

    try {
      const result =
        await createStockIn(input);

      setSuccessResult(result);

      setForm({
        ...emptyForm,
        medicineId: form.medicineId,
        supplierId: form.supplierId,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to process stock in.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Stock In
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Receive medicine stock and record batch details.
          </p>
        </div>

        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-16 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading medicines and suppliers...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Stock In
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Receive medicine stock, create batches, and update inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-red-500 hover:text-red-800"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successResult && selectedMedicine && (
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
                    Stock added successfully
                </h2>

                <button
                    type="button"
                    onClick={() => setSuccessResult(null)}
                    className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Dismiss success message"
                >
                    <X size={16} />
                </button>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                    {selectedMedicine.name}
                </span>{' '}
                — {successResult.receipt.quantity}{' '}
                {selectedMedicine.unitRelation?.name ?? 'unit'}{' '}
                added successfully.
                </p>

                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <div>
                    <span className="font-medium">
                    Batch:
                    </span>{' '}
                    {successResult.batch.batchNumber}
                </div>

                <div className="mt-1">
                    <span className="font-medium">
                    Previous quantity:
                    </span>{' '}
                    {successResult.transaction.previousQuantity}
                </div>

                <div className="mt-1">
                    <span className="font-medium">
                    New quantity:
                    </span>{' '}
                    {successResult.transaction.newQuantity}
                </div>
                </div>
            </div>
            </div>
        </div>
        )}

      {medicines.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">
            No active medicines available
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Create an active medicine before receiving stock.
          </p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">
            No active suppliers available
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Create an active supplier before receiving stock.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
                <PackagePlus size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Receive Stock
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the batch and receiving details below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5">
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Medicine & Supplier
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="stock-in-medicine"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Medicine *
                  </label>

                  <div className="relative">
                    <select
                      id="stock-in-medicine"
                      value={form.medicineId}
                      onChange={(event) =>
                        updateField(
                          'medicineId',
                          event.target.value,
                        )
                      }
                      disabled={isSubmitting}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                    >
                      <option value="">
                        Select medicine
                      </option>

                      {medicines.map(
                        (medicine) => (
                          <option
                            key={medicine.id}
                            value={medicine.id}
                          >
                            {medicine.name}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>

                  {selectedMedicine && (
                    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                      <span className="text-slate-500">
                        Unit:
                      </span>{' '}
                      <span className="font-semibold text-slate-800">
                        {selectedMedicine.unitRelation
                          ?.name ?? 'unit'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="stock-in-supplier"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Supplier *
                  </label>

                  <div className="relative">
                    <select
                      id="stock-in-supplier"
                      value={form.supplierId}
                      onChange={(event) =>
                        updateField(
                          'supplierId',
                          event.target.value,
                        )
                      }
                      disabled={isSubmitting}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                    >
                      <option value="">
                        Select supplier
                      </option>

                      {suppliers.map(
                        (supplier) => (
                          <option
                            key={supplier.id}
                            value={supplier.id}
                          >
                            {supplier.name}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>

                  {selectedSupplier && (
                    <p className="mt-2 text-xs text-slate-500">
                      {selectedSupplier.phone ??
                        selectedSupplier.email ??
                        'Supplier selected'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Batch & Pricing
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <label
                    htmlFor="stock-in-batch"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Batch number *
                  </label>

                  <input
                    id="stock-in-batch"
                    type="text"
                    value={form.batchNumber}
                    onChange={(event) =>
                      updateField(
                        'batchNumber',
                        event.target.value,
                      )
                    }
                    maxLength={100}
                    disabled={isSubmitting}
                    placeholder="e.g. PCM2026A"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock-in-purchase-price"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Purchase price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>

                    <input
                      id="stock-in-purchase-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.purchasePrice
                      }
                      onChange={(event) =>
                        updateField(
                          'purchasePrice',
                          event.target.value,
                        )
                      }
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock-in-selling-price"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Selling price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>

                    <input
                      id="stock-in-selling-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.sellingPrice
                      }
                      onChange={(event) =>
                        updateField(
                          'sellingPrice',
                          event.target.value,
                        )
                      }
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock-in-quantity"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Quantity *
                  </label>

                  <input
                    id="stock-in-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      updateField(
                        'quantity',
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />

                  {selectedMedicine && (
                    <p className="mt-1 text-xs text-slate-500">
                      Quantity in{' '}
                      {selectedMedicine.unitRelation
                        ?.name ?? 'unit'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Dates
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="stock-in-manufacturing-date"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Manufacturing date
                  </label>

                  <input
                    id="stock-in-manufacturing-date"
                    type="date"
                    value={
                      form.manufacturingDate
                    }
                    max={
                      form.expiryDate ||
                      undefined
                    }
                    onChange={(event) =>
                      updateField(
                        'manufacturingDate',
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock-in-expiry-date"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Expiry date *
                  </label>

                  <input
                    id="stock-in-expiry-date"
                    type="date"
                    value={form.expiryDate}
                    min={getTodayDate()}
                    onChange={(event) =>
                      updateField(
                        'expiryDate',
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Reference & Notes
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="stock-in-reference"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Reference
                  </label>

                  <input
                    id="stock-in-reference"
                    type="text"
                    value={form.reference}
                    onChange={(event) =>
                      updateField(
                        'reference',
                        event.target.value,
                      )
                    }
                    maxLength={200}
                    disabled={isSubmitting}
                    placeholder="Invoice or purchase reference"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock-in-notes"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="stock-in-notes"
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        'notes',
                        event.target.value,
                      )
                    }
                    maxLength={1000}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Additional receiving notes"
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <PackagePlus size={17} />
                  Receive Stock
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
