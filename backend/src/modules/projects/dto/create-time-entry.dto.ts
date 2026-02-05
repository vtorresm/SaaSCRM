import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateTimeEntryDto {
    @ApiPropertyOptional({ description: 'Descripción del trabajo realizado' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Horas trabajadas', example: 4.5 })
    @IsNumber()
    @Min(0)
    hours: number;

    @ApiPropertyOptional({ description: 'Tarifa por hora', example: 75 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    hourlyRate?: number;

    @ApiPropertyOptional({ description: 'Fecha del registro', example: '2025-01-20' })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiProperty({ description: 'ID del proyecto' })
    @IsString()
    projectId: string;

    @ApiProperty({ description: 'ID del usuario' })
    @IsString()
    userId: string;
}
