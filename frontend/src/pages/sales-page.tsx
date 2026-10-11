import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { ApiError } from '@/services/api';

import {
  createSale,
  getSales,
  getSale,
} from '@/services/sale.service';

import {
  getMedicineBatches,
  getMedicines,
} from '@/services/medicine.service';

import type {
  Medicine,
  MedicineBatch,
} from '@/types/medicine';

import type {
  PaymentMethod,
  Sale,
  SaleItemInput,
} from '@/types/sale';

type SaleDraftItem = SaleItemInput & {
  medicineName: string;
  batchNumber: string;
  availableQuantity: number;
};

function formatCurrency(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function paymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case 'CASH':
      return 'Cash';

    case 'UPI':
      return 'UPI';

    case 'CARD':
      return 'Card';

    case 'OTHER':
      return 'Other';

    default:
      return paymentMethod;
  }
}

export function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [batches, setBatches] = useState<MedicineBatch[]>([]);

  const [selectedMedicineId, setSelectedMedicineId] =
    useState('');

  const [selectedBatchId, setSelectedBatchId] =
    useState('');

  const [quantity, setQuantity] = useState('');

  const [items, setItems] = useState<SaleDraftItem[]>([]);

  const [discount, setDiscount] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('CASH');

  const [customerName, setCustomerName] =
    useState('');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [notes, setNotes] = useState('');

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

  const [completedSale, setCompletedSale] =
    useState<Sale | null>(null);

  /*
   * Searchable medicine dropdown
   */
  const [medicineSearch, setMedicineSearch] =
    useState('');

  const [isMedicineDropdownOpen, setIsMedicineDropdownOpen] =
    useState(false);

  const medicineDropdownRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Sale selected from Sales History for
   * viewing its receipt.
   */
  const [receiptSale, setReceiptSale] =
    useState<Sale | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);

  const [salesPage, setSalesPage] =
    useState(1);

  const [salesPagination, setSalesPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });

  const [salesSearch, setSalesSearch] =
    useState('');

  const [salesPaymentFilter, setSalesPaymentFilter] =
    useState('');

  const [isLoadingSales, setIsLoadingSales] =
    useState(true);

  const selectedBatch = batches.find(
    (batch) =>
      batch.id === selectedBatchId,
  );

  const selectedMedicine = medicines.find(
    (medicine) =>
      medicine.id === selectedMedicineId,
  );

  /*
   * Medicines displayed in the searchable
   * dropdown.
   *
   * Search fields:
   * - name
   * - generic name
   * - brand name
   * - SKU
   */
  const filteredMedicines = useMemo(() => {
    const search = medicineSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const values = [
        medicine.name,
        medicine.genericName,
        medicine.brandName,
        medicine.sku,
      ];

      return values.some(
        (value) =>
          value
            ?.toLowerCase()
            .includes(search),
      );
    });
  }, [
    medicines,
    medicineSearch,
  ]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        item.quantity * item.unitPrice,
      0,
    );
  }, [items]);

  const discountPercent = Math.min(
    100,
    Math.max(0, Number(discount) || 0),
  );

  const discountAmount = Number(
    ((subtotal * discountPercent) / 100).toFixed(2),
  );

  const totalAmount = Math.max(
    0,
    subtotal - discountAmount,
  );

  async function loadMedicines() {
    setIsLoadingMedicines(true);

    try {
      const data = await getMedicines();

      setMedicines(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load medicines.',
        );
      }
    } finally {
      setIsLoadingMedicines(false);
    }
  }

  async function loadBatches(
    medicineId: string,
  ) {
    if (!medicineId) {
      setBatches([]);
      setSelectedBatchId('');
      return;
    }

    setIsLoadingBatches(true);
    setSelectedBatchId('');
    setBatches([]);

    try {
      const result =
        await getMedicineBatches(
          medicineId,
        );

      setBatches(result.batches);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load medicine batches.',
        );
      }
    } finally {
      setIsLoadingBatches(false);
    }
  }

  async function loadSales(
    page = salesPage,
  ) {
    setIsLoadingSales(true);

    try {
      const result = await getSales(
        page,
        10,
        salesSearch,
        salesPaymentFilter || undefined,
      );

      setSales(result.data);

      setSalesPagination(
        result.pagination,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to load sales history.',
        );
      }
    } finally {
      setIsLoadingSales(false);
    }
  }

  useEffect(() => {
    void loadMedicines();
  }, []);

  useEffect(() => {
    void loadSales(1);
  }, []);

  useEffect(() => {
    void loadBatches(
      selectedMedicineId,
    );
  }, [selectedMedicineId]);

  /*
   * Close medicine dropdown when clicking
   * outside the component.
   */
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        medicineDropdownRef.current &&
        !medicineDropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsMedicineDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  function selectMedicine(
    medicine: Medicine,
  ) {
    setSelectedMedicineId(
      medicine.id,
    );

    setMedicineSearch(
      medicine.name,
    );

    setIsMedicineDropdownOpen(false);

    setError(null);
  }

  function clearMedicineSelection() {
    setSelectedMedicineId('');
    setSelectedBatchId('');
    setQuantity('');
    setBatches([]);
    setMedicineSearch('');
    setIsMedicineDropdownOpen(false);
  }

  function clearCurrentItem() {
    clearMedicineSelection();
  }

  function addItem() {
    setError(null);
    setSuccessMessage(null);
    setCompletedSale(null);

    if (!selectedMedicine) {
      setError(
        'Please select a medicine.',
      );

      return;
    }

    if (!selectedBatch) {
      setError(
        'Please select a batch.',
      );

      return;
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        numericQuantity,
      ) ||
      numericQuantity <= 0
    ) {
      setError(
        'Quantity must be a positive whole number.',
      );

      return;
    }

    if (
      numericQuantity >
      selectedBatch.quantity
    ) {
      setError(
        `Only ${selectedBatch.quantity} units are available in this batch.`,
      );

      return;
    }

    const alreadyAdded = items.some(
      (item) =>
        item.medicineId ===
          selectedMedicine.id &&
        item.batchId ===
          selectedBatch.id,
    );

    if (alreadyAdded) {
      setError(
        'This medicine and batch are already in the sale.',
      );

      return;
    }

    setItems((current) => [
      ...current,
      {
        medicineId:
          selectedMedicine.id,
        batchId: selectedBatch.id,
        quantity: numericQuantity,
        unitPrice: Number(
          selectedBatch.sellingPrice,
        ),
        medicineName:
          selectedMedicine.name,
        batchNumber:
          selectedBatch.batchNumber,
        availableQuantity:
          selectedBatch.quantity,
      },
    ]);

    clearCurrentItem();
  }

  function removeItem(
    medicineId: string,
    batchId: string,
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          !(
            item.medicineId ===
              medicineId &&
            item.batchId === batchId
          ),
      ),
    );
  }

  function clearSaleForm() {
    setItems([]);
    setDiscount('');
    setPaymentMethod('CASH');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    clearCurrentItem();
    setError(null);
  }

  function printReceipt(sale: Sale) {
    const printWindow = window.open(
      '',
      '_blank',
      'width=800,height=900',
    );

    if (!printWindow) {
      alert(
        'Unable to open the receipt window. Please allow pop-ups for this site.',
      );
      return;
    }

    const formatMoney = (
      value: string | number,
    ) => {
      const amount =
        typeof value === 'number'
          ? value
          : Number(value);

      return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (
      value: string,
    ) => {
      const date = new Date(value);

      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    const paymentMethodLabels: Record<
      Sale['paymentMethod'],
      string
    > = {
      CASH: 'Cash',
      UPI: 'UPI',
      CARD: 'Card',
      OTHER: 'Other',
    };

    const itemsHtml = sale.items
      .map(
        (item, index) => `
          <tr>
            <td class="center">${index + 1}</td>

            <td>
              <strong>
                ${escapeHtml(item.medicine.name)}
              </strong>

              ${
                item.medicine.genericName
                  ? `
                    <div class="muted">
                      ${escapeHtml(
                        item.medicine.genericName,
                      )}
                    </div>
                  `
                  : ''
              }
            </td>

            <td>
              ${escapeHtml(item.batch.batchNumber)}
            </td>

            <td class="center">
              ${item.quantity}
            </td>

            <td class="right">
              ${formatMoney(item.unitPrice)}
            </td>

            <td class="right">
              ${formatMoney(item.totalPrice)}
            </td>
          </tr>
        `,
      )
      .join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Receipt ${escapeHtml(
              sale.receiptNumber,
            )}
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              background: #ffffff;
              color: #111827;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              font-size: 14px;
            }

            .receipt {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              margin-bottom: 25px;
            }

            .store-name {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .store-subtitle {
              color: #6b7280;
              font-size: 13px;
            }

            .title {
              font-size: 20px;
              font-weight: 700;
              margin-top: 18px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 30px;
              padding: 15px 0;
              border-top: 1px solid #d1d5db;
              border-bottom: 1px solid #d1d5db;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              gap: 10px;
            }

            .label {
              color: #6b7280;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #f3f4f6;
              border-top: 1px solid #d1d5db;
              border-bottom: 1px solid #d1d5db;
              padding: 10px 8px;
              text-align: left;
              font-size: 12px;
            }

            td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .muted {
              color: #6b7280;
              font-size: 11px;
              margin-top: 3px;
            }

            .summary {
              width: 320px;
              margin-left: auto;
              margin-top: 20px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
            }

            .total {
              font-size: 18px;
              font-weight: 700;
              border-top: 2px solid #111827;
              margin-top: 8px;
              padding-top: 10px;
            }

            .footer {
              text-align: center;
              margin-top: 35px;
              padding-top: 20px;
              border-top: 1px solid #d1d5db;
              color: #6b7280;
              font-size: 12px;
            }

            .customer {
              margin-top: 15px;
            }

            @media print {
              body {
                padding: 0;
              }

              .receipt {
                max-width: none;
              }

              @page {
                size: A4;
                margin: 15mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">

            <div class="header">
              <div class="store-name">
                Medical Inventory
              </div>

              <div class="store-subtitle">
                Medical Store
              </div>

              <div class="title">
                SALES RECEIPT
              </div>
            </div>

            <div class="info-grid">

              <div class="info-row">
                <span class="label">
                  Receipt No.
                </span>

                <strong>
                  ${escapeHtml(
                    sale.receiptNumber,
                  )}
                </strong>
              </div>

              <div class="info-row">
                <span class="label">
                  Date
                </span>

                <strong>
                  ${formatDate(sale.saleDate)}
                </strong>
              </div>

              <div class="info-row">
                <span class="label">
                  Payment
                </span>

                <strong>
                  ${
                    paymentMethodLabels[
                      sale.paymentMethod
                    ]
                  }
                </strong>
              </div>

              <div class="info-row">
                <span class="label">
                  Items
                </span>

                <strong>
                  ${sale.items.length}
                </strong>
              </div>

            </div>

            ${
              sale.customerName ||
              sale.customerPhone
                ? `
                  <div class="customer">
                    ${
                      sale.customerName
                        ? `
                          <strong>
                            Customer:
                          </strong>
                          ${escapeHtml(
                            sale.customerName,
                          )}
                        `
                        : ''
                    }

                    ${
                      sale.customerPhone
                        ? `
                          ${
                            sale.customerName
                              ? ' &nbsp; | &nbsp; '
                              : ''
                          }

                          <strong>
                            Phone:
                          </strong>

                          ${escapeHtml(
                            sale.customerPhone,
                          )}
                        `
                        : ''
                    }
                  </div>
                `
                : ''
            }

            <table>
              <thead>
                <tr>
                  <th class="center">
                    #
                  </th>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Batch
                  </th>

                  <th class="center">
                    Qty
                  </th>

                  <th class="right">
                    Price
                  </th>

                  <th class="right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">

              <div class="summary-row">
                <span>
                  Subtotal
                </span>

                <span>
                  ${formatMoney(
                    sale.subtotal,
                  )}
                </span>
              </div>

              <div class="summary-row">
                <span>
                  Discount
                </span>

                <span>
                  ${formatMoney(
                    sale.discount,
                  )}
                </span>
              </div>

              <div class="summary-row total">
                <span>
                  Total
                </span>

                <span>
                  ${formatMoney(
                    sale.totalAmount,
                  )}
                </span>
              </div>

            </div>

            ${
              sale.notes
                ? `
                  <div
                    style="
                      margin-top: 20px;
                      padding: 12px;
                      background: #f9fafb;
                      border: 1px solid #e5e7eb;
                    "
                  >
                    <strong>
                      Notes:
                    </strong>

                    ${escapeHtml(
                      sale.notes,
                    )}
                  </div>
                `
                : ''
            }

            <div class="footer">
              <div>
                Thank you for your purchase.
              </div>

              <div style="margin-top: 5px;">
                This is a computer-generated receipt.
              </div>
            </div>

          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  function escapeHtml(
    value: string | null | undefined,
  ): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function viewReceipt(sale: Sale) {
    setReceiptSale(sale);
  }

  async function handleCompleteSale(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setCompletedSale(null);

    if (items.length === 0) {
      setError(
        'Add at least one item to the sale.',
      );

      return;
    }

    if (
      discountAmount > subtotal
    ) {
      setError(
        'Discount cannot be greater than the sale subtotal.',
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const sale = await createSale({
        discount: discountAmount,
        paymentMethod,
        customerName:
          customerName.trim() || null,
        customerPhone:
          customerPhone.trim() || null,
        notes:
          notes.trim() || null,
        items: items.map((item) => ({
          medicineId:
            item.medicineId,
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      setCompletedSale(sale);

      setSuccessMessage(
        `Sale completed successfully. Receipt ${sale.receiptNumber}. Total ${formatCurrency(
          Number(sale.totalAmount),
        )}.`,
      );

      clearSaleForm();

      await loadSales(1);

      setSalesPage(1);

      await loadMedicines();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Failed to complete sale.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeSalesPage(
    page: number,
  ) {
    if (
      page < 1 ||
      page >
        salesPagination.totalPages
    ) {
      return;
    }

    setSalesPage(page);

    void loadSales(page);
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-slate-100 p-2">
            <ReceiptText
              size={22}
              className="text-slate-700"
            />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Sales
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create sales and manage customer
              receipts.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);

            void loadMedicines();

            void loadSales(
              salesPage,
            );
          }}
          disabled={
            isLoadingMedicines ||
            isLoadingSales
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              isLoadingMedicines ||
              isLoadingSales
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>

      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && completedSale && (
        <div className="flex flex-col gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Sale Completed Successfully
              </p>

              <p className="mt-1">
                Receipt{' '}
                <span className="font-semibold">
                  {
                    completedSale.receiptNumber
                  }
                </span>{' '}
                has been created successfully.
              </p>

              <p className="mt-1 font-semibold">
                Total:{' '}
                {formatCurrency(
                  Number(
                    completedSale.totalAmount,
                  ),
                )}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>

            <p className="font-semibold">
              Sale Error
            </p>

            <p className="mt-1">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* CREATE SALE */}
      <form
        onSubmit={handleCompleteSale}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Create Sale
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add one or more medicine batches to the
            sale.
          </p>

        </div>

        <div className="space-y-6 p-6">

          {/* MEDICINE / BATCH / QUANTITY */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_180px_auto]">

            {/* SEARCHABLE MEDICINE DROPDOWN */}
            <div
              ref={medicineDropdownRef}
              className="relative"
            >

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Medicine
              </label>

              <div className="relative">

                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(event) => {
                    setMedicineSearch(
                      event.target.value,
                    );

                    setIsMedicineDropdownOpen(
                      true,
                    );

                    /*
                     * If user edits the selected
                     * medicine text, remove the
                     * existing selection so they
                     * must choose a valid medicine.
                     */
                    if (
                      selectedMedicineId
                    ) {
                      setSelectedMedicineId(
                        '',
                      );

                      setSelectedBatchId(
                        '',
                      );

                      setBatches([]);

                      setQuantity('');
                    }
                  }}
                  onFocus={() =>
                    setIsMedicineDropdownOpen(
                      true,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Escape'
                    ) {
                      setIsMedicineDropdownOpen(
                        false,
                      );
                    }

                    if (
                      event.key ===
                        'Enter' &&
                      isMedicineDropdownOpen
                    ) {
                      event.preventDefault();

                      if (
                        filteredMedicines.length ===
                        1
                      ) {
                        selectMedicine(
                          filteredMedicines[0],
                        );
                      }
                    }
                  }}
                  disabled={
                    isLoadingMedicines ||
                    isSubmitting
                  }
                  placeholder={
                    isLoadingMedicines
                      ? 'Loading medicines...'
                      : 'Search or select medicine'
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                />

                {medicineSearch && (
                  <button
                    type="button"
                    onClick={
                      clearMedicineSelection
                    }
                    disabled={
                      isSubmitting
                    }
                    className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear medicine"
                  >
                    <X size={15} />
                  </button>
                )}

                <ChevronDown
                  size={17}
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
                    isMedicineDropdownOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />

              </div>

              {isMedicineDropdownOpen &&
                !isSubmitting && (
                  <div className="absolute left-0 right-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">

                    {isLoadingMedicines ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">

                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Loading medicines...

                      </div>
                    ) : filteredMedicines.length ===
                      0 ? (
                      <div className="px-4 py-4 text-center text-sm text-slate-500">

                        <Search
                          size={20}
                          className="mx-auto mb-2 text-slate-300"
                        />

                        No medicines found.

                        {medicineSearch && (
                          <p className="mt-1 text-xs text-slate-400">
                            Try another medicine
                            name, brand, generic
                            name, or SKU.
                          </p>
                        )}

                      </div>
                    ) : (
                      <div className="py-1">

                        {filteredMedicines.map(
                          (medicine) => (
                            <button
                              key={medicine.id}
                              type="button"
                              onClick={() =>
                                selectMedicine(
                                  medicine,
                                )
                              }
                              className={`block w-full px-4 py-3 text-left hover:bg-teal-50 ${
                                selectedMedicineId ===
                                medicine.id
                                  ? 'bg-teal-50'
                                  : ''
                              }`}
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="font-medium text-slate-900">
                                    {
                                      medicine.name
                                    }
                                  </p>

                                  {(medicine.genericName ||
                                    medicine.brandName) && (
                                    <p className="mt-1 truncate text-xs text-slate-500">

                                      {medicine.genericName && (
                                        <span>
                                          {
                                            medicine.genericName
                                          }
                                        </span>
                                      )}

                                      {medicine.genericName &&
                                        medicine.brandName && (
                                          <span>
                                            {' '}
                                            •{' '}
                                          </span>
                                        )}

                                      {medicine.brandName && (
                                        <span>
                                          {
                                            medicine.brandName
                                          }
                                        </span>
                                      )}

                                    </p>
                                  )}

                                </div>

                                {medicine.sku && (
                                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                    SKU:{' '}
                                    {
                                      medicine.sku
                                    }
                                  </span>
                                )}

                              </div>

                            </button>
                          ),
                        )}

                      </div>
                    )}

                  </div>
                )}

              {selectedMedicine && (
                <p className="mt-1.5 text-xs text-teal-700">
                  Selected:{' '}
                  <span className="font-semibold">
                    {selectedMedicine.name}
                  </span>
                </p>
              )}

            </div>

            {/* BATCH */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Batch
              </label>

              <select
                value={selectedBatchId}
                onChange={(event) =>
                  setSelectedBatchId(
                    event.target.value,
                  )
                }
                disabled={
                  !selectedMedicineId ||
                  isLoadingBatches ||
                  isSubmitting
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              >

                <option value="">
                  {isLoadingBatches
                    ? 'Loading...'
                    : !selectedMedicineId
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

            {/* QUANTITY */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                max={
                  selectedBatch?.quantity ??
                  undefined
                }
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
                placeholder="Qty"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              />

            </div>

            {/* ADD */}
            <div className="flex items-end">

              <button
                type="button"
                onClick={addItem}
                disabled={
                  isSubmitting ||
                  !selectedMedicineId ||
                  !selectedBatchId ||
                  !quantity
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />

                Add
              </button>

            </div>

          </div>

          {/* SELECTED BATCH INFO */}
          {selectedBatch && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

              <div className="grid gap-4 sm:grid-cols-3">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Available Stock
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {
                      selectedBatch.quantity
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selling Price
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(
                      selectedBatch.sellingPrice,
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Expiry
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatShortDate(
                      selectedBatch.expiryDate,
                    )}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* SALE ITEMS */}
          {items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">

              <table className="w-full min-w-[700px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                  <tr>

                    <th className="px-4 py-3 font-semibold">
                      Medicine
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Batch
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Qty
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Unit Price
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Total
                    </th>

                    <th className="px-4 py-3" />

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {items.map(
                    (item) => (
                      <tr
                        key={`${item.medicineId}-${item.batchId}`}
                      >

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {
                              item.medicineName
                            }
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {
                            item.batchNumber
                          }
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {
                            item.quantity
                          }
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {formatCurrency(
                            item.unitPrice,
                          )}
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {formatCurrency(
                            item.quantity *
                              item.unitPrice,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.medicineId,
                                item.batchId,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Remove ${item.medicineName}`}
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* CUSTOMER / PAYMENT / SUMMARY */}
          <div className="grid gap-6 lg:grid-cols-2">

            <div className="space-y-5">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value as PaymentMethod,
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >

                  <option value="CASH">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value,
                      )
                    }
                    maxLength={200}
                    disabled={
                      isSubmitting
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Customer Phone
                  </label>

                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value,
                      )
                    }
                    maxLength={30}
                    disabled={
                      isSubmitting
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  rows={4}
                  maxLength={1000}
                  disabled={
                    isSubmitting
                  }
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

              </div>

            </div>

            {/* SALE SUMMARY */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

              <h3 className="font-semibold text-slate-900">
                Sale Summary
              </h3>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between text-sm text-slate-600">

                  <span>
                    Items
                  </span>

                  <span>
                    {items.length}
                  </span>

                </div>

                <div className="flex justify-between text-sm text-slate-600">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatCurrency(
                      subtotal,
                    )}
                  </span>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max="100"
                    value={discount}
                    onChange={(event) =>
                      setDiscount(
                        event.target.value,
                      )
                    }
                    disabled={
                      isSubmitting ||
                      items.length === 0
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Discount: {formatCurrency(discountAmount)}
                  </p>

                </div>

                <div className="border-t border-slate-200 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="text-base font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        totalAmount,
                      )}
                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={clearSaleForm}
                  disabled={
                    isSubmitting
                  }
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    items.length === 0
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
                      <ReceiptText
                        size={17}
                      />

                      Complete Sale
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      </form>

      {/* SALES HISTORY */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Sales History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View completed sales and receipts.
          </p>

        </div>

        <div className="space-y-4 p-5">

          {/* SEARCH */}
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={salesSearch}
                onChange={(event) =>
                  setSalesSearch(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter'
                  ) {
                    setSalesPage(1);

                    void loadSales(
                      1,
                    );
                  }
                }}
                placeholder="Search receipt, customer name or phone..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

            </div>

            <select
              value={
                salesPaymentFilter
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setSalesPaymentFilter(
                  value,
                );

                setSalesPage(1);

                void getSales(
                  1,
                  10,
                  salesSearch,
                  value ||
                    undefined,
                ).then(
                  (result) => {
                    setSales(
                      result.data,
                    );

                    setSalesPagination(
                      result.pagination,
                    );
                  },
                );
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >

              <option value="">
                All payment methods
              </option>

              <option value="CASH">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="CARD">
                Card
              </option>

              <option value="OTHER">
                Other
              </option>

            </select>

            <button
              type="button"
              onClick={() => {
                setSalesPage(1);

                void loadSales(
                  1,
                );
              }}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>

          </div>

          {/* LOADING */}
          {isLoadingSales ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">

              <Loader2
                size={20}
                className="mr-3 animate-spin"
              />

              Loading sales...

            </div>
          ) : sales.length === 0 ? (

            <div className="py-12 text-center">

              <ReceiptText
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-800">
                No sales found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Completed sales will appear here.
              </p>

            </div>
          ) : (

            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-4 py-3 font-semibold">
                        Receipt
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Date
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Customer
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Items
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Payment
                      </th>

                      <th className="px-4 py-3 text-right font-semibold">
                        Total
                      </th>

                      <th className="px-4 py-3 text-right font-semibold">
                        Receipt
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {sales.map(
                      (sale) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-4 py-4">

                            <p className="font-semibold text-slate-900">
                              {
                                sale.receiptNumber
                              }
                            </p>

                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {formatDate(
                              sale.saleDate,
                            )}
                          </td>

                          <td className="px-4 py-4">

                            <p className="font-medium text-slate-800">
                              {
                                sale.customerName ||
                                'Walk-in Customer'
                              }
                            </p>

                            {sale.customerPhone && (
                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  sale.customerPhone
                                }
                              </p>
                            )}

                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {
                              sale.items
                                .length
                            }
                          </td>

                          <td className="px-4 py-4">

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {paymentLabel(
                                sale.paymentMethod,
                              )}
                            </span>

                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-slate-900">
                            {formatCurrency(
                              sale.totalAmount,
                            )}
                          </td>

                          <td className="px-4 py-4">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  viewReceipt(
                                    sale,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Eye
                                  size={15}
                                />

                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  printReceipt(
                                    sale,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                              >
                                <Printer
                                  size={15}
                                />

                                Print
                              </button>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">

                  Page{' '}
                  {
                    salesPagination.page
                  }{' '}
                  of{' '}
                  {
                    salesPagination.totalPages
                  }{' '}
                  ·{' '}
                  {
                    salesPagination.total
                  }{' '}
                  sales

                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      changeSalesPage(
                        salesPagination.page -
                          1,
                      )
                    }
                    disabled={
                      salesPagination.page <=
                        1 ||
                      isLoadingSales
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >

                    <ChevronLeft
                      size={16}
                    />

                    Previous

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeSalesPage(
                        salesPagination.page +
                          1,
                      )
                    }
                    disabled={
                      salesPagination.page >=
                        salesPagination.totalPages ||
                      isLoadingSales
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >

                    Next

                    <ChevronRight
                      size={16}
                    />

                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </section>

      {/* RECEIPT PREVIEW MODAL */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>

                <h2 className="font-semibold text-slate-900">
                  Receipt
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {
                    receiptSale.receiptNumber
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setReceiptSale(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close receipt"
              >
                <X size={20} />
              </button>

            </div>

            {/* RECEIPT */}
            <div className="overflow-y-auto p-6">

              <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6">

                {/* RECEIPT HEADER */}
                <div className="border-b border-slate-300 pb-5 text-center">

                  <h1 className="text-2xl font-bold text-slate-900">
                    Medical Store
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Sales Receipt
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {
                      receiptSale.receiptNumber
                    }
                  </p>

                </div>

                {/* RECEIPT DETAILS */}
                <div className="grid gap-3 border-b border-slate-200 py-5 text-sm sm:grid-cols-2">

                  <div>

                    <span className="font-semibold text-slate-700">
                      Date:
                    </span>{' '}

                    <span className="text-slate-600">
                      {formatDate(
                        receiptSale.saleDate,
                      )}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-slate-700">
                      Payment:
                    </span>{' '}

                    <span className="text-slate-600">
                      {paymentLabel(
                        receiptSale.paymentMethod,
                      )}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-slate-700">
                      Customer:
                    </span>{' '}

                    <span className="text-slate-600">
                      {
                        receiptSale.customerName ||
                        'Walk-in Customer'
                      }
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-slate-700">
                      Phone:
                    </span>{' '}

                    <span className="text-slate-600">
                      {
                        receiptSale.customerPhone ||
                        '-'
                      }
                    </span>

                  </div>

                </div>

                {/* ITEMS */}
                <div className="mt-5 overflow-x-auto">

                  <table className="w-full min-w-[600px] text-sm">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-3 py-3 text-left font-semibold text-slate-700">
                          Medicine
                        </th>

                        <th className="px-3 py-3 text-left font-semibold text-slate-700">
                          Batch
                        </th>

                        <th className="px-3 py-3 text-center font-semibold text-slate-700">
                          Qty
                        </th>

                        <th className="px-3 py-3 text-right font-semibold text-slate-700">
                          Price
                        </th>

                        <th className="px-3 py-3 text-right font-semibold text-slate-700">
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {receiptSale.items.map(
                        (item) => (
                          <tr key={item.id}>

                            <td className="px-3 py-3">

                              <p className="font-medium text-slate-900">
                                {
                                  item.medicine.name
                                }
                              </p>

                              {item.medicine.sku && (
                                <p className="mt-1 text-xs text-slate-500">
                                  SKU:{' '}
                                  {
                                    item.medicine.sku
                                  }
                                </p>
                              )}

                            </td>

                            <td className="px-3 py-3 text-slate-600">
                              {
                                item.batch.batchNumber
                              }
                            </td>

                            <td className="px-3 py-3 text-center text-slate-600">
                              {
                                item.quantity
                              }
                            </td>

                            <td className="px-3 py-3 text-right text-slate-600">
                              {formatCurrency(
                                item.unitPrice,
                              )}
                            </td>

                            <td className="px-3 py-3 text-right font-semibold text-slate-900">
                              {formatCurrency(
                                item.totalPrice,
                              )}
                            </td>

                          </tr>
                        ),
                      )}

                    </tbody>

                  </table>

                </div>

                {/* SUMMARY */}
                <div className="mt-6 flex justify-end">

                  <div className="w-full max-w-sm space-y-3">

                    <div className="flex justify-between text-sm text-slate-600">

                      <span>
                        Subtotal
                      </span>

                      <span>
                        {formatCurrency(
                          receiptSale.subtotal,
                        )}
                      </span>

                    </div>

                    <div className="flex justify-between text-sm text-slate-600">

                      <span>
                        Discount
                      </span>

                      <span>
                        {formatCurrency(
                          receiptSale.discount,
                        )}
                      </span>

                    </div>

                    <div className="border-t border-slate-300 pt-3">

                      <div className="flex justify-between">

                        <span className="text-lg font-bold text-slate-900">
                          Total
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          {formatCurrency(
                            receiptSale.totalAmount,
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* NOTES */}
                {receiptSale.notes && (
                  <div className="mt-6 border-t border-slate-200 pt-4 text-sm">

                    <p className="font-semibold text-slate-700">
                      Notes
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-slate-600">
                      {
                        receiptSale.notes
                      }
                    </p>

                  </div>
                )}

                {/* FOOTER */}
                <div className="mt-8 border-t border-slate-200 pt-5 text-center">

                  <p className="text-sm text-slate-500">
                    Thank you for your purchase.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Receipt generated by MediApp.
                  </p>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setReceiptSale(null)
                }
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  printReceipt(
                    receiptSale,
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >

                <Printer size={17} />

                Print Receipt

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
