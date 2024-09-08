/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================


declare type StatusLabel = {
    id?: string;
    name: string;
    colorCode: string;
    description: string;
    isArchived: boolean;
    allowLoan: boolean;
};

declare type User = {
    id?: string;
    oauthId?: string;
    email: string;
    name: string;
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


declare type  APICallResponse = {
    success: boolean;
    message: string;
}


declare type RegUser = {
    email: string;
    password: string,
    roleId?: string,
    companyId: string,
    firstName?: string,
    lastName?: string,
    phoneNumber?: string
};

declare type Role = {
    id?: string;
    name: string;
    note: string;
    roleCode: number;
    createdAt: Date;
    updatedAt: Date;
};


declare type Accessory = {
    id?: string;
    title: string;
    purchaseDate: Date;
    vendor: string;
    alertEmail: string
    minQuantityAlert: number
    totalQuantityCount: number
    description: string;
    categoryId: string;
    companyId: string;
    createdAt: Date
    updatedAt: Date
}

declare type Kit = {
    id?: string;
    name: string;
    description: String;
}


declare type Asset = {
    id?: string;
    name: string;
    assignee?: User;
    assigneeId?: string;
    categoryId: string;
    brand: string;
    model: string;
    datePurchased: string;
    price: number;
    certificateUrl?: string;
    licenceUrl?: string;
    license?: License;
    serialNumber: string;
    companyId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    category?: Category;
    licenseId?: string;
    statusLabelId?: string;
    statusLabel?: StatusLabel;
}

declare type Category = {
    id?: string;
    name: string;
    note?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

declare type License = {
    id?: string;
    name: string;
    licenseKey: string;
    renewalDate: Date;
    licenseUrl?: string;
    licensedEmail: string;
    purchaseDate: Date;
    vendor: string;
    purchaseNotes: string;
    minCopiesAlert: number;
    alertRenewalDays: number;
    licenseCopiesCount: number;
    purchasePrice: number;
    createdAt?: Date;
    updatedAt?: Date;
};


declare interface RecentTransactionsProps {
    accounts: Account[];
    transactions: Transaction[];
    appwriteItemId: string;
    page: number;
}

declare interface TransactionHistoryTableProps {
    transactions: Transaction[];
    page: number;
}

declare interface CategoryBadgeProps {
    category: string;
}


declare interface AssetTableProps {
    assets: Asset[];
    deleteAsset: (id: string) => void;
    findById: (id: string) => void;
}

declare interface UserTableProps {
    users: User[];
    deleteUser: (id: string) => void;
    findById: (id: string) => void;
}

declare interface CategoryTableProps {
    licenses: Category[];
    deleteCategory: (id: string) => void;
    setRefresh: (flag: boolean) => void;

}

declare interface LicenseTableProps {
    licenses: License[];
}


declare interface CategoryProps {
    category: CategoryCount;
}

declare interface DoughnutChartProps {
    accounts: Account[];
}

declare interface PaymentTransferFormProps {
    accounts: Account[];
}

declare interface CompanyRegistrationProps {
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
}

