import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PackageMinus,
  RefreshCw,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import { getMedicines } from '@/services/medicine.service';
import { getMedicineBatches } from '@/services/medicine.service';
import { stockOut } from '@/services/stock-out.service';

import type {
  Medicine,
  MedicineBatch,
} from '@/types/medicine';

export function StockOutPage() {
  const [medicines, setMedicines] = useState<
    Medicine[]
  >([]);

  const [batches, setBatches] = useState<
    MedicineBatch[]
  >([]);

  const [medicineId, setMedicineId] =
    useState('');

  const [batchId, setBatchId] =
    useState('');

  const [quantity, setQuantity] =
    useState('');

  const [reference, setReference] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [isLoadingMedicines, setIsLoadingMedicines] =
    useState(true);

  const [isLoadingBatches, setIsLoadingBatches] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  async function loadMedicines() {
    setIsLoadingMedicines(true);
    setError(null);

    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load medicines.');
      }
    } finally {
      setIsLoadingMedicines(false);
    }
  }

  async function loadBatches(
    selectedMedicineId: string,
  ) {
    if (!selectedMedicineId) {
      setBatches([]);
      setBatchId('');
      return;
    }

    setIsLoadingBatches(true);
    setError(null);
    setBatchId('');

    try {
      const result =
        await getMedicineBatches(
          selectedMedicineId,
        );

      setBatches(result.batches);
    } catch (err) {
      setBatches([]);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load batches.');
      }
    } finally {
      setIsLoadingBatches(false);
    }
  }

  useEffect(() => {
    void loadMedicines();
  }, []);

  useEffect(() => {
    void loadBatches(medicineId);
  }, [medicineId]);

  const selectedBatch = batches.find(
    (batch) => batch.id === batchId,
  );

  function resetForm() {
    setMedicineId('');
    setBatchId('');
    setBatches([]);
    setQuantity('');
    setReference('');
    setNotes('');
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    if (!medicineId) {
      setError('Please select a medicine.');
      return;
    }

    if (!batchId) {
      setError('Please select a batch.');
      return;
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isInteger(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setError(
        'Quantity must be a positive whole number.',
      );
      return;
    }

    if (
      selectedBatch &&
      numericQuantity >
        selectedBatch.quantity
    ) {
      setError(
        `Only ${selectedBatch.quantity} units are available in the selected batch.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await stockOut({
        medicineId,
        batchId,
        quantity: numericQuantity,
        reference:
          reference.trim() || null,
        notes: notes.trim() || null,
      });

      setSuccessMessage(
        `Stock out successful. ${numericQuantity} unit${
          numericQuantity === 1 ? '' : 's'
        } removed from batch ${
          selectedBatch?.batchNumber ?? ''
        }. Remaining stock: ${
          result.batch.quantity
        }.`,
      );

      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to process stock out.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <PackageMinus
                size={22}
                className="text-slate-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Stock Out
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Remove stock from a specific medicine
                batch.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccessMessage(null);
            void loadMedicines();
          }}
          disabled={
            isLoadingMedicines ||
            isSubmitting
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              isLoadingMedicines
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Stock Out Successful
            </p>

            <p className="mt-1">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Stock Out Failed
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Remove Inventory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the medicine and batch from which
            stock should be removed.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Medicine
                <span className="text-red-500">
                  {' '}
                  *
                </span>
              </label>

              <select
                value={medicineId}
                onChange={(event) =>
                  setMedicineId(
                    event.target.value,
                  )
                }
                disabled={
                  isLoadingMedicines ||
                  isSubmitting
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              >
                <option value="">
                  {isLoadingMedicines
                    ? 'Loading medicines...'
                    : 'Select medicine'}
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Batch
                <span className="text-red-500">
                  {' '}
                  *
                </span>
              </label>

              <select
                value={batchId}
                onChange={(event) =>
                  setBatchId(
                    event.target.value,
                  )
                }
                disabled={
                  !medicineId ||
                  isLoadingBatches ||
                  isSubmitting
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              >
                <option value="">
                  {isLoadingBatches
                    ? 'Loading batches...'
                    : !medicineId
                      ? 'Select medicine first'
                      : batches.length === 0
                        ? 'No available batches'
                        : 'Select batch'}
                </option>

                {batches.map(
                  (batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.batchNumber} — Stock:{' '}
                      {batch.quantity}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {selectedBatch && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Available Stock
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {selectedBatch.quantity}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selling Price
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    ₹
                    {Number(
                      selectedBatch.sellingPrice,
                    ).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Expiry Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {new Intl.DateTimeFormat(
                      'en-IN',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    ).format(
                      new Date(
                        selectedBatch.expiryDate,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Quantity
              <span className="text-red-500">
                {' '}
                *
              </span>
            </label>

            <input
              type="number"
              min="1"
              max={
                selectedBatch?.quantity ??
                undefined
              }
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value,
                )
              }
              disabled={
                !selectedBatch ||
                isSubmitting
              }
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            />

            {selectedBatch && (
              <p className="mt-1.5 text-xs text-slate-500">
                Maximum available quantity:{' '}
                {selectedBatch.quantity}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reference
            </label>

            <input
              type="text"
              value={reference}
              onChange={(event) =>
                setReference(
                  event.target.value,
                )
              }
              disabled={isSubmitting}
              maxLength={200}
              placeholder="e.g. Damaged stock, internal use, manual issue..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              disabled={isSubmitting}
              maxLength={1000}
              rows={4}
              placeholder="Optional notes..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingMedicines ||
                !medicineId ||
                !batchId ||
                !quantity
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <PackageMinus
                    size={17}
                  />
                  Stock Out
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}