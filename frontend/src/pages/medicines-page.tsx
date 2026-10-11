import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import {
  activateMedicine,
  createMedicine,
  deactivateMedicine,
  getCategories,
  getMedicine,
  getMedicines,
  getUnits,
  updateMedicine,
} from '@/services/medicine.service';

import type {
  CreateMedicineInput,
  Medicine,
  MedicineCategory,
  MedicineDetail,
  MedicineUnit,
  UpdateMedicineInput,
} from '@/types/medicine';

type MedicineFormState = {
  name: string;
  genericName: string;
  brandName: string;
  sku: string;
  unitId: string;
  description: string;
  minimumStock: string;
  categoryId: string;
};

const emptyForm: MedicineFormState = {
  name: '',
  genericName: '',
  brandName: '',
  sku: '',
  unitId: '',
  description: '',
  minimumStock: '0',
  categoryId: '',
};

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

function getMedicineForm(
  medicine: Medicine,
): MedicineFormState {
  return {
    name: medicine.name,
    genericName: medicine.genericName ?? '',
    brandName: medicine.brandName ?? '',
    sku: medicine.sku ?? '',
    unitId: medicine.unitId,
    description: medicine.description ?? '',
    minimumStock: String(medicine.minimumStock),
    categoryId: medicine.categoryId,
  };
}

function toCreateInput(
  form: MedicineFormState,
): CreateMedicineInput {
  const minimumStock = Number(form.minimumStock);

  return {
    name: form.name.trim(),
    genericName: form.genericName.trim() || null,
    brandName: form.brandName.trim() || null,
    sku: form.sku.trim() || null,
    unitId: form.unitId,
    description: form.description.trim() || null,
    minimumStock: Number.isFinite(minimumStock)
      ? minimumStock
      : 0,
    categoryId: form.categoryId,
  };
}

function toUpdateInput(
  form: MedicineFormState,
): UpdateMedicineInput {
  const minimumStock = Number(form.minimumStock);

  return {
    name: form.name.trim(),
    genericName: form.genericName.trim() || null,
    brandName: form.brandName.trim() || null,
    sku: form.sku.trim() || null,
    unitId: form.unitId,
    description: form.description.trim() || null,
    minimumStock: Number.isFinite(minimumStock)
      ? minimumStock
      : 0,
    categoryId: form.categoryId,
  };
}

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Inactive
    </span>
  );
}

