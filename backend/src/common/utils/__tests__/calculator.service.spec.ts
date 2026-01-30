import { BadRequestException } from '@nestjs/common';
import { CalculatorService, CalculatedTotals, QuoteCalculatedTotals } from '../calculator.service';

describe('CalculatorService', () => {
    let service: CalculatorService;

    beforeEach(() => {
        service = new CalculatorService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateInvoiceTotals', () => {
        it('should calculate totals correctly for valid items', () => {
            const items = [
                { description: 'Item 1', quantity: 2, unitPrice: 100, discount: 0, taxType: 'IVA_18', order: 0 },
                { description: 'Item 2', quantity: 1, unitPrice: 50, discount: 10, taxType: 'IVA_18', order: 1 },
            ];

            const result = service.calculateInvoiceTotals(items);

            // Item1: (2*100) = 200, discount 0, tax = 200 * 0.18 = 36, total = 236
            // Item2: (1*50-10=40), tax = 40 * 0.18 = 7.2, total = 47.2
            expect(result.items[0].totalPrice).toBe(236);
            expect(result.items[1].totalPrice).toBe(47.2);
            expect(result.subtotal).toBe(240); // 200 + 40 = 240
            expect(result.discountAmount).toBe(10);
            expect(result.taxAmount).toBe(43.2); // 36 + 7.2 = 43.2
            expect(result.totalAmount).toBe(283.2); // 240 + 43.2 = 283.2
            expect(result.dueAmount).toBe(283.2);
        });

        it('should throw BadRequestException for empty items', () => {
            expect(() => service.calculateInvoiceTotals([])).toThrow(BadRequestException);
            expect(() => service.calculateInvoiceTotals([])).toThrow('La factura debe tener al menos un item');
        });

        it('should throw BadRequestException for null items', () => {
            expect(() => service.calculateInvoiceTotals(null as any)).toThrow(BadRequestException);
        });

        it('should calculate correctly with custom tax rate', () => {
            const items = [
                { description: 'Item 1', quantity: 1, unitPrice: 100, taxRate: 0.10, order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items, 0.10);

            expect(result.items[0].totalPrice).toBe(110); // 100 + 10% tax
            expect(result.taxAmount).toBe(10);
            expect(result.totalAmount).toBe(110);
        });

        it('should handle EXEMPT tax type', () => {
            const items = [
                { description: 'Item 1', quantity: 1, unitPrice: 100, taxType: 'EXEMPT', order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items);

            expect(result.items[0].totalPrice).toBe(100);
            expect(result.items[0].taxType).toBe('EXEMPT');
            expect(result.taxAmount).toBe(0);
        });

        it('should handle IVA_10 tax type', () => {
            const items = [
                { description: 'Item 1', quantity: 1, unitPrice: 100, taxType: 'IVA_10', order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items);

            expect(result.items[0].totalPrice).toBe(110);
            expect(result.items[0].taxType).toBe('IVA_10');
            expect(result.taxAmount).toBe(10);
        });

        it('should handle items with zero quantity', () => {
            const items = [
                { description: 'Item 1', quantity: 0, unitPrice: 100, order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items);

            expect(result.items[0].totalPrice).toBe(0);
            expect(result.subtotal).toBe(0);
            expect(result.totalAmount).toBe(0);
        });

        it('should use default tax rate when not specified', () => {
            const items = [
                { description: 'Item 1', quantity: 1, unitPrice: 100, order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items, 0.18);

            expect(result.items[0].totalPrice).toBe(118);
            expect(result.taxAmount).toBe(18);
        });

        it('should handle large quantities and prices', () => {
            const items = [
                { description: 'Item 1', quantity: 1000, unitPrice: 999.99, discount: 1000, order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items);

            // (1000 * 999.99 - 1000) = 998990
            expect(result.subtotal).toBe(998990);
            expect(result.discountAmount).toBe(1000);
        });

        it('should not allow negative net amount', () => {
            const items = [
                { description: 'Item 1', quantity: 1, unitPrice: 50, discount: 100, order: 0 },
            ];

            const result = service.calculateInvoiceTotals(items);

            // net before tax = max(50 - 100, 0) = 0
            expect(result.subtotal).toBe(0);
            expect(result.items[0].totalPrice).toBe(0);
        });
    });

    describe('calculateQuoteTotals', () => {
        it('should calculate totals correctly for quote items', () => {
            const items = [
                { description: 'Service 1', quantity: 2, unitPrice: 100, unit: 'hour', discount: 0, taxRate: 0.18, order: 0 },
                { description: 'Service 2', quantity: 1, unitPrice: 50, unit: 'hour', discount: 5, taxRate: 0.18, order: 1 },
            ];

            const result = service.calculateQuoteTotals(items);

            // Service1: (2*100) = 200, tax = 36, total = 236
            // Service2: (1*50-5=45), tax = 8.1, total = 53.1
            expect(result.items[0].totalPrice).toBe(236);
            expect(result.items[1].totalPrice).toBe(53.1);
            expect(result.subtotal).toBe(245); // 200 + 45 = 245
            expect(result.discountAmount).toBe(5);
            expect(result.taxAmount).toBe(44.1); // 36 + 8.1 = 44.1
            expect(result.totalAmount).toBe(289.1); // 245 + 44.1 = 289.1
        });

        it('should throw BadRequestException for empty items', () => {
            expect(() => service.calculateQuoteTotals([])).toThrow(BadRequestException);
            expect(() => service.calculateQuoteTotals([])).toThrow('La cotización debe tener al menos un item');
        });

        it('should handle serviceId in items', () => {
            const items = [
                { description: 'Service 1', quantity: 1, unitPrice: 100, unit: 'hour', serviceId: 'service-uuid', order: 0 },
            ];

            const result = service.calculateQuoteTotals(items);

            expect(result.items[0].serviceId).toBe('service-uuid');
        });

        it('should use default unit when not specified', () => {
            const items = [
                { description: 'Service 1', quantity: 1, unitPrice: 100, order: 0 },
            ];

            const result = service.calculateQuoteTotals(items);

            expect(result.items[0].unit).toBe('unit');
        });

        it('should handle null serviceId', () => {
            const items = [
                { description: 'Service 1', quantity: 1, unitPrice: 100, serviceId: null, order: 0 },
            ];

            const result = service.calculateQuoteTotals(items);

            expect(result.items[0].serviceId).toBeNull();
        });

        it('should handle multiple items with different tax rates', () => {
            const items = [
                { description: 'Service 1', quantity: 1, unitPrice: 100, taxRate: 0.18, order: 0 },
                { description: 'Service 2', quantity: 1, unitPrice: 100, taxRate: 0.10, order: 1 },
            ];

            const result = service.calculateQuoteTotals(items);

            expect(result.items[0].totalPrice).toBe(118);
            expect(result.items[1].totalPrice).toBe(110);
            expect(result.taxAmount).toBe(28); // 18 + 10 = 28
        });

        it('should handle order parameter correctly', () => {
            const items = [
                { description: 'Item 3', quantity: 1, unitPrice: 100, order: 2 },
                { description: 'Item 1', quantity: 1, unitPrice: 100, order: 0 },
                { description: 'Item 2', quantity: 1, unitPrice: 100, order: 1 },
            ];

            const result = service.calculateQuoteTotals(items);

            expect(result.items[0].order).toBe(2);
            expect(result.items[1].order).toBe(0);
            expect(result.items[2].order).toBe(1);
        });
    });
});
