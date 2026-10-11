import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Tags,
  X,
} from 'lucide-react';
import { ApiError } from '@/services/api';
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from '@/services/category.service';
import type { Category } from '@/types/category';

type CategoryForm = {
  name: string;
  description: string;
};

const emptyForm: CategoryForm = {
  name: '',
  description: '',
};

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

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: (category: Category) => void;
}) {
  const [form, setForm] = useState<CategoryForm>(
    category
      ? {
          name: category.name,
          description: category.description ?? '',
        }
      : emptyForm,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = category !== null;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = isEditing
        ? await updateCategory(category.id, {
            name,
            description: description || null,
          })
        : await createCategory({
            name,
            description: description || null,
          });

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save category.');
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
      aria-labelledby="category-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="category-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing
                ? 'Edit Category'
                : 'Add Category'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Update this medicine category.'
                : 'Create a category for organizing medicines.'}
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

          <div>
            <label
              htmlFor="category-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Category name *
            </label>

            <input
              id="category-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              maxLength={100}
              required
              autoFocus
              placeholder="Painkillers"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="category-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              maxLength={500}
              rows={4}
              placeholder="Medicines used for pain relief..."
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
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
                : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [actionId, setActionId] = useState<string | null>(
    null,
  );

  async function loadCategories() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories(showInactive);
      setCategories(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load categories.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, [showInactive]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [
        category.name,
        category.description,
      ].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [categories, search]);

  function handleSaved(category: Category) {
    setCategories((current) => {
      const exists = current.some(
        (item) => item.id === category.id,
      );

      if (exists) {
        return current
          .map((item) =>
            item.id === category.id
              ? category
              : item,
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name),
          );
      }

      return [...current, category].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    });

    setIsModalOpen(false);
    setEditingCategory(null);
  }

  async function handleToggleActive(
    category: Category,
  ) {
    setActionId(category.id);
    setError(null);

    try {
      const updated = category.isActive
        ? await deactivateCategory(category.id)
        : await activateCategory(category.id);

      setCategories((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          `Failed to ${
            category.isActive
              ? 'deactivate'
              : 'activate'
          } category.`,
        );
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize medicines into manageable categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Plus size={18} />
          Add Category
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
              placeholder="Search categories..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) =>
                  setShowInactive(event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              Show inactive
            </label>

            <button
              type="button"
              onClick={() => void loadCategories()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading ? 'animate-spin' : ''
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
                Category List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredCategories.length} categor
                {filteredCategories.length === 1
                  ? 'y'
                  : 'ies'}{' '}
                displayed
              </p>
            </div>

            <Tags
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
              Loading categories...
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Tags
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-800">
              {search
                ? 'No categories match your search.'
                : 'No categories found.'}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Try another search term.'
                : 'Create your first category.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Description
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
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {category.name}
                          </p>
                        </td>

                        <td className="max-w-md px-5 py-4 text-slate-600">
                          {category.description ?? '—'}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            isActive={
                              category.isActive
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title="Edit category"
                              onClick={() => {
                                setEditingCategory(
                                  category,
                                );
                                setIsModalOpen(true);
                              }}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              title={
                                category.isActive
                                  ? 'Deactivate category'
                                  : 'Activate category'
                              }
                              disabled={
                                actionId ===
                                category.id
                              }
                              onClick={() =>
                                void handleToggleActive(
                                  category,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700 disabled:opacity-50"
                            >
                              {actionId ===
                              category.id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : category.isActive ? (
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
              {filteredCategories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {category.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {category.description ??
                            'No description'}
                        </p>
                      </div>

                      <StatusBadge
                        isActive={
                          category.isActive
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(
                            category,
                          );
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        <Edit3 size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionId === category.id
                        }
                        onClick={() =>
                          void handleToggleActive(
                            category,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        {actionId === category.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : category.isActive ? (
                          <X size={15} />
                        ) : (
                          <Check size={15} />
                        )}

                        {category.isActive
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

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}