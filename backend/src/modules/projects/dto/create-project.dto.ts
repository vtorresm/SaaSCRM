import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateProjectDto {
    @ApiProperty({ description: 'Nombre del proyecto', example: 'Rediseño Web Acme Corp' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Descripción del proyecto' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.PLANNING })
    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;

    @ApiPropertyOptional({ description: 'Presupuesto total', example: 50000 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    budget?: number;

    @ApiPropertyOptional({ description: 'Tarifa por hora', example: 75 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    hourlyRate?: number;

    @ApiPropertyOptional({ description: 'Horas estimadas', example: 200 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedHours?: number;

    @ApiPropertyOptional({ description: 'Fecha de inicio', example: '2025-01-15' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de entrega', example: '2025-06-15' })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ description: 'ID de la empresa cliente' })
    @IsString()
    companyId: string;

    @ApiPropertyOptional({ description: 'ID de la cotización asociada' })
    @IsString()
    @IsOptional()
    quoteId?: string;

    @ApiProperty({ description: 'ID del creador' })
    @IsString()
    createdById: string;
}
