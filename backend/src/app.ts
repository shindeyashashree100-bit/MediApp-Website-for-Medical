import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';

import { healthRouter } from './routes/health.routes.js';
import settingsRouter from './routes/settings.routes.js';
import categoryRouter from './routes/category.routes.js';
import medicineRouter from './routes/medicine.routes.js';
import supplierRouter from './routes/supplier.routes.js';
import stockInRouter from './routes/stock-in.routes.js';
import stockOutRouter from './routes/stock-out.routes.js';
import inventoryAdjustmentRouter from './routes/inventory-adjustment.routes.js';
import saleRouter from './routes/sale.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import inventoryAlertRouter from './routes/inventory-alert.routes.js';
import inventoryTransactionRouter from './routes/inventory-transaction.routes.js';
import unitRouter from './routes/unit.routes.js';
import batchRouter from './routes/batch.routes.js';
import reportRouter from './routes/report.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/health', healthRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/medicines', medicineRouter);
app.use('/api/units', unitRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/stock-in', stockInRouter);
app.use('/api/stock-out', stockOutRouter);
app.use('/api/inventory/adjustments', inventoryAdjustmentRouter);
app.use('/api/inventory/alerts', inventoryAlertRouter);
app.use('/api/inventory', inventoryTransactionRouter);
app.use('/api/sales', saleRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/batches', batchRouter);
app.use('/api/reports', reportRouter);

app.use(errorHandler);