function MedicineModal({
  medicine,
  categories,
  units,
  onClose,
  onSaved,
}: {
  medicine: Medicine | null;
  categories: MedicineCategory[];
  units: MedicineUnit[];
  onClose: () => void;
  onSaved: (medicine: Medicine) => void;
}) {
  const [form, setForm] = useState<MedicineFormState>(
    medicine ? getMedicineForm(medicine) : emptyForm,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = medicine !== null;

  function updateField(
    field: keyof MedicineFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Medicine name is required.');
      return;
    }

    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!form.unitId) {
      setError('Please select a unit.');
      return;
    }

    const minimumStock = Number(form.minimumStock);

    if (
      !Number.isInteger(minimumStock) ||
      minimumStock < 0
    ) {
      setError(
        'Minimum stock must be a whole number greater than or equal to 0.',
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = isEditing
        ? await updateMedicine(
            medicine.id,
            toUpdateInput(form),
          )
        : await createMedicine(
            toCreateInput(form),
          );

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save medicine.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="medicine-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing
                ? 'Edit Medicine'
                : 'Add Medicine'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Update the medicine catalogue information.'
                : 'Add a new medicine to your catalogue.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="medicine-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Medicine name *
              </label>

              <input
                id="medicine-name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                maxLength={200}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Paracetamol 500mg"
              />
            </div>

            <div>
              <label
                htmlFor="generic-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Generic name
              </label>

              <input
                id="generic-name"
                value={form.genericName}
                onChange={(event) =>
                  updateField(
                    'genericName',
                    event.target.value,
                  )
                }
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Paracetamol"
              />
            </div>

            <div>
              <label
                htmlFor="brand-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Brand name
              </label>

              <input
                id="brand-name"
                value={form.brandName}
                onChange={(event) =>
                  updateField(
                    'brandName',
                    event.target.value,
                  )
                }
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Crocin"
              />
            </div>

            <div>
              <label
                htmlFor="medicine-sku"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                SKU
              </label>

              <input
                id="medicine-sku"
                value={form.sku}
                onChange={(event) =>
                  updateField(
                    'sku',
                    event.target.value,
                  )
                }
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="PCM500-CROCIN"
              />

              <p className="mt-1 text-xs text-slate-500">
                Letters, numbers, dots, underscores and hyphens.
              </p>
            </div>

            <div>
              <label
                htmlFor="medicine-category"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Category *
              </label>

              <div className="relative">
                <select
                  id="medicine-category"
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      'categoryId',
                      event.target.value,
                    )
                  }
                  required
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories
                    .filter(
                      (category) => category.isActive,
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="medicine-unit"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Unit *
              </label>

              <div className="relative">
                <select
                  id="medicine-unit"
                  value={form.unitId}
                  onChange={(event) =>
                    updateField(
                      'unitId',
                      event.target.value,
                    )
                  }
                  required
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">
                    Select unit
                  </option>

                  {units
                    .filter(
                      (unit) => unit.isActive,
                    )
                    .map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.name}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>

              {units.filter(
                (unit) => unit.isActive,
              ).length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No active units available. Create a unit first.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="minimum-stock"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Minimum stock
              </label>

              <input
                id="minimum-stock"
                type="number"
                min="0"
                step="1"
                value={form.minimumStock}
                onChange={(event) =>
                  updateField(
                    'minimumStock',
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="medicine-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="medicine-description"
                value={form.description}
                onChange={(event) =>
                  updateField(
                    'description',
                    event.target.value,
                  )
                }
                maxLength={1000}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Medicine description..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {isEditing
                ? 'Save Changes'
                : 'Create Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicineDetailsModal({
  medicine,
  onClose,
}: {
  medicine: MedicineDetail;
  onClose: () => void;
}) {
  const totalStock = medicine.batches.reduce(
    (total, batch) => total + batch.quantity,
    0,
  );

  const unitName =
    medicine.unitRelation?.name ?? '—';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-details-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="medicine-details-title"
              className="text-lg font-semibold text-slate-900"
            >
              {medicine.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Medicine and batch details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Category
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {medicine.category.name}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                SKU
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {medicine.sku ?? '—'}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Minimum stock
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {medicine.minimumStock}{' '}
                {unitName}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Current stock
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {totalStock} {unitName}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">
              Medicine Information
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Generic name
                </p>

                <p className="mt-1 text-sm text-slate-800">
                  {medicine.genericName ?? '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Brand name
                </p>

                <p className="mt-1 text-sm text-slate-800">
                  {medicine.brandName ?? '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Unit
                </p>

                <p className="mt-1 text-sm text-slate-800">
                  {unitName}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">
                  Description
                </p>

                <p className="mt-1 text-sm text-slate-800">
                  {medicine.description ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Batches
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Ordered by expiry date.
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {medicine.batches.length} batch
                {medicine.batches.length === 1
                  ? ''
                  : 'es'}
              </span>
            </div>

            {medicine.batches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 px-5 py-8 text-center">
                <Package
                  size={28}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-sm font-medium text-slate-700">
                  No active batches
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        Batch
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Purchase
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Selling
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Quantity
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Expiry
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {medicine.batches.map(
                      (batch) => (
                        <tr key={batch.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {batch.batchNumber}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            ₹{batch.purchasePrice}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            ₹{batch.sellingPrice}
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {batch.quantity}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(
                              batch.expiryDate,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MedicinesPage() {
  const [medicines, setMedicines] = useState<
    Medicine[]
  >([]);

  const [categories, setCategories] = useState<
    MedicineCategory[]
  >([]);

  const [units, setUnits] = useState<
    MedicineUnit[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingMedicine, setEditingMedicine] =
    useState<Medicine | null>(null);

  const [detailsMedicine, setDetailsMedicine] =
    useState<MedicineDetail | null>(null);

  const [isLoadingDetails, setIsLoadingDetails] =
    useState(false);

  const [actionId, setActionId] = useState<
    string | null
  >(null);

  async function loadData() {
    setIsLoading(true);
    setError(null);

    try {
      const [
        medicineData,
        categoryData,
        unitData,
      ] = await Promise.all([
        getMedicines(showInactive),
        getCategories(),
        getUnits(),
      ]);

      setMedicines(medicineData);
      setCategories(categoryData);
      setUnits(unitData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load medicines.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [showInactive]);

  const filteredMedicines = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const values = [
        medicine.name,
        medicine.genericName,
        medicine.brandName,
        medicine.sku,
        medicine.category?.name,
        medicine.unitRelation?.name,
      ];

      return values.some((value) =>
        value
          ?.toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [medicines, search]);

  async function handleViewDetails(
    medicine: Medicine,
  ) {
    setIsLoadingDetails(true);
    setError(null);

    try {
      const details = await getMedicine(
        medicine.id,
      );

      setDetailsMedicine(details);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load medicine details.',
        );
      }
    } finally {
      setIsLoadingDetails(false);
    }
  }

  async function handleToggleActive(
    medicine: Medicine,
  ) {
    setActionId(medicine.id);
    setError(null);

    try {
      const updated = medicine.isActive
        ? await deactivateMedicine(
            medicine.id,
          )
        : await activateMedicine(
            medicine.id,
          );

      setMedicines((current) =>
        current.map((item) =>
          item.id === updated.id
            ? {
                ...updated,
                currentStock:
                  medicine.currentStock,
              }
            : item,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          `Failed to ${
            medicine.isActive
              ? 'deactivate'
              : 'activate'
          } medicine.`,
        );
      }
    } finally {
      setActionId(null);
    }
  }

  function handleSavedMedicine(
    savedMedicine: Medicine,
  ) {
    setMedicines((current) => {
      const exists = current.some(
        (item) =>
          item.id === savedMedicine.id,
      );

      if (exists) {
        return current.map((item) =>
          item.id === savedMedicine.id
            ? {
                ...savedMedicine,
                currentStock:
                  item.currentStock,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...savedMedicine,
          currentStock: 0,
        },
      ].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    });

    setIsFormOpen(false);
    setEditingMedicine(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medicines
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your medicine catalogue and active
            inventory items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMedicine(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              placeholder="Search medicines..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Medicine Catalogue
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredMedicines.length} medicine
                {filteredMedicines.length === 1
                  ? ''
                  : 's'}{' '}
                displayed
              </p>
            </div>

            <Package
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

              Loading medicines...
            </div>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Package
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-800">
              {search
                ? 'No medicines match your search.'
                : 'No medicines found.'}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Try a different search term.'
                : 'Add your first medicine to begin.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Medicine
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      SKU
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Unit
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Current Stock
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Min Stock
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map(
                    (medicine) => (
                      <tr
                        key={medicine.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {medicine.name}
                            </p>

                            {(medicine.genericName ||
                              medicine.brandName) && (
                              <p className="mt-1 text-xs text-slate-500">
                                {[
                                  medicine.genericName,
                                  medicine.brandName,
                                ]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {medicine.sku ?? '—'}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {medicine.category?.name ??
                            '—'}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {medicine.unitRelation
                            ?.name ?? '—'}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {medicine.currentStock}
                          </div>

                          <div className="text-xs text-slate-500">
                            {medicine.unitRelation
                              ?.name ?? 'unit'}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-800">
                          {medicine.minimumStock}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            isActive={
                              medicine.isActive
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title="View details"
                              onClick={() =>
                                void handleViewDetails(
                                  medicine,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              title="Edit medicine"
                              onClick={() => {
                                setEditingMedicine(
                                  medicine,
                                );
                                setIsFormOpen(
                                  true,
                                );
                              }}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              title={
                                medicine.isActive
                                  ? 'Deactivate medicine'
                                  : 'Activate medicine'
                              }
                              disabled={
                                actionId ===
                                medicine.id
                              }
                              onClick={() =>
                                void handleToggleActive(
                                  medicine,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700 disabled:opacity-50"
                            >
                              {actionId ===
                              medicine.id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : medicine.isActive ? (
                                <X size={17} />
                              ) : (
                                <Check size={17} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredMedicines.map(
                (medicine) => (
                  <div
                    key={medicine.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {medicine.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {medicine.sku ??
                            'No SKU'}
                        </p>
                      </div>

                      <StatusBadge
                        isActive={
                          medicine.isActive
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">
                          Category
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {medicine.category
                            ?.name ?? '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Current stock
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {medicine.currentStock}{' '}
                          <span className="font-normal text-slate-500">
                            {medicine.unitRelation
                              ?.name ?? ''}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Minimum stock
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {medicine.minimumStock}{' '}
                          {medicine.unitRelation
                            ?.name ?? ''}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Unit
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {medicine.unitRelation
                            ?.name ?? '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void handleViewDetails(
                            medicine,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        <Eye size={15} />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingMedicine(
                            medicine,
                          );
                          setIsFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        <Edit3 size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionId ===
                          medicine.id
                        }
                        onClick={() =>
                          void handleToggleActive(
                            medicine,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        {actionId ===
                        medicine.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : medicine.isActive ? (
                          <X size={15} />
                        ) : (
                          <Check size={15} />
                        )}

                        {medicine.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>

      {isFormOpen && (
        <MedicineModal
          medicine={editingMedicine}
          categories={categories}
          units={units}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMedicine(null);
          }}
          onSaved={handleSavedMedicine}
        />
      )}

      {isLoadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30">
          <div className="rounded-xl bg-white px-5 py-4 shadow-xl">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Loader2
                size={20}
                className="animate-spin text-teal-700"
              />
              Loading medicine details...
            </div>
          </div>
        </div>
      )}

      {detailsMedicine &&
        !isLoadingDetails && (
          <MedicineDetailsModal
            medicine={detailsMedicine}
            onClose={() =>
              setDetailsMedicine(null)
            }
          />
        )}
    </div>
  );
}