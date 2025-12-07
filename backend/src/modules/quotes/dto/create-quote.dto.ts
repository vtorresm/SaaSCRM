import { QuoteStatus, QuotePriority } from '@prisma/client';

export class CreateQuoteDto {
    title: string;
    description?: string;
    status?: QuoteStatus;
    priority?: QuotePriority;
    subtotal?: number;
    taxRate?: number;
    discountAmount?: number;
    clientId: string;
    assignedToId: string;
    createdById: string;
    validUntil?: Date;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        unit?: string;
        discount?: number;
        taxRate?: number;
    }[];
}