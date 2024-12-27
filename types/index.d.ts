/* eslint-disable no-unused-vars */


import {string} from "yup";
import {Company} from "@prisma/client";

declare global {
    // ==================== Basic Types ====================
    type SearchParamProps = {
        params: { [key: string]: string };
        searchParams: { [key: string]: string | string[] | undefined };
    };


    type APICallResponse = {
        success: boolean;
        message?: string;
        error?: string;
    };

    type KitItem = {
        id: string;
        itemId: string;
        quantity: number;
        remaining: number;
    };

    type Kit = {
        id: string;
        name: string;
        description: string;
        assets: KitItem[];
        licenses: KitItem[];
        accessories: KitItem[];
    };

    type KitAsset = {
        id: string;
        kitId: string;
        assetId: string;
    };


    // ==================== Entity Types ====================
    type StatusLabel = {
        id?: string;
        name: string;
        colorCode: string;
        description: string;
        isArchived: boolean;
        allowLoan: boolean;
    };

    type Role = {
        id?: string;
        name: string;
        note: string;
        roleCode: number;
        createdAt: Date;
        updatedAt: Date;
    };

    type User = {
        id?: string,
        oauthId?: string,
        email: string,
        name?: string,
        firstName: string,
        lastName: string,
        title: string,
        employeeId: string,
        createdAt?: Date,
        updatedAt?: Date,
        roleId?: string,
        companyId?: string,
        role?: Role,
        company?: Company,
        accountType?: string
        active?: boolean
        department?: Department
        assets?: Asset[]
        licenses?: License[]
        accessories?: Accessory[]
    };

    type RegUser = {
        email: string;
        password: string;
        roleId?: string;
        title: string;
        employeeId: string;
        companyId: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
    };


    type Accessory = {
        id: string;
        name: string;
        companyId: string;
        alertEmail: string;
        reorderPoint: number;
        totalQuantityCount: number;
        purchaseDate: Date;
        material: string;
        weight: number;
        price?: number;
        endOfLife: Date;
        notes: string | null;  // Changed from string | undefined to string | null
        modelId: string | null;
        statusLabelId: string | null;
        supplierId: string | null;
        departmentId: string | null;
        locationId: string | null;
        inventoryId: string | null;
        categoryId: string | null;
        poNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        assigneeId?: string | null;
        licenseId?: string | null;
        serialNumber?: string | null;

        energyRating?: string | null;
        dailyOperationHours?: number | null;
        co2Score?: number | null;

        // Optional relations
        model?: Model | null;
        statusLabel?: StatusLabel | null;
        supplier?: Supplier | null;
        department?: Department | null;
        departmentLocation?: DepartmentLocation | null;
        inventory?: Inventory | null;
        company?: Company;
        assignee?: User | null;
        category?: Category | null;
        license?: License | null;
    };

     type DetailFieldType = {
       label: string;
        value: string;
        type: 'status' | 'date' | 'text' | 'currency';
    };

    type formTemplateValues = {
        id: string;
        templateId: string;
        assetId: string;
        values: any[];
    }

    type Asset = {
        id?: string;
        formTemplate: {
            id: string;
            name: string;
            fields: any[];
            companyId: string;
            createdAt: Date;
            updatedAt: Date;
        }
        formTemplateValues: formTemplateValues[]
        name: string;
        poNumber: string;
        assignee?: User;
        assigneeId?: string;
        material?: string;
        modelId: string;
        datePurchased: Date;
        endOfLife: Date;
        certificateUrl?: string;
        licenceUrl?: string;
        license?: License;
        serialNumber: string;
        companyId: string;
        supplierId: string;
        createdAt?: Date;
        updatedAt?: Date;
        category?: Category;
        licenseId?: string;
        locationId?: string;
        departmentLocation?: DepartmentLocation;
        departmentId?: string;
        department?: Department
        statusLabelId?: string;
        statusLabel?: StatusLabel;
        inventoryId?: string;
        inventory?: Inventory;
        weight?: number;
        price: number;
        energyRating?: string;
        dailyOperationHours?: number;
        model?: Model;
        co2Score?: number;
    };


    export type License = {
        id: string;
        name: string;
        licensedEmail: string;
        poNumber: string;
        licenseKey?: string;
        companyId: string;
        statusLabelId?: string | null;
        supplierId?: string | null;
        departmentId?: string | null;
        locationId?: string | null;
        inventoryId?: string | null;
        renewalDate: Date;
        purchaseDate: Date;
        purchaseNotes?: string | null;
        licenseUrl?: string | null;
        minSeatsAlert: number;
        alertRenewalDays: number;
        seats: number;
        purchasePrice: Number;
        createdAt: Date;
        updatedAt: Date;

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
        users?: LicenseAssignment[] | null;
    };



    type LicenseAssignment = {
        id: string;
        userId: string;
        licenseId: string;
        assignedAt: Date;
        expiresAt?: Date | null;
        seatsAssigned: number;

        // Relations
        user?: User; // Assuming 'User' is already defined
        license?: License; // Assuming 'License' is already defined
    };

    // ==================== Reusable Interfaces ====================
    interface BaseEntity {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }

    interface AddressFields {
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        zip: string;
        country: string;
    }

    // ==================== Extended Types with Base Interfaces ====================
    type Category = BaseEntity & {
        name: string;
        note?: string;
    };

    type Department = BaseEntity & {
        name: string;
        note?: string;
        companyId?: string;
        company?: Company;
    };

    type Inventory = BaseEntity & {
        name: string;
        companyId?: string;
        company?: Company;
    };

    type Supplier = BaseEntity & AddressFields & {
        name: string;
        contactName: string;
        email: string;
        phoneNum: string | null;  // Using phoneNum instead of phone
        url: string | null;
        notes: string | null;
        asset?: Asset[];
        companyId: string;  // Add this if it's required by Prisma
    };

    type DepartmentLocation = BaseEntity & {
        name: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        companyId?: string;
    };

    type Manufacturer = BaseEntity & {
        name: string;
        url: string;
        supportUrl: string;
        supportPhone: string;
        supportEmail: string;
        models?: Model[];
    };

    type ActionResponse<T> = {
        data?: T;
        error?: string;
        success?: boolean;
    };


    type Model = BaseEntity & {
        name: string;
        modelNo: string;
        categoryId: string;
        manufacturerId: string;
        assets?: Asset[];
        category?: Category;
        manufacturer?: Manufacturer;
    };


    type CSVRow = {
        [key: string]: string
    }
}

// ==================== Props for Components ====================
export interface CategoryBadgeProps {
    category: string;
}

export interface AssetTableProps {
    assets: Asset[];
    deleteAsset: (id: string) => void;
    findById: (id: string) => void;
}

export interface UserTableProps {
    users: User[];
    deleteUser: (id: string) => void;
    findById: (id: string) => void;
}

export interface CategoryTableProps {
    licenses: Category[];
    deleteCategory: (id: string) => void;
    setRefresh: (flag: boolean) => void;
}

export interface LicenseTableProps {
    licenses: License[];
}

export interface CategoryProps {
    category: CategoryCount;
}

export interface DoughnutChartProps {
    accounts: Account[];
}

export interface PaymentTransferFormProps {
    accounts: Account[];
}

export interface CompanyRegistrationProps {
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
}

export {}; // Ensure this file is treated as a module
