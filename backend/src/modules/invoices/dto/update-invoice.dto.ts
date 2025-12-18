import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
    /**
     * Al actualizar items, se reemplazarán TODOS los items existentes.
     * Esta es la estrategia Sprint 6 (futuro: upsert granular).
     */
    items?: CreateInvoiceDto['items'];
}