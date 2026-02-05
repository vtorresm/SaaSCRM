// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    phone?: string;
    profilePicture?: string;
    companyId?: string;
    createdAt: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'DEVELOPER' | 'CLIENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

// Company types
export interface Company {
    id: string;
    name: string;
    legalName?: string;
    taxId?: string;
    status: CompanyStatus;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    paymentTerms: number;
    currency: string;
    taxRate: number;
    createdAt: string;
}

export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CLIENT' | 'ARCHIVED';

// Contact types
export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position?: string;
    status: ContactStatus;
    companyId: string;
    company?: Company;
    createdAt: string;
}

export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CLIENT';

// Quote types
export interface Quote {
    id: string;
    quoteNumber: string;
    title: string;
    description?: string;
    status: QuoteStatus;
    priority: QuotePriority;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    validUntil?: string;
    clientId: string;
    client?: Company;
    items?: QuoteItem[];
    createdAt: string;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type QuotePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
    order: number;
}

// Project types
export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    budget?: number;
    hourlyRate?: number;
    estimatedHours?: number;
    actualHours: number;
    startDate?: string;
    dueDate?: string;
    companyId: string;
    company?: Company;
    tasks?: Task[];
    createdAt: string;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    estimatedHours?: number;
    actualHours: number;
    dueDate?: string;
    projectId: string;
    assignedToId?: string;
    order: number;
}

// Invoice types
export interface Invoice {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    issueDate: string;
    dueDate: string;
    clientId: string;
    client?: Company;
    items?: InvoiceItem[];
    createdAt: string;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
    order: number;
}

// Notification types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'email' | 'push' | 'in_app';
    read: boolean;
    readAt?: string;
    entityType?: string;
    entityId?: string;
    createdAt: string;
}

// API response types
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
