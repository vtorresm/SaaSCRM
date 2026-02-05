import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, Min, IsIn } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({ description: 'Título de la tarea', example: 'Diseñar wireframes' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Descripción de la tarea' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Estado', example: 'todo', enum: ['todo', 'in_progress', 'done'] })
    @IsIn(['todo', 'in_progress', 'done'])
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({ description: 'Prioridad', example: 'medium', enum: ['low', 'medium', 'high', 'urgent'] })
    @IsIn(['low', 'medium', 'high', 'urgent'])
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional({ description: 'Horas estimadas', example: 8 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedHours?: number;

    @ApiPropertyOptional({ description: 'Fecha límite', example: '2025-03-01' })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ description: 'ID del proyecto' })
    @IsString()
    projectId: string;

    @ApiPropertyOptional({ description: 'ID del usuario asignado' })
    @IsString()
    @IsOptional()
    assignedToId?: string;

    @ApiPropertyOptional({ description: 'Orden de visualización', example: 0 })
    @IsNumber()
    @IsOptional()
    order?: number;
}
