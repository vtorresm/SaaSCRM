import { CompanyStatus } from '@prisma/client';

export class CreateCompanyDto {
    name: string;
    legalName?: string;
    taxId?: string;
    status?: CompanyStatus;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phone?: string;
    website?: string;
    paymentTerms?: number;
    currency?: string;
    taxRate?: number;
}