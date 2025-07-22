/* eslint-disable no-unused-vars */
import { LicenseSeat } from "@prisma/client";

declare global {
  // ==================== Company status  ====================
  // enum CompanyStatus {
  //   ACTIVE = "ACTIVE",
  //   INACTIVE = "INACTIVE",
  // }

  type UsageRecord = {
    id: string;
    subscriptionId: string;
    purchasedAssetQuota: number;
    actualAssetCount: number;
    timestamp: Date;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    stripeUsageRecordId: string | null;
    pricePerAsset: Decimal;
    totalAmount: Decimal;
    subscription?: Subscription; // Optional since you might not always load the relation
  };

  // ==================== Base Interfaces ====================
  interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Model extends BaseEntity {
    name: string;
    active: boolean;
    modelNo: string;
    categoryId: string;
    manufacturerId: string;
    assets?: Asset[];
    category?: Category;
    manufacturer?: Manufacturer;
  }

  type QueryParams<TParams = BaseQueryParams> = TParams;

  type StoredCategory = Required<Pick<Category, "id">> & Category;

  interface AddressFields {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
  }

  // ==================== Common Types ====================
  type DetailFieldType = {
    label: string;
    value: string;
    type: "status" | "date" | "text" | "currency";
  };

  type ActionResponse<T> = {
    data?: T;
    error?: string;
    message?: string;
    success?: boolean;
    redirectUrl?: string;
  };

  // Paginated response for tables
  export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    error?: string;
    success?: boolean;
    message?: string;
  };

  type CSVRow = Record<string, string>;

  // ==================== Core Entity Types ====================
  interface StatusLabel extends BaseEntity {
    name: string;
    active: boolean;
    colorCode: string;
    description: string;
    isArchived: boolean;
    allowLoan: boolean;
  }

  interface Role extends BaseEntity {
    name: string;
    active: boolean;
    note: string;
    roleCode: number;
  }

  interface User extends BaseEntity {
    oauthId?: string;
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
    title: string;
    employeeId: string;
    roleId?: string;
    companyId?: string;
    accountType?: string;
    active?: boolean;
    role?: Role;
    company?: Company;
    department?: Department;
    assets?: Asset[];
    licenses?: License[];
    accessories?: Accessory[];
    userItem: UserItems[];
  }

  interface Company {
    targetEnergy: any;
    targetCarbonReduction: any;
    // Primary fields
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    employeeCount: number | null;

    // Relations
    users?: User[];
    assets?: Asset[];
    accessories?: Accessory[];
    categories?: Category[];
    departments?: Department[];
    locations?: DepartmentLocation[];
    manufacturers?: Manufacturer[];
    models?: Model[];
    inventories?: Inventory[];
    statusLabels?: StatusLabel[];
    auditLogs?: AuditLog[];
    kits?: Kit[];
    suppliers?: Supplier[];
    License?: License[];
    FormTemplate?: FormTemplate[];
    userItem?: UserItem[];
    AccessoryStock?: AccessoryStock[];
    LicenseSeat?: LicenseSeat[];
    AssetHistory?: AssetHistory[];
    ReportConfiguration?: ReportConfiguration[];
    GeneratedReport?: GeneratedReport[];
    Subscription?: Subscription[];
  }

  // ==================== Asset Management Types ====================

  interface FormTemplateValues {
    id: string;
    templateId: string;
    assetId: string;
    values: any[];
  }

  interface Co2eRecord {
    details: any;
    id: string;
    assetId: string;
    itemType: "Asset" | "Accessory";
    userId?: string | null;
    co2e: number;
    units: string;
    co2eType: string;
    sourceOrActivity: string;
    createdAt: Date;
    updatedAt: Date;
    accessoryId?: string | null;
  }

  interface Asset extends BaseEntity {
    name: string;
    poNumber: string;
    material?: string;
    modelId: string;
    datePurchased: Date;
    endOfLife: Date;
    serialNumber: string;
    companyId: string;
    supplierId: string;
    price: number;
    energyRating?: string;
    dailyOperationHours?: number;
    Co2eRecord?: Co2eRecord[];
    status: string;
    // Optional fields
    certificateUrl?: string;
    licenceUrl?: string;
    assigneeId?: string;
    licenseId?: string;
    locationId?: string;
    departmentId?: string;
    statusLabelId?: string;
    inventoryId?: string;
    // Relations
    formTemplate?: {
      id: string;
      name: string;
      fields: any[];
      companyId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    formTemplateValues?: FormTemplateValues[];
    assignee?: User;
    license?: License;
    category?: Category;
    departmentLocation?: DepartmentLocation;
    department?: Department;
    statusLabel?: StatusLabel;
    inventory?: Inventory;
    model?: Model;
    auditLogs?: AuditLog[];
    assetHistory?: AssetHistory[];
  }

  interface License extends BaseEntity {
    [x: string]: any;
    name: string;
    licensedEmail: string;
    poNumber: string;
    licenseKey?: string;
    companyId: string;
    renewalDate: Date;
    purchaseDate: Date;
    seats: number;
    purchasePrice: number;
    minSeatsAlert: number;
    alertRenewalDays: number;

    // Optional fields
    statusLabelId?: string | null;
    supplierId?: string | null;
    departmentId?: string | null;
    locationId?: string | null;
    inventoryId?: string | null;
    purchaseNotes?: string | null;
    LicenseUrl?: string | null;

    // Relations
    company?: Company | null;
    assets?: Asset[] | null;
    statusLabel?: StatusLabel | null;
    supplier?: Supplier | null;
    department?: Department | null;
    departmentLocation?: DepartmentLocation | null;
    inventory?: Inventory | null;
    category?: Category | null;
    model?: Model | null;
    users?: UserItems[] | null;
    userLicenses?: UserItems[] | null;
    currentAssignments?: UserItems[] | null;
    LicenseSeats?: LicenseSeat[] | null;
    auditLogs?: AuditLog[] | null;
  }

  interface Accessory extends BaseEntity {
    name: string;
    companyId: string;
    alertEmail: string;
    reorderPoint: number;
    totalQuantityCount: number;
    purchaseDate: Date;
    material: string;
    weight: number;
    endOfLife: Date;
    modelId: string | null;

    // Optional fields
    price?: number;
    notes?: string | null;
    statusLabelId?: string | null;
    supplierId?: string | null;
    departmentId?: string | null;
    locationId?: string | null;
    inventoryId?: string | null;
    categoryId?: string | null;
    poNumber?: string | null;
    assigneeId?: string | null;
    licenseId?: string | null;
    serialNumber?: string | null;
    energyRating?: string | null;
    dailyOperationHours?: number | null;
    co2Score?: number | null;
    modelNumber?: string | null;
    // Relations

    statusLabel?: StatusLabel | null;
    supplier?: Supplier | null;
    department?: Department | null;
    departmentLocation?: DepartmentLocation | null;
    inventory?: Inventory | null;
    company?: Company;
    assignee?: User | null;
    category?: Category | null;
    license?: License | null;
    userAccessories?: UserItems[] | null;
    auditLogs?: AuditLog[] | null;
  }

  // ==================== History Types ====================
  interface AssetHistory extends BaseEntity {
    assetId: string;
    type: "purchase" | "assignment" | "return" | "disposal" | "status_change";
    date: Date;
    notes?: string | null;
    companyId: string;

    // Relations
    asset: Asset;
    company: Company;
  }

  // ==================== Organizational Types ====================
  interface Category extends BaseEntity {
    name: string;
    active: boolean;
    note?: string;
  }

  interface Department extends BaseEntity {
    name: string;
    active: boolean;
    note?: string;
    companyId?: string;
    company?: Company;
  }

  interface Inventory extends BaseEntity {
    id: string;
    name: string;
    companyId?: string;
    company?: Company;
    active: boolean;
  }

  interface Supplier extends BaseEntity, AddressFields {
    name: string;
    contactName: string;
    email: string;
    phoneNum: string | null;
    url: string | null;
    notes: string | null;
    companyId: string;
    asset?: Asset[];
  }

  interface DepartmentLocation extends BaseEntity, AddressFields {
    name: string;
    companyId?: string;
    active: boolean;
  }

  interface Manufacturer extends BaseEntity {
    name: string;
    active: boolean;
    url: string;
    supportUrl: string;
    supportPhone: string;
    supportEmail: string;
    models?: Model[];
  }

  interface Model extends BaseEntity {
    name: string;
    active: boolean;
    modelNo: string;
    categoryId: string;
    manufacturerId: string;
    assets?: Asset[];
    category?: Category;
    manufacturer?: Manufacturer;
  }

  interface UserItems {
    id: string;
    userId: string;
    accessoryId: string;
    quantity: number;
    assignedAt: Date;
    returnedAt?: Date | null;
    notes?: string | null;
    companyId: string;
    user: User;
    accessory: Accessory;
    company: Company;
  }

  // interface LicenseAssignment {
  //   id: string;
  //   userId: string;
  //   licenseId: string;
  //   assignedAt: Date;
  //   expiresAt?: Date | null;
  //   seatsAssigned: number;
  //   user?: User;
  //   license?: License;
  // }

  interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId?: string | null;
    details?: string | null;
    userId: string;
    companyId: string;
    createdAt: Date;
    ipAddress?: string | null;
    dataAccessed?: Record<string, any> | null;
    company: {
      id: string;
      name?: string;
    };
    user: true;
  }

  // ==================== Component Props ====================
  interface CategoryTableProps {
    licenses: Category[];
    deleteCategory: (id: string) => void;
    setRefresh: (flag: boolean) => void;
  }

  interface CategoryProps {
    category: CategoryCount;
  }

  interface DoughnutChartProps {
    accounts: Account[];
  }

  interface CompanyRegistrationProps {
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  }

  // ==================== Registration Types ====================
  interface RegUser {
    email: string;
    password: string;
    roleId?: string;
    title: string;
    employeeId: string;
    companyId: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }

  // Note: These types need to be defined elsewhere
  type CategoryCount = any;
  type Account = any;
}

// Empty export to ensure this is treated as a module
export {};
