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
    $id: string;
    email: string;
    userId: string;
    dwollaCustomerUrl: string;
    dwollaCustomerId: string;
    firstName: string;
    lastName: string;
    name: string
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth: string;
    ssn: string;
};

declare type NewUserParams = {
    userId: string;
    email: string;
    name: string;
    password: string;
};

declare type Account = {
    id: string;
    availableBalance: number;
    currentBalance: number;
    officialName: string;
    mask: string;
    institutionId: string;
    name: string;
    type: string;
    subtype: string;
    appwriteItemId: string;
    shareable: string;
};

declare type Transaction = {
    id: string;
    $id: string;
    name: string;
    paymentChannel: string;
    accountId: string;
    amount: number;
    pending: boolean;
    category: string;
    date: string;
    image: string;
    type: string;
    $createdAt: string;
    channel: string;
    senderBankId: string;
    receiverBankId: string;
};


// declare type Asset = {
//   id?: number;
//   // $id: string;
//   // name: string;
//   // manufacturer: string;
//   // model: string;
//   serialNumber: string;
//   description: string;
//   price: number;
//   shipped: boolean;
//   categoryId: number;
//   date: string;
//   image: string;
//   createdAt: string;
// };

declare type Asset = {
    id?: number;
    name: string;
    assigneeId: string;
    categoryId: number;
    brand: string;
    model: string;
    location: string;
    datePurchased: string;
    purchasePrice: number;
    price: number;
    certificateUrl?: string;
    licenceUrl?: string;
    serialNumber?: string;
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

declare type LicenseType = {
    id?: string;
    name: string;
    key: string;
    issuedDate: Date;
    expirationDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

declare type Bank = {
    $id: string;
    accountId: string;
    bankId: string;
    accessToken: string;
    fundingSourceUrl: string;
    userId: string;
    shareableId: string;
};

declare type AccountTypes =
    | "depository"
    | "credit"
    | "loan "
    | "investment"
    | "other";

// declare type Category = "Food and Drink" | "Travel" | "Transfer";

declare type CategoryCount = {
    name: string;
    count: number;
    totalCount: number;
};

declare type Receiver = {
    firstName: string;
    lastName: string;
};

declare type TransferParams = {
    sourceFundingSourceUrl: string;
    destinationFundingSourceUrl: string;
    amount: string;
};

declare type AddFundingSourceParams = {
    dwollaCustomerId: string;
    processorToken: string;
    bankName: string;
};

declare type NewDwollaCustomerParams = {
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth: string;
    ssn: string;
};

declare interface CreditCardProps {
    account: Account;
    userName: string;
    showBalance?: boolean;
}

declare interface BankInfoProps {
    account: Account;
    appwriteItemId?: string;
    type: "full" | "card";
}

declare interface HeaderBoxProps {
    type?: "title" | "greeting";
    title: string;
    subtext: string;
    user?: string;
}

declare interface MobileNavProps {
    user: User;
}

declare interface PageHeaderProps {
    topTitle: string;
    bottomTitle: string;
    topDescription: string;
    bottomDescription: string;
    connectBank?: boolean;
}

declare interface PaginationProps {
    page: number;
    totalPages: number;
}

declare interface PlaidLinkProps {
    user: User;
    variant?: "primary" | "ghost";
    dwollaCustomerId?: string;
}

// declare type User = sdk.Models.Document & {
//   accountId: string;
//   email: string;
//   name: string;
//   items: string[];
//   accessToken: string;
//   image: string;
// };

declare interface AuthFormProps {
    type: "sign-in" | "sign-up";
}

declare interface BankDropdownProps {
    accounts: Account[];
    setValue?: UseFormSetValue<any>;
    otherStyles?: string;
}

declare interface BankTabItemProps {
    account: Account;
    appwriteItemId?: string;
}

declare interface TotlaBalanceBoxProps {
    accounts: Account[];
    totalBanks: number;
    totalCurrentBalance: number;
}

declare interface FooterProps {
    user?: User;
    type?: 'mobile' | 'desktop'
}

declare interface RightSidebarProps {
    user?: User;
    transactions?: Transaction[];
    banks?: Bank[] & Account[];
}

declare interface SiderbarProps {
    user?: User;
}

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
    deleteAsset: (id: number) => Promise<Asset>;
    findById: (id: number) => Promise<Asset>;
}

declare interface CategoryTableProps {
    licenses: Category[];
    deleteCategory: (id: number) => Promise<Asset>;
}

declare interface LicenseTableProps {
    licenses: LicenseType[];
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

// Actions
declare interface CompanyRegistrationProps {
   companyName: string;
   email: string;
   password: string;
   phoneNumber: string;
   firstName: string;
   lastName: string;
}




declare interface getAccountProps {
    appwriteItemId: string;
}

declare interface getInstitutionProps {
    institutionId: string;
}

declare interface getTransactionsProps {
    accessToken: string;
}

declare interface CreateFundingSourceOptions {
    customerId: string; // Dwolla Customer ID
    fundingSourceName: string; // Dwolla Funding Source Name
    plaidToken: string; // Plaid Account Processor Token
    _links: object; // Dwolla On Demand Authorization Link
}

declare interface CreateTransactionProps {
    name: string;
    amount: string;
    senderId: string;
    senderBankId: string;
    receiverId: string;
    receiverBankId: string;
    email: string;
}

declare interface getTransactionsByBankIdProps {
    bankId: string;
}

declare interface signInProps {
    email: string;
    password: string;
}

declare interface getUserInfoProps {
    userId: string;
}

declare interface exchangePublicTokenProps {
    publicToken: string;
    user: User;
}

declare interface createBankAccountProps {
    accessToken: string;
    userId: string;
    accountId: string;
    bankId: string;
    fundingSourceUrl: string;
    shareableId: string
}

declare interface getBanksProps {
    userId: string;
}

declare interface getBankProps {
    documentId: string;
}

declare interface getBankByAccountIdProps {
    accountId: string;
}
