import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Truck,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';
import {
  activateSupplier,
  createSupplier,
  deactivateSupplier,
  getSuppliers,
  updateSupplier,
} from '@/services/supplier.service';

import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@/types/supplier';

type SupplierFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
};

const emptyForm: SupplierFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
};

function getSupplierForm(
  supplier: Supplier,
): SupplierFormState {
  return {
    name: supplier.name,
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    address: supplier.address ?? '',
    gstNumber: supplier.gstNumber ?? '',
  };
}

function toCreateInput(
  form: SupplierFormState,
): CreateSupplierInput {
  return {
    name: form.name.trim(),
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    gstNumber: form.gstNumber.trim() || null,
  };
}

function toUpdateInput(
  form: SupplierFormState,
): UpdateSupplierInput {
  return {
    name: form.name.trim(),
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    gstNumber: form.gstNumber.trim() || null,
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

function SupplierModal({
  supplier,
  onClose,
  onSaved,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: (supplier: Supplier) => void;
}) {
  const [form, setForm] = useState<SupplierFormState>(
    supplier
      ? getSupplierForm(supplier)
      : emptyForm,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const isEditing = supplier !== null;

  function updateField(
    field: keyof SupplierFormState,
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
      setError('Supplier name is required.');
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim(),
      )
    ) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = isEditing
        ? await updateSupplier(
            supplier.id,
            toUpdateInput(form),
          )
        : await createSupplier(
            toCreateInput(form),
          );

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save supplier.');
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
      aria-labelledby="supplier-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="supplier-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing
                ? 'Edit Supplier'
                : 'Add Supplier'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Update supplier information.'
                : 'Add a supplier to your inventory system.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
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
            <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="supplier-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Supplier name *
              </label>

              <input
                id="supplier-name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                maxLength={200}
                required
                placeholder="ABC Pharma Distributors"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="supplier-phone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>

              <input
                id="supplier-phone"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    'phone',
                    event.target.value,
                  )
                }
                maxLength={30}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="supplier-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="supplier-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    'email',
                    event.target.value,
                  )
                }
                maxLength={320}
                placeholder="supplier@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="supplier-gst"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                GST number
              </label>

              <input
                id="supplier-gst"
                value={form.gstNumber}
                onChange={(event) =>
                  updateField(
                    'gstNumber',
                    event.target.value,
                  )
                }
                maxLength={30}
                placeholder="27ABCDE1234F1Z5"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="supplier-address"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Address
              </label>

              <textarea
                id="supplier-address"
                value={form.address}
                onChange={(event) =>
                  updateField(
                    'address',
                    event.target.value,
                  )
                }
                maxLength={500}
                rows={4}
                placeholder="Supplier address..."
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
                : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<
    Supplier[]
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

  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null);

  const [actionId, setActionId] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage]);

  async function loadSuppliers() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getSuppliers(
        showInactive,
      );

      setSuppliers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load suppliers.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
  }, [showInactive]);

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      const values = [
        supplier.name,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.gstNumber,
      ];

      return values.some((value) =>
        value
          ?.toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [suppliers, search]);

  function handleSavedSupplier(
    supplier: Supplier,
  ) {
    const wasEditing = editingSupplier !== null;

    setSuppliers((current) => {
      const exists = current.some(
        (item) =>
          item.id === supplier.id,
      );

      if (exists) {
        return current
          .map((item) =>
            item.id === supplier.id
              ? supplier
              : item,
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name),
          );
      }

      return [...current, supplier].sort(
        (a, b) =>
          a.name.localeCompare(b.name),
      );
    });

    setIsFormOpen(false);
    setEditingSupplier(null);

    setSuccessMessage(
      wasEditing
        ? 'Supplier updated successfully.'
        : 'Supplier added successfully.',
    );
  }

  async function handleToggleActive(
    supplier: Supplier,
  ) {
    setActionId(supplier.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = supplier.isActive
        ? await deactivateSupplier(
            supplier.id,
          )
        : await activateSupplier(
            supplier.id,
          );

      setSuppliers((current) =>
        current
          .map((item) =>
            item.id === updated.id
              ? updated
              : item,
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
      );

      setSuccessMessage(
        supplier.isActive
          ? 'Supplier deactivated successfully.'
          : 'Supplier activated successfully.',
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          `Failed to ${
            supplier.isActive
              ? 'deactivate'
              : 'activate'
          } supplier.`,
        );
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="fixed right-5 top-5 z-[100] w-[min(420px,calc(100vw-2rem))] rounded-xl border border-emerald-200 bg-white p-4 shadow-xl ring-1 ring-emerald-100"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Check
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
                  className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage suppliers who provide medicines and
            inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSupplier(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Plus size={18} />
          Add Supplier
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
              placeholder="Search suppliers..."
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
              onClick={() =>
                void loadSuppliers()
              }
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
                Supplier List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSuppliers.length} supplier
                {filteredSuppliers.length === 1
                  ? ''
                  : 's'} displayed
              </p>
            </div>

            <Truck
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

              Loading suppliers...
            </div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Truck
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-800">
              {search
                ? 'No suppliers match your search.'
                : 'No suppliers found.'}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Try a different search term.'
                : 'Add your first supplier to begin.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Supplier
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Phone
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Email
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      GST Number
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
                  {filteredSuppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {supplier.name}
                            </p>

                            {supplier.address && (
                              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                {supplier.address}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {supplier.phone ?? '—'}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {supplier.email ?? '—'}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {supplier.gstNumber ?? '—'}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            isActive={
                              supplier.isActive
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title="Edit supplier"
                              onClick={() => {
                                setEditingSupplier(
                                  supplier,
                                );
                                setIsFormOpen(true);
                              }}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              title={
                                supplier.isActive
                                  ? 'Deactivate supplier'
                                  : 'Activate supplier'
                              }
                              disabled={
                                actionId ===
                                supplier.id
                              }
                              onClick={() =>
                                void handleToggleActive(
                                  supplier,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700 disabled:opacity-50"
                            >
                              {actionId ===
                              supplier.id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : supplier.isActive ? (
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
              {filteredSuppliers.map(
                (supplier) => (
                  <div
                    key={supplier.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {supplier.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {supplier.email ??
                            supplier.phone ??
                            'No contact information'}
                        </p>
                      </div>

                      <StatusBadge
                        isActive={
                          supplier.isActive
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Phone
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {supplier.phone ?? '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          GST number
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {supplier.gstNumber ?? '—'}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500">
                          Address
                        </p>

                        <p className="mt-1 text-slate-800">
                          {supplier.address ?? '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSupplier(
                            supplier,
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
                          supplier.id
                        }
                        onClick={() =>
                          void handleToggleActive(
                            supplier,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        {actionId ===
                        supplier.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : supplier.isActive ? (
                          <X size={15} />
                        ) : (
                          <Check size={15} />
                        )}

                        {supplier.isActive
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
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSupplier(null);
          }}
          onSaved={handleSavedSupplier}
        />
      )}
    </div>
  );
}