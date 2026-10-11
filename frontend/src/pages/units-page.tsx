import { useEffect, useState } from 'react';
import { Pencil, Plus, Power, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/services/api';

type Unit = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    medicines: number;
  };
};

type UnitResponse = {
  success: boolean;
  data: Unit;
};

type UnitsResponse = {
  success: boolean;
  data: Unit[];
};

type UnitFormData = {
  name: string;
  description: string;
};

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    description: '',
  });

  async function loadUnits() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest<UnitsResponse>('/units');

      setUnits(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load units.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUnits();
  }, []);

  function openAddForm() {
    setEditingUnit(null);
    setFormData({
      name: '',
      description: '',
    });
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(unit: Unit) {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      description: unit.description ?? '',
    });
    setError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setIsFormOpen(false);
    setEditingUnit(null);
    setFormData({
      name: '',
      description: '',
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError('Unit name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingUnit) {
        await apiRequest<UnitResponse>(
          `/units/${editingUnit.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              name,
              description: description || null,
            }),
          },
        );
      } else {
        await apiRequest<UnitResponse>(
          '/units',
          {
            method: 'POST',
            body: JSON.stringify({
              name,
              description: description || null,
            }),
          },
        );
      }

      closeForm();
      await loadUnits();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save unit.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleUnit(unit: Unit) {
    const action = unit.isActive
      ? 'deactivate'
      : 'activate';

    const message = unit.isActive
      ? `Deactivate "${unit.name}"?`
      : `Activate "${unit.name}"?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      setError(null);

      await apiRequest<UnitResponse>(
        `/units/${unit.id}/${action}`,
        {
          method: 'PATCH',
        },
      );

      await loadUnits();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} unit.`,
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Units
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage medicine units used throughout your inventory.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadUnits()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
          >
            <Plus size={17} />
            Add Unit
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingUnit ? 'Edit Unit' : 'Add Unit'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingUnit
                ? 'Update the unit name or description.'
                : 'Create a new unit for medicines.'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="unit-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Unit Name
              </label>

              <input
                id="unit-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. carton"
                maxLength={100}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="unit-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <input
                id="unit-description"
                type="text"
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="e.g. Medicine carton"
                maxLength={500}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingUnit
                    ? 'Save Changes'
                    : 'Create Unit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading units...
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No units found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first medicine unit to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Unit
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medicines
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {units.map((unit) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-medium text-slate-900">
                        {unit.name}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {unit.description || '—'}
                    </td>

                    <td className="px-5 py-4 text-center text-sm text-slate-700">
                      {unit._count?.medicines ?? 0}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={
                          unit.isActive
                            ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                            : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'
                        }
                      >
                        {unit.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(unit)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void toggleUnit(unit)
                          }
                          className={
                            unit.isActive
                              ? 'inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50'
                              : 'inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50'
                          }
                        >
                          <Power size={15} />
                          {unit.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}