import { ApiProperty } from '@nestjs/swagger';
import { QuoteStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateQuoteStatusDto {
    @ApiProperty({ enum: QuoteStatus, example: QuoteStatus.SENT })
    @IsEnum(QuoteStatus, { message: 'Estado de cotización inválido' })
    status: QuoteStatus;
}