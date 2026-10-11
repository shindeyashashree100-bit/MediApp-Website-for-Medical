-- Inventory safety constraints

ALTER TABLE "Medicine"
ADD CONSTRAINT "Medicine_minimumStock_non_negative"
CHECK ("minimumStock" >= 0);

ALTER TABLE "Batch"
ADD CONSTRAINT "Batch_purchasePrice_non_negative"
CHECK ("purchasePrice" >= 0);

ALTER TABLE "Batch"
ADD CONSTRAINT "Batch_sellingPrice_non_negative"
CHECK ("sellingPrice" >= 0);

ALTER TABLE "Batch"
ADD CONSTRAINT "Batch_quantity_non_negative"
CHECK ("quantity" >= 0);

ALTER TABLE "Batch"
ADD CONSTRAINT "Batch_manufacturing_before_expiry"
CHECK (
    "manufacturingDate" IS NULL
    OR "manufacturingDate" <= "expiryDate"
);

ALTER TABLE "StockReceipt"
ADD CONSTRAINT "StockReceipt_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "StockReceipt"
ADD CONSTRAINT "StockReceipt_purchasePrice_non_negative"
CHECK ("purchasePrice" >= 0);

ALTER TABLE "StockReceipt"
ADD CONSTRAINT "StockReceipt_sellingPrice_non_negative"
CHECK ("sellingPrice" >= 0);

ALTER TABLE "InventoryTransaction"
ADD CONSTRAINT "InventoryTransaction_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "InventoryTransaction"
ADD CONSTRAINT "InventoryTransaction_previousQuantity_non_negative"
CHECK ("previousQuantity" >= 0);

ALTER TABLE "InventoryTransaction"
ADD CONSTRAINT "InventoryTransaction_newQuantity_non_negative"
CHECK ("newQuantity" >= 0);

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_subtotal_non_negative"
CHECK ("subtotal" >= 0);

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_discount_non_negative"
CHECK ("discount" >= 0);

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_totalAmount_non_negative"
CHECK ("totalAmount" >= 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_unitPrice_non_negative"
CHECK ("unitPrice" >= 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_totalPrice_non_negative"
CHECK ("totalPrice" >= 0);

ALTER TABLE "Settings"
ADD CONSTRAINT "Settings_expiryWarningDays_positive"
CHECK ("expiryWarningDays" > 0);

ALTER TABLE "Settings"
ADD CONSTRAINT "Settings_expiryCriticalDays_positive"
CHECK ("expiryCriticalDays" > 0);

ALTER TABLE "Settings"
ADD CONSTRAINT "Settings_expiryWarningDays_ge_critical"
CHECK ("expiryWarningDays" >= "expiryCriticalDays");