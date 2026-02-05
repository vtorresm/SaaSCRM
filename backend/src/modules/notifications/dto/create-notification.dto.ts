import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ description: 'Título de la notificación', example: 'Nueva cotización asignada' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Mensaje de la notificación' })
    @IsString()
    message: string;

    @ApiProperty({ description: 'Tipo de notificación', example: 'in_app', enum: ['email', 'push', 'in_app'] })
    @IsIn(['email', 'push', 'in_app'])
    type: string;

    @ApiPropertyOptional({ description: 'Tipo de entidad relacionada', example: 'Quote' })
    @IsString()
    @IsOptional()
    entityType?: string;

    @ApiPropertyOptional({ description: 'ID de la entidad relacionada' })
    @IsString()
    @IsOptional()
    entityId?: string;

    @ApiProperty({ description: 'ID del usuario destinatario' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Fecha programada de envío' })
    @IsDateString()
    @IsOptional()
    scheduledAt?: string;
}
