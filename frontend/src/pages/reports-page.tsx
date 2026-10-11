import {
  Download,
  FileBarChart,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getExpiryReport,
  getInventoryReport,
  getSalesReport,
  getStockMovementReport,
} from '@/services/report.service';

import type {
  ExpiryReportItem,
  InventoryReportItem,
  SalesReportSale,
  SalesReportSummary,
  StockMovement,
} from '@/types/report';

type ReportTab =
  | 'inventory'
  | 'movement'
  | 'sales'
  | 'expiry';

function formatCurrency(
  value: number | string,
): string {
  return `₹${Number(value).toFixed(2)}`;
}

function formatDate(
  value: string,
): string {
  return new Date(value).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatDateTime(
  value: string,
): string {
  return new Date(value).toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function escapeCsv(
  value: unknown,
): string {
  const text =
    value === null ||
    value === undefined
      ? ''
      : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(
  filename: string,
  rows: string[][],
): void {
  const csv = rows
    .map((row) =>
      row.map(escapeCsv).join(','),
    )
    .join('\n');

  const blob = new Blob(
    [csv],
    {
      type: 'text/csv;charset=utf-8;',
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [activeTab, setActiveTab] =
    useState<ReportTab>('inventory');

  const [
    inventory,
    setInventory,
  ] = useState<InventoryReportItem[]>([]);

  const [
    movements,
    setMovements,
  ] = useState<StockMovement[]>([]);

  const [
    sales,
    setSales,
  ] = useState<SalesReportSale[]>([]);

  const [
    salesSummary,
    setSalesSummary,
  ] =
    useState<SalesReportSummary>({
      totalSales: 0,
      subtotal: 0,
      discount: 0,
      totalAmount: 0,
    });

  const [
    expiryItems,
    setExpiryItems,
  ] = useState<ExpiryReportItem[]>([]);

  const [
    expiryWarningDays,
    setExpiryWarningDays,
  ] = useState(90);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    fromDate,
    setFromDate,
  ] = useState('');

  const [
    toDate,
    setToDate,
  ] = useState('');

  const [
    movementType,
    setMovementType,
  ] = useState('');

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('');

  const [
    expiryStatus,
    setExpiryStatus,
  ] = useState('ALL');

  const loadReport =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        if (
          activeTab ===
          'inventory'
        ) {
          const data =
            await getInventoryReport();

          setInventory(data);
        }

        if (
          activeTab ===
          'movement'
        ) {
          const data =
            await getStockMovementReport(
              fromDate
                ? `${fromDate}T00:00:00+05:30`
                : undefined,
              toDate
                ? `${toDate}T23:59:59+05:30`
                : undefined,
              movementType ||
                undefined,
              search ||
                undefined,
            );

          setMovements(data);
        }

        if (
          activeTab ===
          'sales'
        ) {
          const result =
            await getSalesReport(
              fromDate
                ? `${fromDate}T00:00:00+05:30`
                : undefined,
              toDate
                ? `${toDate}T23:59:59+05:30`
                : undefined,
              paymentMethod ||
                undefined,
              search ||
                undefined,
            );

          setSales(result.data);
          setSalesSummary(
            result.summary,
          );
        }

        if (
          activeTab ===
          'expiry'
        ) {
          const result =
            await getExpiryReport(
              expiryStatus,
              search ||
                undefined,
            );

          setExpiryItems(
            result.data,
          );

          setExpiryWarningDays(
            result.warningDays,
          );
        }
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'Failed to load report.',
        );
      } finally {
        setLoading(false);
      }
    }, [
      activeTab,
      expiryStatus,
      fromDate,
      movementType,
      paymentMethod,
      search,
      toDate,
    ]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const inventoryTotals =
    useMemo(() => {
      return inventory.reduce(
        (totals, item) => ({
          stock: totals.stock +
            item.currentStock,

          stockValue:
            totals.stockValue +
            item.stockValue,

          sellingValue:
            totals.sellingValue +
            item.sellingValue,
        }),
        {
          stock: 0,
          stockValue: 0,
          sellingValue: 0,
        },
      );
    }, [inventory]);

  const tabs = [
    {
      id: 'inventory' as const,
      label: 'Inventory',
    },
    {
      id: 'movement' as const,
      label: 'Stock Movement',
    },
    {
      id: 'sales' as const,
      label: 'Sales',
    },
    {
      id: 'expiry' as const,
      label: 'Expiry',
    },
  ];

  function handleExport() {
    if (
      activeTab ===
      'inventory'
    ) {
      downloadCsv(
        'inventory-report.csv',
        [
          [
            'Medicine',
            'SKU',
            'Unit',
            'Batch',
            'Quantity',
            'Purchase Price',
            'Selling Price',
            'Expiry Date',
            'Stock Value',
          ],
          ...inventory.flatMap(
            (medicine) =>
              medicine.batches.map(
                (batch) => [
                  medicine.name,
                  medicine.sku ?? '',
                  medicine.unitRelation
                    .name,
                  batch.batchNumber,
                  String(
                    batch.quantity,
                  ),
                  batch.purchasePrice,
                  batch.sellingPrice,
                  formatDate(
                    batch.expiryDate,
                  ),
                  String(
                    Number(
                      batch.purchasePrice,
                    ) *
                      batch.quantity,
                  ),
                ],
              ),
          ),
        ],
      );

      return;
    }

    if (
      activeTab ===
      'movement'
    ) {
      downloadCsv(
        'stock-movement-report.csv',
        [
          [
            'Date',
            'Medicine',
            'Batch',
            'Type',
            'Quantity',
            'Previous Stock',
            'New Stock',
            'Reference',
            'Notes',
          ],
          ...movements.map(
            (item) => [
              formatDateTime(
                item.createdAt,
              ),
              item.medicine.name,
              item.batch.batchNumber,
              item.type,
              String(
                item.quantity,
              ),
              String(
                item.previousQuantity,
              ),
              String(
                item.newQuantity,
              ),
              item.reference ??
                '',
              item.notes ?? '',
            ],
          ),
        ],
      );

      return;
    }

    if (
      activeTab ===
      'sales'
    ) {
      downloadCsv(
        'sales-report.csv',
        [
          [
            'Receipt Number',
            'Date',
            'Customer',
            'Payment',
            'Subtotal',
            'Discount',
            'Total',
          ],
          ...sales.map(
            (sale) => [
              sale.receiptNumber,
              formatDateTime(
                sale.saleDate,
              ),
              sale.customerName ??
                '',
              sale.paymentMethod,
              sale.subtotal,
              sale.discount,
              sale.totalAmount,
            ],
          ),
        ],
      );

      return;
    }

    downloadCsv(
      'expiry-report.csv',
      [
        [
          'Medicine',
          'SKU',
          'Batch',
          'Quantity',
          'Expiry Date',
          'Selling Price',
        ],
        ...expiryItems.map(
          (item) => [
            item.medicine.name,
            item.medicine.sku ??
              '',
            item.batchNumber,
            String(
              item.quantity,
            ),
            formatDate(
              item.expiryDate,
            ),
            item.sellingPrice,
          ],
        ),
      ],
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <FileBarChart className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Reports
              </h1>

              <p className="text-sm text-muted-foreground">
                Inventory, stock movement, sales and expiry reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void loadReport()
            }
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={
              handleExport
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="border-b">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(
                    tab.id,
                  );
                  setSearch('');
                  setFromDate('');
                  setToDate('');
                  setMovementType('');
                  setPaymentMethod('');
                  setExpiryStatus(
                    'ALL',
                  );
                }}
                className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium ${
                  activeTab ===
                  tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ),
          )}
        </div>
      </div>

      {activeTab !==
        'inventory' && (
        <div className="rounded-xl border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activeTab !==
              'expiry' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    From
                  </label>

                  <input
                    type="date"
                    value={
                      fromDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setFromDate(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    To
                  </label>

                  <input
                    type="date"
                    value={
                      toDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setToDate(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            {activeTab ===
              'movement' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Type
                </label>

                <select
                  value={
                    movementType
                  }
                  onChange={(
                    event,
                  ) =>
                    setMovementType(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">
                    All types
                  </option>

                  <option value="STOCK_IN">
                    Stock In
                  </option>

                  <option value="STOCK_OUT">
                    Stock Out
                  </option>

                  <option value="ADJUSTMENT">
                    Adjustment
                  </option>
                </select>
              </div>
            )}

            {activeTab ===
              'sales' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Payment
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(
                    event,
                  ) =>
                    setPaymentMethod(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">
                    All payments
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
              </div>
            )}

            {activeTab ===
              'expiry' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={
                    expiryStatus
                  }
                  onChange={(
                    event,
                  ) =>
                    setExpiryStatus(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="ALL">
                    All
                  </option>

                  <option value="EXPIRING">
                    Expiring Soon
                  </option>

                  <option value="EXPIRED">
                    Expired
                  </option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Search
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search..."
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  void loadReport()
                }
                disabled={
                  loading
                }
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {activeTab ===
        'inventory' && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Current Stock"
              value={String(
                inventoryTotals.stock,
              )}
            />

            <SummaryCard
              label="Purchase Value"
              value={formatCurrency(
                inventoryTotals.stockValue,
              )}
            />

            <SummaryCard
              label="Selling Value"
              value={formatCurrency(
                inventoryTotals.sellingValue,
              )}
            />
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <ReportTable loading={loading}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>SKU</th>
                  <th>Unit</th>
                  <th>Current Stock</th>
                  <th>Minimum</th>
                  <th>Purchase Value</th>
                  <th>Selling Value</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td className="font-medium">
                        {item.name}
                      </td>

                      <td>
                        {item.sku ??
                          '—'}
                      </td>

                      <td>
                        {
                          item
                            .unitRelation
                            .name
                        }
                      </td>

                      <td>
                        {item.currentStock}
                      </td>

                      <td>
                        {item.minimumStock}
                      </td>

                      <td>
                        {formatCurrency(
                          item.stockValue,
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          item.sellingValue,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </ReportTable>

            {!loading &&
              inventory.length ===
                0 && (
                <EmptyState />
              )}
          </div>
        </>
      )}

      {activeTab ===
        'movement' && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ReportTable loading={loading}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Previous</th>
                <th>New Stock</th>
                <th>Reference</th>
              </tr>
            </thead>

            <tbody>
              {movements.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td>
                      {formatDateTime(
                        item.createdAt,
                      )}
                    </td>

                    <td className="font-medium">
                      {
                        item
                          .medicine
                          .name
                      }
                    </td>

                    <td>
                      {
                        item.batch
                          .batchNumber
                      }
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          item.type
                        }
                      />
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {
                        item.previousQuantity
                      }
                    </td>

                    <td>
                      {
                        item.newQuantity
                      }
                    </td>

                    <td>
                      {item.reference ??
                        '—'}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </ReportTable>

          {!loading &&
            movements.length ===
              0 && (
              <EmptyState />
            )}
        </div>
      )}

      {activeTab ===
        'sales' && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard
              label="Total Sales"
              value={String(
                salesSummary.totalSales,
              )}
            />

            <SummaryCard
              label="Subtotal"
              value={formatCurrency(
                salesSummary.subtotal,
              )}
            />

            <SummaryCard
              label="Discount"
              value={formatCurrency(
                salesSummary.discount,
              )}
            />

            <SummaryCard
              label="Total Revenue"
              value={formatCurrency(
                salesSummary.totalAmount,
              )}
            />
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <ReportTable loading={loading}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map(
                  (sale) => (
                    <tr
                      key={
                        sale.id
                      }
                    >
                      <td>
                        {formatDateTime(
                          sale.saleDate,
                        )}
                      </td>

                      <td className="font-medium">
                        {
                          sale.receiptNumber
                        }
                      </td>

                      <td>
                        {sale.customerName ??
                          'Walk-in Customer'}
                      </td>

                      <td>
                        {sale.paymentMethod}
                      </td>

                      <td>
                        {formatCurrency(
                          sale.subtotal,
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          sale.discount,
                        )}
                      </td>

                      <td className="font-semibold">
                        {formatCurrency(
                          sale.totalAmount,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </ReportTable>

            {!loading &&
              sales.length ===
                0 && (
                <EmptyState />
              )}
          </div>
        </>
      )}

      {activeTab ===
        'expiry' && (
        <>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Expiring Soon is based on the
              configured warning period of{' '}
              <span className="font-semibold text-foreground">
                {expiryWarningDays} days
              </span>
              .
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <ReportTable loading={loading}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>SKU</th>
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Selling Price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {expiryItems.map(
                  (item) => {
                    const expired =
                      new Date(
                        item.expiryDate,
                      ) <
                      new Date();

                    return (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td className="font-medium">
                          {
                            item
                              .medicine
                              .name
                          }
                        </td>

                        <td>
                          {
                            item
                              .medicine
                              .sku ??
                              '—'
                          }
                        </td>

                        <td>
                          {
                            item.batchNumber
                          }
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {formatDate(
                            item.expiryDate,
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            item.sellingPrice,
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            value={
                              expired
                                ? 'EXPIRED'
                                : 'EXPIRING'
                            }
                          />
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </ReportTable>

            {!loading &&
              expiryItems.length ===
                0 && (
                <EmptyState />
              )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function ReportTable({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        {children}

        {loading && (
          <tbody>
            <tr>
              <td
                colSpan={10}
                className="py-12 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading report...
                </div>
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      No report data found.
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  const label =
    value === 'STOCK_IN'
      ? 'Stock In'
      : value === 'STOCK_OUT'
        ? 'Stock Out'
        : value === 'ADJUSTMENT'
          ? 'Adjustment'
          : value === 'EXPIRED'
            ? 'Expired'
            : 'Expiring';

  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {label}
    </span>
  );
}