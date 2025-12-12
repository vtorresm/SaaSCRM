import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
    /**
     * Al actualizar items, se reemplazarán TODOS los items existentes.
     * Esta es la estrategia Sprint 5 (futuro: upsert granular).
     */
    items?: CreateQuoteDto['items'];
}