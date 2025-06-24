-- Safe Seed Data for AI Testing (avoids conflicts with existing data)
-- Company ID: cmc80pcez00048oa5v3px063c
-- User ID: cmc80pcfb00088oa52sxacapd

-- Create manufacturers with unique names
INSERT INTO public."Manufacturer" (id, name, url, "supportUrl", "supportPhone", "supportEmail", "companyId", "createdAt", "updatedAt") 
VALUES
('mfg_apple_ai_001', 'Apple Inc. (AI Test)', 'https://www.apple.com', 'https://support.apple.com/ai', '+1-800-275-2273', 'ai-support@apple.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_dell_ai_001', 'Dell Technologies (AI Test)', 'https://www.dell.com', 'https://support.dell.com/ai', '+1-800-624-9896', 'ai-support@dell.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_microsoft_ai_001', 'Microsoft Corporation (AI Test)', 'https://www.microsoft.com', 'https://support.microsoft.com/ai', '+1-800-642-7676', 'ai-support@microsoft.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_adobe_ai_001', 'Adobe Inc. (AI Test)', 'https://www.adobe.com', 'https://helpx.adobe.com/ai', '+1-800-833-6687', 'ai-support@adobe.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('mfg_logitech_ai_001', 'Logitech (AI Test)', 'https://www.logitech.com', 'https://support.logi.com/ai', '+1-646-454-3200', 'ai-support@logitech.com', 'cmc80pcez00048oa5v3px063c', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create categories with unique names
INSERT INTO public."Category" (id, name, description, "companyId", "createdAt", "updatedAt") 
VALUES
('cat_laptops_ai_001', 'AI Test Laptops', 'Portable computers for AI testing', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_desktops_ai_001', 'AI Test Desktops', 'Desktop computers for AI testing', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_peripherals_ai_001', 'AI Test Peripherals', 'Keyboards, mice, monitors for AI testing', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_software_ai_001', 'AI Test Software', 'Software licenses for AI testing', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('cat_accessories_ai_001', 'AI Test Accessories', 'Cables, adapters for AI testing', 'cmc80pcez00048oa5v3px063c', NOW(), NOW())
ON CONFLICT (name, "companyId") DO NOTHING;

-- Create status labels with unique names
INSERT INTO public."StatusLabel" (id, name, "colorCode", description, "companyId", "createdAt", "updatedAt") 
VALUES
('status_ai_active_001', 'AI Active', '#22c55e', 'Asset is in active use (AI Test)', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_ai_available_001', 'AI Available', '#3b82f6', 'Asset is available for assignment (AI Test)', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_ai_maintenance_001', 'AI Maintenance', '#f59e0b', 'Asset is being serviced (AI Test)', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('status_ai_retired_001', 'AI Retired', '#ef4444', 'Asset is retired from service (AI Test)', 'cmc80pcez00048oa5v3px063c', NOW(), NOW())
ON CONFLICT (name, "companyId") DO NOTHING;

-- Create suppliers with unique emails
INSERT INTO public."Supplier" (id, name, "contactName", email, "phoneNum", "addressLine1", city, state, zip, country, "companyId", "createdAt", "updatedAt") 
VALUES
('sup_ai_techstore_001', 'AI TechStore Solutions', 'John Smith', 'ai-orders@techstore.com', '+1-555-0123', '123 AI Tech Street', 'San Jose', 'CA', '95110', 'USA', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('sup_ai_itpro_001', 'AI IT Pro Distributors', 'Jane Doe', 'ai-sales@itpro.com', '+1-555-0456', '456 AI Business Ave', 'Austin', 'TX', '73301', 'USA', 'cmc80pcez00048oa5v3px063c', NOW(), NOW())
ON CONFLICT (email, "companyId") DO NOTHING;

-- Create models with unique modelNo
INSERT INTO public."Model" (id, name, "modelNo", "manufacturerId", "companyId", "createdAt", "updatedAt") 
VALUES
('model_ai_mbp_001', 'AI MacBook Pro 14"', 'AI-MBP14-M3-2023', 'mfg_apple_ai_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('model_ai_dell_laptop_001', 'AI Dell Latitude 5530', 'AI-LAT5530-2023', 'mfg_dell_ai_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('model_ai_dell_desktop_001', 'AI Dell OptiPlex 7090', 'AI-OPT7090-2023', 'mfg_dell_ai_001', 'cmc80pcez00048oa5v3px063c', NOW(), NOW())
ON CONFLICT ("modelNo", "companyId") DO NOTHING;

-- Create realistic assets with unique names and asset tags
INSERT INTO public."Asset" (id, name, "assetTag", notes, "purchaseDate", "companyId", "modelId", "statusLabelId", "supplierId", "categoryId", "userId", "purchasePrice", "currentValue", "warrantyEndDate", "createdAt", "updatedAt") 
VALUES
('asset_ai_mbp_001', 'AI MacBook Pro - Development', 'AI-MBP-001', 'Primary development machine for AI testing', '2023-01-15', 'cmc80pcez00048oa5v3px063c', 'model_ai_mbp_001', 'status_ai_active_001', 'sup_ai_techstore_001', 'cat_laptops_ai_001', 'cmc80pcfb00088oa52sxacapd', 2499.00, 2000.00, '2026-01-15', NOW(), NOW()),
('asset_ai_mbp_002', 'AI MacBook Pro - Available', 'AI-MBP-002', 'Spare laptop for new hires (AI testing)', '2023-03-20', 'cmc80pcez00048oa5v3px063c', 'model_ai_mbp_001', 'status_ai_available_001', 'sup_ai_techstore_001', 'cat_laptops_ai_001', NULL, 2499.00, 1950.00, '2026-03-20', NOW(), NOW()),
('asset_ai_dell_001', 'AI Dell Latitude - Available', 'AI-DELL-LAT-001', 'Budget laptop option (AI testing)', '2022-06-10', 'cmc80pcez00048oa5v3px063c', 'model_ai_dell_laptop_001', 'status_ai_available_001', 'sup_ai_itpro_001', 'cat_laptops_ai_001', NULL, 1299.00, 800.00, '2025-06-10', NOW(), NOW()),
('asset_ai_dell_002', 'AI Dell Latitude - Maintenance', 'AI-DELL-LAT-002', 'Needs screen repair (AI testing)', '2022-08-15', 'cmc80pcez00048oa5v3px063c', 'model_ai_dell_laptop_001', 'status_ai_maintenance_001', 'sup_ai_itpro_001', 'cat_laptops_ai_001', NULL, 1299.00, 750.00, '2025-08-15', NOW(), NOW()),
('asset_ai_dell_desk_001', 'AI Dell OptiPlex - Workstation', 'AI-DELL-OPT-001', 'Design workstation (AI testing)', '2023-02-01', 'cmc80pcez00048oa5v3px063c', 'model_ai_dell_desktop_001', 'status_ai_active_001', 'sup_ai_itpro_001', 'cat_desktops_ai_001', NULL, 899.00, 720.00, '2026-02-01', NOW(), NOW()),
('asset_ai_old_laptop_001', 'AI Legacy Laptop', 'AI-OLD-LAP-001', 'Old laptop - consider replacement (AI testing)', '2020-01-15', 'cmc80pcez00048oa5v3px063c', 'model_ai_dell_laptop_001', 'status_ai_active_001', 'sup_ai_itpro_001', 'cat_laptops_ai_001', NULL, 1100.00, 300.00, '2023-01-15', NOW(), NOW())
ON CONFLICT (name, "companyId") DO NOTHING;

-- Create licenses with realistic scenarios for AI cost optimization testing
INSERT INTO public."License" (id, name, "licensedEmail", "poNumber", "companyId", "statusLabelId", "supplierId", "renewalDate", "purchaseDate", "alertRenewalDays", seats, "purchasePrice", "renewalPrice", "monthlyPrice", "annualPrice", "pricePerSeat", "billingCycle", currency, "discountPercent", "utilizationRate", "costCenter", "budgetCode", "manufacturerId", "createdAt", "updatedAt") 
VALUES
-- Adobe Creative Suite - Underutilized (40% utilization - good for AI cost optimization)
('lic_ai_adobe_001', 'AI Adobe Creative Suite Pro', 'admin@azure4.com', 'AI-PO-2023-001', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_techstore_001', '2024-12-31', '2023-01-01', 60, 10, 6000.00, 6300.00, 525.00, 6300.00, 52.50, 'annual', 'USD', 5.00, 0.40, 'IT-DEPT', 'BUD-2024-001', 'mfg_adobe_ai_001', NOW(), NOW()),
-- Microsoft Office - Well utilized (92% utilization)
('lic_ai_ms_office_001', 'AI Microsoft 365 Business Premium', 'admin@azure4.com', 'AI-PO-2023-002', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_techstore_001', '2024-08-15', '2023-08-15', 30, 25, 4500.00, 4725.00, 393.75, 4725.00, 15.75, 'annual', 'USD', 0.00, 0.92, 'IT-DEPT', 'BUD-2024-002', 'mfg_microsoft_ai_001', NOW(), NOW()),
-- Expensive license with poor utilization (20% - major cost optimization opportunity)
('lic_ai_design_001', 'AI AutoCAD Professional', 'admin@azure4.com', 'AI-PO-2023-003', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_techstore_001', '2024-06-30', '2023-06-30', 90, 5, 8500.00, 8925.00, 743.75, 8925.00, 148.75, 'annual', 'USD', 0.00, 0.20, 'DESIGN-DEPT', 'BUD-2024-003', 'mfg_adobe_ai_001', NOW(), NOW()),
-- License expiring soon (98% utilization - renewal priority)
('lic_ai_security_001', 'AI Antivirus Enterprise', 'admin@azure4.com', 'AI-PO-2023-004', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_itpro_001', '2024-02-28', '2023-02-28', 30, 50, 2500.00, 2625.00, 218.75, 2625.00, 4.38, 'annual', 'USD', 0.00, 0.98, 'IT-DEPT', 'BUD-2024-004', 'mfg_microsoft_ai_001', NOW(), NOW());

-- Create accessories with varied stock levels for AI inventory optimization
INSERT INTO public."Accessory" (id, name, "alertEmail", "serialNumber", "reorderPoint", "totalQuantityCount", "purchaseDate", notes, "companyId", "statusLabelId", "supplierId", "categoryId", "unitCost", "totalValue", currency, "averageCostPerUnit", "lastPurchasePrice", "costCenter", "budgetCode", "createdAt", "updatedAt") 
VALUES
-- Well stocked (above reorder point)
('acc_ai_mouse_001', 'AI Logitech MX Master 3', 'admin@azure4.com', 'AI-MOUSE-BATCH-001', 10, 25, '2023-03-15', 'Wireless productivity mouse (AI testing)', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_techstore_001', 'cat_accessories_ai_001', 89.99, 2249.75, 'USD', 89.99, 89.99, 'IT-DEPT', 'BUD-2024-005', NOW(), NOW()),
-- Low stock - needs reorder (below reorder point - AI should flag this)
('acc_ai_cable_001', 'AI USB-C to USB-C Cable 2m', 'admin@azure4.com', 'AI-CABLE-BATCH-001', 20, 8, '2023-01-10', 'High-speed USB-C cables - LOW STOCK (AI testing)', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_itpro_001', 'cat_accessories_ai_001', 24.99, 199.92, 'USD', 24.99, 24.99, 'IT-DEPT', 'BUD-2024-006', NOW(), NOW()),
-- Overstocked (way above reorder point - AI should suggest reducing orders)
('acc_ai_keyboard_001', 'AI Logitech MX Keys', 'admin@azure4.com', 'AI-KEYBOARD-BATCH-001', 5, 30, '2023-02-20', 'Wireless mechanical keyboard - OVERSTOCKED (AI testing)', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_techstore_001', 'cat_accessories_ai_001', 99.99, 2999.70, 'USD', 99.99, 99.99, 'IT-DEPT', 'BUD-2024-007', NOW(), NOW()),
-- Normal stock level
('acc_ai_adapter_001', 'AI USB-C to HDMI Adapter', 'admin@azure4.com', 'AI-ADAPTER-BATCH-001', 15, 22, '2023-04-05', 'Multi-port USB-C hub (AI testing)', 'cmc80pcez00048oa5v3px063c', 'status_ai_active_001', 'sup_ai_itpro_001', 'cat_accessories_ai_001', 49.99, 1099.78, 'USD', 49.99, 49.99, 'IT-DEPT', 'BUD-2024-008', NOW(), NOW());

-- Create user items to show utilization patterns for AI analysis
INSERT INTO public."UserItem" (id, "userId", "itemId", "itemType", "companyId", "createdAt", "updatedAt") 
VALUES
-- License assignments (showing underutilization for AI to detect)
('ui_ai_001', 'cmc80pcfb00088oa52sxacapd', 'lic_ai_adobe_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_ai_002', 'cmc80pcfb00088oa52sxacapd', 'lic_ai_ms_office_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_ai_003', 'cmc80pcfb00088oa52sxacapd', 'lic_ai_security_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
-- Only 1 out of 5 AutoCAD licenses assigned (20% utilization)
('ui_ai_004', 'cmc80pcfb00088oa52sxacapd', 'lic_ai_design_001', 'LICENSE', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
-- Accessory assignments
('ui_ai_005', 'cmc80pcfb00088oa52sxacapd', 'acc_ai_mouse_001', 'ACCESSORY', 'cmc80pcez00048oa5v3px063c', NOW(), NOW()),
('ui_ai_006', 'cmc80pcfb00088oa52sxacapd', 'acc_ai_cable_001', 'ACCESSORY', 'cmc80pcez00048oa5v3px063c', NOW(), NOW());

-- Create maintenance records for predictive analysis
INSERT INTO public."Maintenance" (id, "assetId", "statusLabelId", "technicianId", "supplierId", title, notes, "startDate", "completionDate", cost, "totalCost", "isWarranty", "createdAt", "updatedAt") 
VALUES
-- Completed maintenance
('maint_ai_001', 'asset_ai_dell_002', 'status_ai_maintenance_001', 'cmc80pcfb00088oa52sxacapd', 'sup_ai_itpro_001', 'AI Screen Replacement', 'Replaced cracked LCD screen (AI testing)', '2024-01-15', '2024-01-16', 150.00, 150.00, false, NOW(), NOW()),
-- Upcoming maintenance for old asset (AI should flag for replacement)
('maint_ai_002', 'asset_ai_old_laptop_001', 'status_ai_maintenance_001', 'cmc80pcfb00088oa52sxacapd', NULL, 'AI Performance Upgrade', 'RAM and SSD upgrade needed - consider replacement (AI testing)', '2024-02-01', NULL, 200.00, 200.00, false, NOW(), NOW());

-- Create CO2e records for sustainability insights
INSERT INTO public."Co2eRecord" (id, "assetId", "itemType", "userId", co2e, "co2eType", units, "sourceOrActivity", description, scope, "scopeCategory", "emissionFactor", "emissionFactorSource", "activityData", "createdAt", "updatedAt") 
VALUES
('co2_ai_001', 'asset_ai_mbp_001', 'Asset', 'cmc80pcfb00088oa52sxacapd', 300.50, 'Manufacturing', 'kg', 'Device Manufacturing', 'Carbon footprint from laptop manufacturing (AI testing)', 3, 'Purchased goods and services', 0.45, 'EPA 2024', '{"device_type": "laptop", "weight_kg": 1.6}', NOW(), NOW()),
('co2_ai_002', 'asset_ai_dell_001', 'Asset', 'cmc80pcfb00088oa52sxacapd', 250.25, 'Manufacturing', 'kg', 'Device Manufacturing', 'Carbon footprint from laptop manufacturing (AI testing)', 3, 'Purchased goods and services', 0.42, 'EPA 2024', '{"device_type": "laptop", "weight_kg": 1.8}', NOW(), NOW()); 