-- Seed Data for AI Testing
-- Company ID: cmc80pcez00048oa5v3px063c
-- User ID: cmc80pcfb00088oa52sxacapd

-- Create manufacturers
INSERT INTO public."Manufacturer" (id, name, url, "supportUrl", "supportPhone", "supportEmail", "companyId", "createdAt", "updatedAt") VALUES
('mfg_apple_001', 'Apple Inc.', 'https://www.apple.com', 'https://support.apple.com', '+1-800-275-2273', 'support@apple.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_dell_001', 'Dell Technologies', 'https://www.dell.com', 'https://support.dell.com', '+1-800-624-9896', 'support@dell.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_microsoft_001', 'Microsoft Corporation', 'https://www.microsoft.com', 'https://support.microsoft.com', '+1-800-642-7676', 'support@microsoft.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_adobe_001', 'Adobe Inc.', 'https://www.adobe.com', 'https://helpx.adobe.com', '+1-800-833-6687', 'support@adobe.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_logitech_001', 'Logitech', 'https://www.logitech.com', 'https://support.logi.com', '+1-646-454-3200', 'support@logitech.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create categories
INSERT INTO public."Category" (id, name, description, "companyId", "createdAt", "updatedAt") VALUES
('cat_laptops_001', 'Laptops', 'Portable computers for employees', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_desktops_001', 'Desktops', 'Desktop computers and workstations', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_peripherals_001', 'Peripherals', 'Keyboards, mice, monitors, etc.', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_software_001', 'Software', 'Software licenses and applications', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_accessories_001', 'IT Accessories', 'Cables, adapters, and other accessories', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create status labels
INSERT INTO public."StatusLabel" (id, name, "colorCode", description, "companyId", "createdAt", "updatedAt") VALUES
('status_active_001', 'Active', '#22c55e', 'Asset is in active use', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_available_001', 'Available', '#3b82f6', 'Asset is available for assignment', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_maintenance_001', 'Under Maintenance', '#f59e0b', 'Asset is being serviced', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_retired_001', 'Retired', '#ef4444', 'Asset is retired from service', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create suppliers
INSERT INTO public."Supplier" (id, name, "contactName", email, "phoneNum", "addressLine1", city, state, zip, country, "companyId", "createdAt", "updatedAt") VALUES
('sup_techstore_001', 'TechStore Solutions', 'John Smith', 'orders@techstore.com', '+1-555-0123', '123 Tech Street', 'San Jose', 'CA', '95110', 'USA', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('sup_itpro_001', 'IT Pro Distributors', 'Jane Doe', 'sales@itpro.com', '+1-555-0456', '456 Business Ave', 'Austin', 'TX', '73301', 'USA', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create models
INSERT INTO public."Model" (id, name, "modelNo", "manufacturerId", "companyId", "createdAt", "updatedAt") VALUES
('model_mbp_001', 'MacBook Pro 14"', 'MBP14-M3-2023', 'mfg_apple_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('model_dell_laptop_001', 'Dell Latitude 5530', 'LAT5530-2023', 'mfg_dell_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('model_dell_desktop_001', 'Dell OptiPlex 7090', 'OPT7090-2023', 'mfg_dell_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create realistic assets
INSERT INTO public."Asset" (id, name, "assetTag", notes, "purchaseDate", "companyId", "modelId", "statusLabelId", "supplierId", "categoryId", "userId", "purchasePrice", "currentValue", "warrantyEndDate", "createdAt", "updatedAt") VALUES
('asset_mbp_001', 'MacBook Pro - Development', 'MBP-001', 'Primary development machine', '2023-01-15', 'cmc80pcez00048oa5v3px063c', 'model_mbp_001', 'status_active_001', 'sup_techstore_001', 'cat_laptops_001', 'cmc80pcfb00088oa52sxacapd', 2499.00, 2000.00, '2026-01-15', NOW(), NOW()),
('asset_mbp_002', 'MacBook Pro - Available', 'MBP-002', 'Spare laptop for new hires', '2023-03-20', 'cmc80pcez00048oa5v3px063c', 'model_mbp_001', 'status_available_001', 'sup_techstore_001', 'cat_laptops_001', NULL, 2499.00, 1950.00, '2026-03-20', NOW(), NOW()),
('asset_dell_001', 'Dell Latitude - Available', 'DELL-LAT-001', 'Budget laptop option', '2022-06-10', 'cmc80pcez00048oa5v3px063c', 'model_dell_laptop_001', 'status_available_001', 'sup_itpro_001', 'cat_laptops_001', NULL, 1299.00, 800.00, '2025-06-10', NOW(), NOW()),
('asset_dell_002', 'Dell Latitude - Maintenance', 'DELL-LAT-002', 'Needs screen repair', '2022-08-15', 'cmc80pcez00048oa5v3px063c', 'model_dell_laptop_001', 'status_maintenance_001', 'sup_itpro_001', 'cat_laptops_001', NULL, 1299.00, 750.00, '2025-08-15', NOW(), NOW()),
('asset_dell_desk_001', 'Dell OptiPlex - Workstation', 'DELL-OPT-001', 'Design workstation', '2023-02-01', 'cmc80pcez00048oa5v3px063c', 'model_dell_desktop_001', 'status_active_001', 'sup_itpro_001', 'cat_desktops_001', NULL, 899.00, 720.00, '2026-02-01', NOW(), NOW()),
('asset_old_laptop_001', 'Legacy Laptop', 'OLD-LAP-001', 'Old laptop - consider replacement', '2020-01-15', 'cmc80pcez00048oa5v3px063c', 'model_dell_laptop_001', 'status_active_001', 'sup_itpro_001', 'cat_laptops_001', NULL, 1100.00, 300.00, '2023-01-15', NOW(), NOW());

-- Create licenses with realistic scenarios
INSERT INTO public."License" (id, name, "licensedEmail", "poNumber", "companyId", "statusLabelId", "supplierId", "renewalDate", "purchaseDate", "alertRenewalDays", seats, "purchasePrice", "renewalPrice", "monthlyPrice", "annualPrice", "pricePerSeat", "billingCycle", currency, "discountPercent", "utilizationRate", "costCenter", "budgetCode", "manufacturerId", "createdAt", "updatedAt") VALUES
('lic_adobe_001', 'Adobe Creative Suite Pro', 'admin@azure4.com', 'PO-2023-001', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_techstore_001', '2024-12-31', '2023-01-01', 60, 10, 6000.00, 6300.00, 525.00, 6300.00, 52.50, 'annual', 'USD', 5.00, 0.40, 'IT-DEPT', 'BUD-2024-001', 'mfg_adobe_001', NOW(), NOW()),
('lic_ms_office_001', 'Microsoft 365 Business Premium', 'admin@azure4.com', 'PO-2023-002', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_techstore_001', '2024-08-15', '2023-08-15', 30, 25, 4500.00, 4725.00, 393.75, 4725.00, 15.75, 'annual', 'USD', 0.00, 0.92, 'IT-DEPT', 'BUD-2024-002', 'mfg_microsoft_001', NOW(), NOW()),
('lic_design_001', 'AutoCAD Professional', 'admin@azure4.com', 'PO-2023-003', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_techstore_001', '2024-06-30', '2023-06-30', 90, 5, 8500.00, 8925.00, 743.75, 8925.00, 148.75, 'annual', 'USD', 0.00, 0.20, 'DESIGN-DEPT', 'BUD-2024-003', 'mfg_adobe_001', NOW(), NOW()),
('lic_security_001', 'Antivirus Enterprise', 'admin@azure4.com', 'PO-2023-004', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_itpro_001', '2024-02-28', '2023-02-28', 30, 50, 2500.00, 2625.00, 218.75, 2625.00, 4.38, 'annual', 'USD', 0.00, 0.98, 'IT-DEPT', 'BUD-2024-004', 'mfg_microsoft_001', NOW(), NOW());

-- Create accessories with varied stock levels
INSERT INTO public."Accessory" (id, name, "alertEmail", "serialNumber", "reorderPoint", "totalQuantityCount", "purchaseDate", notes, "companyId", "statusLabelId", "supplierId", "categoryId", "unitCost", "totalValue", currency, "averageCostPerUnit", "lastPurchasePrice", "costCenter", "budgetCode", "createdAt", "updatedAt") VALUES
('acc_mouse_001', 'Logitech MX Master 3', 'admin@azure4.com', 'MOUSE-BATCH-001', 10, 25, '2023-03-15', 'Wireless productivity mouse', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_techstore_001', 'cat_accessories_001', 89.99, 2249.75, 'USD', 89.99, 89.99, 'IT-DEPT', 'BUD-2024-005', NOW(), NOW()),
('acc_cable_001', 'USB-C to USB-C Cable 2m', 'admin@azure4.com', 'CABLE-BATCH-001', 20, 8, '2023-01-10', 'High-speed USB-C cables - LOW STOCK', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_itpro_001', 'cat_accessories_001', 24.99, 199.92, 'USD', 24.99, 24.99, 'IT-DEPT', 'BUD-2024-006', NOW(), NOW()),
('acc_keyboard_001', 'Logitech MX Keys', 'admin@azure4.com', 'KEYBOARD-BATCH-001', 5, 30, '2023-02-20', 'Wireless mechanical keyboard - OVERSTOCKED', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_techstore_001', 'cat_accessories_001', 99.99, 2999.70, 'USD', 99.99, 99.99, 'IT-DEPT', 'BUD-2024-007', NOW(), NOW()),
('acc_adapter_001', 'USB-C to HDMI Adapter', 'admin@azure4.com', 'ADAPTER-BATCH-001', 15, 22, '2023-04-05', 'Multi-port USB-C hub', 'cmc80pcez00048oa5v3px063c', 'status_active_001', 'sup_itpro_001', 'cat_accessories_001', 49.99, 1099.78, 'USD', 49.99, 49.99, 'IT-DEPT', 'BUD-2024-008', NOW(), NOW());

-- Create user items to show utilization
INSERT INTO public."UserItem" (id, "userId", "itemId", "itemType", "companyId", "createdAt", "updatedAt") VALUES
('ui_001', 'cmc80pcfb00088oa52sxacapd', 'lic_adobe_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_002', 'cmc80pcfb00088oa52sxacapd', 'lic_ms_office_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_003', 'cmc80pcfb00088oa52sxacapd', 'lic_security_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_004', 'cmc80pcfb00088oa52sxacapd', 'acc_mouse_001', 'ACCESSORY', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_005', 'cmc80pcfb00088oa52sxacapd', 'acc_cable_001', 'ACCESSORY', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create maintenance records
INSERT INTO public."Maintenance" (id, "assetId", "statusLabelId", "technicianId", "supplierId", title, notes, "startDate", "completionDate", cost, "totalCost", "isWarranty", "createdAt", "updatedAt") VALUES
('maint_001', 'asset_dell_002', 'status_maintenance_001', 'cmc80pcfb00088oa52sxacapd', 'sup_itpro_001', 'Screen Replacement', 'Replaced cracked LCD screen', '2024-01-15', '2024-01-16', 150.00, 150.00, false, NOW(), NOW()),
('maint_002', 'asset_old_laptop_001', 'status_maintenance_001', 'cmc80pcfb00088oa52sxacapd', NULL, 'Performance Upgrade', 'RAM and SSD upgrade needed', '2024-02-01', NULL, 200.00, 200.00, false, NOW(), NOW());

-- Create CO2e records
INSERT INTO public."Co2eRecord" (id, "assetId", "itemType", "userId", co2e, "co2eType", units, "sourceOrActivity", description, scope, "scopeCategory", "emissionFactor", "emissionFactorSource", "activityData", "createdAt", "updatedAt") VALUES
('co2_001', 'asset_mbp_001', 'Asset', 'cmc80pcfb00088oa52sxacapd', 300.50, 'Manufacturing', 'kg', 'Device Manufacturing', 'Carbon footprint from laptop manufacturing', 3, 'Purchased goods and services', 0.45, 'EPA 2024', '{"device_type": "laptop", "weight_kg": 1.6}', NOW(), NOW()),
('co2_002', 'asset_dell_001', 'Asset', 'cmc80pcfb00088oa52sxacapd', 250.25, 'Manufacturing', 'kg', 'Device Manufacturing', 'Carbon footprint from laptop manufacturing', 3, 'Purchased goods and services', 0.42, 'EPA 2024', '{"device_type": "laptop", "weight_kg": 1.8}', NOW(), NOW());

COMMIT; 