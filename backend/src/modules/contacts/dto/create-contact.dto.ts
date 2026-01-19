import { ContactStatus } from '@prisma/client';

export class CreateContactDto {
    firstName!: string;
    lastName!: string;
    email?: string;
    phone?: string;
    position?: string;
    status?: ContactStatus;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    companyId!: string;
    source?: string;
    assignedToId?: string;
}