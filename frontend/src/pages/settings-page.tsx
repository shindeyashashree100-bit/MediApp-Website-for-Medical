import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Package,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  getSettings,
  updateSettings,
} from '@/services/settings.service';

import type { Settings } from '@/types/settings';

type FormState = {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  expiryWarningDays: string;
  expiryCriticalDays: string;
  timezone: string;
};

const DEFAULT_FORM: FormState = {
  storeName: '',
  storeAddress: '',
  storePhone: '',
  currency: 'INR',
  expiryWarningDays: '90',
  expiryCriticalDays: '30',
  timezone: 'Asia/Kolkata',
};

function settingsToForm(
  settings: Settings,
): FormState {
  return {
    storeName: settings.storeName ?? '',
    storeAddress:
      settings.storeAddress ?? '',
    storePhone:
      settings.storePhone ?? '',
    currency:
      settings.currency ?? 'INR',
    expiryWarningDays:
      String(
        settings.expiryWarningDays ?? 90,
      ),
    expiryCriticalDays:
      String(
        settings.expiryCriticalDays ?? 30,
      ),
    timezone:
      settings.timezone ??
      'Asia/Kolkata',
  };
}

export function SettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState<Settings | null>(
      null,
    );

  const [form, setForm] =
    useState<FormState>(
      DEFAULT_FORM,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [success, setSuccess] =
    useState<string | null>(
      null,
    );

  const [validationError, setValidationError] =
    useState<string | null>(
      null,
    );

  async function loadSettings() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setValidationError(null);

    try {
      const result =
        await getSettings();

      setSettings(result);

      setForm(
        settingsToForm(result),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Failed to load settings.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess(null);
    setValidationError(null);
  }

  function validateForm(): string | null {
    if (!form.storeName.trim()) {
      return 'Store name is required.';
    }

    if (
      form.currency.length !== 3 ||
      !/^[A-Z]{3}$/.test(
        form.currency,
      )
    ) {
      return 'Currency must be a 3-letter uppercase ISO code, for example INR.';
    }

    const warningDays =
      Number(
        form.expiryWarningDays,
      );

    const criticalDays =
      Number(
        form.expiryCriticalDays,
      );

    if (
      !Number.isInteger(
        warningDays,
      ) ||
      warningDays <= 0 ||
      warningDays > 3650
    ) {
      return 'Expiry warning days must be between 1 and 3650.';
    }

    if (
      !Number.isInteger(
        criticalDays,
      ) ||
      criticalDays <= 0 ||
      criticalDays > 3650
    ) {
      return 'Expiry critical days must be between 1 and 3650.';
    }

    if (
      warningDays <
      criticalDays
    ) {
      return 'Expiry warning days must be greater than or equal to expiry critical days.';
    }

    if (!form.timezone.trim()) {
      return 'Timezone is required.';
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const validation =
      validateForm();

    if (validation) {
      setValidationError(
        validation,
      );

      return;
    }

    setSaving(true);

    try {
      const updated =
        await updateSettings({
          storeName:
            form.storeName.trim(),

          storeAddress:
            form.storeAddress.trim()
              ? form.storeAddress.trim()
              : null,

          storePhone:
            form.storePhone.trim()
              ? form.storePhone.trim()
              : null,

          currency:
            form.currency
              .trim()
              .toUpperCase(),

          expiryWarningDays:
            Number(
              form.expiryWarningDays,
            ),

          expiryCriticalDays:
            Number(
              form.expiryCriticalDays,
            ),

          timezone:
            form.timezone.trim(),
        });

      setSettings(updated);

      setForm(
        settingsToForm(updated),
      );

      setSuccess(
        'Settings saved successfully.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Failed to save settings.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!settings) {
      return;
    }

    setForm(
      settingsToForm(settings),
    );

    setError(null);
    setValidationError(null);
    setSuccess(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <SettingsIcon className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Settings
            </h1>

            <p className="text-sm text-muted-foreground">
              Configure your medical store and inventory preferences.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadSettings()
          }
          disabled={
            loading ||
            saving
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />

          Reload
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <span>
            {success}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* Validation Message */}
      {validationError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>
            {validationError}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Store Information */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">
              Store Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Basic information about your medical store.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <FormField
              label="Store Name"
              required
            >
              <input
                type="text"
                value={
                  form.storeName
                }
                onChange={(event) =>
                  updateField(
                    'storeName',
                    event.target.value,
                  )
                }
                maxLength={200}
                placeholder="Medical Store"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                value={
                  form.storePhone
                }
                onChange={(event) =>
                  updateField(
                    'storePhone',
                    event.target.value,
                  )
                }
                maxLength={30}
                placeholder="Store phone number"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>

            <FormField
              label="Address"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.storeAddress
                }
                onChange={(event) =>
                  updateField(
                    'storeAddress',
                    event.target.value,
                  )
                }
                maxLength={500}
                rows={3}
                placeholder="Store address"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>
          </div>
        </section>

        {/* Regional Settings */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">
              Regional Settings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Currency and timezone used by the application.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <FormField
              label="Currency"
              required
              description="Use a 3-letter ISO currency code."
            >
              <input
                type="text"
                value={
                  form.currency
                }
                onChange={(event) =>
                  updateField(
                    'currency',
                    event.target.value.toUpperCase(),
                  )
                }
                maxLength={3}
                placeholder="INR"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
              />
            </FormField>

            <FormField
              label="Timezone"
              required
            >
              <input
                type="text"
                value={
                  form.timezone
                }
                onChange={(event) =>
                  updateField(
                    'timezone',
                    event.target.value,
                  )
                }
                maxLength={100}
                placeholder="Asia/Kolkata"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>
          </div>
        </section>

        {/* Inventory Alerts */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">
              Inventory Alerts
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure when medicines should be reported as approaching expiry.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <FormField
              label="Expiry Warning Days"
              required
              description="Batches within this number of days from expiry appear as expiring soon."
            >
              <input
                type="number"
                min={1}
                max={3650}
                step={1}
                value={
                  form.expiryWarningDays
                }
                onChange={(event) =>
                  updateField(
                    'expiryWarningDays',
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>

            <FormField
              label="Expiry Critical Days"
              required
              description="Critical expiry threshold used for your inventory configuration."
            >
              <input
                type="number"
                min={1}
                max={3650}
                step={1}
                value={
                  form.expiryCriticalDays
                }
                onChange={(event) =>
                  updateField(
                    'expiryCriticalDays',
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </FormField>
          </div>
        </section>

        {/* Master Data */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">
              Master Data
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage reusable data used throughout your medical store.
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-medium">
                    Units
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Manage medicine units such as
                    Tablet, Capsule, Bottle, Strip,
                    Box, and other measurement units.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/units')
                }
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Manage Units
              </button>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={
              handleReset
            }
            disabled={
              saving ||
              !settings
            }
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />

                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required = false,
  description,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      {children}

      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}