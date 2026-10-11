import type { ReactNode } from 'react';

import {
  Archive,
  BellRing,
  Boxes,
  LayoutDashboard,
  PackageMinus,
  PackagePlus,
  Pill,
  ReceiptText,
  Settings,
  Tags,
  Truck,
} from 'lucide-react';

import { PlaceholderPage } from '@/pages/placeholder-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { MedicinesPage } from '@/pages/medicines-page';
import { CategoriesPage } from '@/pages/categories-page';
import { StockInPage } from '@/pages/stock-in-page';
import { SuppliersPage } from '@/pages/suppliers-page';
import { BatchesPage } from '@/pages/batches-page';
import { StockOutPage } from '@/pages/stock-out-page';
import { SalesPage } from '@/pages/sales-page';
import { AlertsPage } from '@/pages/alerts-page';
import { ReportsPage } from '@/pages/reports-page';
import { SettingsPage } from '@/pages/settings-page';
import { UnitsPage } from '@/pages/units-page';

export type AppRoute = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  element: ReactNode;
};

export const appRoutes: AppRoute[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    element: <DashboardPage />,
  },

  {
    path: '/medicines',
    label: 'Medicines',
    icon: Pill,
    element: <MedicinesPage />,
  },

  {
    path: '/sales',
    label: 'Sales',
    icon: ReceiptText,
    element: <SalesPage />,
  },

  {
    path: '/stock-in',
    label: 'Stock In',
    icon: PackagePlus,
    element: <StockInPage />,
  },

  {
    path: '/stock-out',
    label: 'Stock Out',
    icon: PackageMinus,
    element: <StockOutPage />,
  },

  {
    path: '/suppliers',
    label: 'Suppliers',
    icon: Truck,
    element: <SuppliersPage />,
  },

  {
    path: '/batches',
    label: 'Batches',
    icon: Boxes,
    element: <BatchesPage />,
  },

  {
    path: '/categories',
    label: 'Categories',
    icon: Tags,
    element: <CategoriesPage />,
  },

  {
    path: '/alerts',
    label: 'Alerts',
    icon: BellRing,
    element: <AlertsPage />,
  },

  {
    path: '/reports',
    label: 'Reports',
    icon: Archive,
    element: <ReportsPage />,
  },

  /*
   * Units is intentionally kept as a route,
   * but hidden from the main sidebar by app-shell.tsx.
   *
   * It is accessed through:
   *
   * Settings → Master Data → Manage Units
   */
  {
    path: '/units',
    label: 'Units',
    icon: Boxes,
    element: <UnitsPage />,
  },

  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    element: <SettingsPage />,
  },
];
