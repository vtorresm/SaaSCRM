import { Injectable, BadRequestException } from '@nestjs/common';

export interface CalculatedItem {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxType: string;
    order: number;
    totalPrice: number;
}

export interface CalculatedTotals {
    items: CalculatedItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    dueAmount: number;
}

export interface QuoteCalculatedItem {
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    discount: number;
    taxRate: number;
    order: number;
    totalPrice: number;
    serviceId?: string | null;
    taxType?: string;
}

export interface QuoteCalculatedTotals {
    items: QuoteCalculatedItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    dueAmount: number;
}

const TAX_RATES: Record<string, number> = {
    'IVA_18': 0.18,
    'IVA_10': 0.10,
    'EXEMPT': 0.0,
};

@Injectable()
export class CalculatorService {
    /**
     * Calcula los totales de una factura
     */
    calculateInvoiceTotals(
        inputItems: { description: string; quantity: number; unitPrice: number; discount?: number; taxRate?: number; taxType?: string; order?: number }[],
        defaultTaxRate = 0.18
    ): CalculatedTotals {
        if (!inputItems || inputItems.length === 0) {
            throw new BadRequestException('La factura debe tener al menos un item');
        }

        let subtotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        const items: CalculatedItem[] = inputItems.map((item, index) => {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);

            const discount = Number(item.discount ?? 0);
            const taxRate = TAX_RATES[item.taxType || ''] || Number(item.taxRate ?? defaultTaxRate);
            const order = Number(item.order ?? index);

            const lineSubtotal = quantity * unitPrice;
            const netBeforeTax = Math.max(lineSubtotal - discount, 0);
            const lineTax = netBeforeTax * taxRate;
            const totalPrice = netBeforeTax + lineTax;

            subtotal += netBeforeTax;
            discountAmount += discount;
            taxAmount += lineTax;
            totalAmount += totalPrice;

            return {
                description: item.description,
                quantity,
                unitPrice,
                discount,
                taxRate,
                taxType: item.taxType || 'IVA_18',
                order,
                totalPrice,
            };
        });

        return {
            items,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            dueAmount: totalAmount,
        };
    }

    /**
     * Calcula los totales de una cotización
     */
    calculateQuoteTotals(
        inputItems: { description: string; quantity: number; unitPrice: number; unit?: string; discount?: number; taxRate?: number; order?: number; serviceId?: string | null }[],
        defaultTaxRate = 0.18
    ): QuoteCalculatedTotals {
        if (!inputItems || inputItems.length === 0) {
            throw new BadRequestException('La cotización debe tener al menos un item');
        }

        let subtotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        const items: QuoteCalculatedItem[] = inputItems.map((item, index) => {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);

            const discount = Number(item.discount ?? 0);
            const taxRate = Number(item.taxRate ?? defaultTaxRate);
            const order = Number(item.order ?? index);

            const lineSubtotal = quantity * unitPrice;
            const netBeforeTax = Math.max(lineSubtotal - discount, 0);
            const lineTax = netBeforeTax * taxRate;
            const totalPrice = netBeforeTax + lineTax;

            subtotal += netBeforeTax;
            discountAmount += discount;
            taxAmount += lineTax;
            totalAmount += totalPrice;

            return {
                description: item.description,
                quantity,
                unitPrice,
                unit: item.unit ?? 'unit',
                discount,
                taxRate,
                order,
                totalPrice,
                serviceId: item.serviceId ?? null,
                taxType: 'IVA_18',
            };
        });

        return { items, subtotal, discountAmount, taxAmount, totalAmount, dueAmount: totalAmount };
    }
}
