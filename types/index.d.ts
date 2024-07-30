/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================

declare type SignUpParams = {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth: string;
    ssn: string;
    email: string;
    password: string;
};

declare type LoginUser = {
    email: string;
    password: string;
};

declare type User = {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    createdAt?: Date;
    updatedAt?: Date;
    roleId?: number;
    companyId?: number;
    role?: Role;
    company?: Company;
};

declare type RegUser = {
    email: string;
    password: string,
    roleId: number,
    companyId: number,
    firstName?: string,
    lastName?: string,
    phoneNumber?: string
};

declare type Role = {
    id?: int;
    name: string;
    note: string;
    createdAt: Date;
    updatedAt: Date;
};


declare type Asset = {
    id?: number;
    name: string;
    assigneeId?: string;
    categoryId: number;
    brand: string;
    model: string;
    datePurchased: string;
    purchasePrice: number;
    certificateUrl?: string;
    licenceUrl?: string;
    license?: License;
    serialNumber: string;
    createdAt?: Date;
    updatedAt?: Date;
    category?: Category
}
declare type Category = {
    id?: string;
    name: string;
    note: string;
    createdAt?: Date;
    updatedAt?: Date;
};

declare type License = {
    id?: int;
    name: string;
    key: string;
    issuedDate: Date;
    expirationDate: Date;
    licenseUrl: string;
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
    deleteAsset: (id: number) => void;
    findById: (id: number) => void;
}

declare interface CategoryTableProps {
    licenses: Category[];
    deleteCategory: (id: number) => void;
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

