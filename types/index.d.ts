/* eslint-disable no-unused-vars */

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

    // type SelectWithButtonProps = {
    //     name: string;
    //     label: string;
    //     form: useForm();
    //     data: any[];
    //     onNew: () => void;
    //     placeholder: string;
    //     required?: boolean;
    //     isPending: boolean;
    // }

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
        id?: string;
        oauthId?: string;
        email: string;
        name?: string;
        firstName: string;
        lastName: string;
        title: string;
        employeeId: string;
        createdAt?: Date;
        updatedAt?: Date;
        roleId?: string;
        companyId?: string;
        role?: Role;
        company?: Company;
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


    
    // type Accessory = {
    //     id?: string;
    //     title: string;
    //     purchaseDate: Date;
    //     price: number;
    //     poNumber: string;
    //     endOfLife: Date;
    //     vendor: string;
    //     alertEmail: string;
    //     minQuantityAlert: number;
    //     totalQuantityCount: number;
    //     description: string;
    //     categoryId: string;
    //     companyId: string;
    //     material: string;
    // };

     type Accessory = {
        id: string;
        title: string;
        alertEmail: string;
        reorderPoint: number;
        totalQuantityCount: number;
        purchaseDate: Date;
        notes?: string | null;
        material: string;
        weight: number; // Assuming Decimal is represented as a number
        endOfLife: Date;
        companyId: string;
        modelId?: string | null;
        statusLabelId?: string | null;
        supplierId?: string | null;
        departmentId?: string | null;
        locationId?: string | null;
        inventoryId?: string | null;
        categoryId?: string | null;
        poNumber?: string | null;
        price?: number | null;
        company: Company;
        model?: Model | null;
        statusLabel?: StatusLabel | null;
        supplier?: Supplier | null;
        department?: Department | null;
        departmentLocation?: DepartmentLocation | null;
        inventory?: Inventory | null;
    };

    type Asset = {
        id?: string;
        name: string;
        poNumber: string;
        assignee?: User;
        assigneeId?: string;
        material?: string;
        weigh?: number;
        modelId: string;
        datePurchased: Date;
        price: number;
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
        location?: Location;
        departmentId?: string;
        department?: Department
        statusLabelId?: string;
        statusLabel?: StatusLabel;
        inventoryId?: string;
        inventory?: Inventory;
    };


    export type License = {
        id: string;
        name: string;
        licensedEmail: string;
        poNumber: string;
        licenseKey: string;
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
        minCopiesAlert: number;
        alertRenewalDays: number;
        licenseCopiesCount: number;
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
    };

    // type License = {
    //     id?: string;
    //     name: string;
    //     licenseKey: string;
    //     renewalDate: Date;
    //     licenseUrl?: string;
    //     licensedEmail: string;
    //     purchaseDate: Date;
    //     vendor: string;
    //     purchaseNotes: string;
    //     minCopiesAlert: number;
    //     alertRenewalDays: number;
    //     licenseCopiesCount: number;
    //     purchasePrice: number;
    //     createdAt?: Date;
    //     updatedAt?: Date;
    // };



    // ==================== Reusable Interfaces ====================
    interface BaseEntity {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }

    interface AddressFields {
        addressLine1: string;
        addressLine2: string;
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
        phone: string;
        contactName: string;
        email: string;
        phoneNum: string;
        url: string;
        notes: string;
        asset?: Asset[];
    };

    type Location = BaseEntity & {
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
