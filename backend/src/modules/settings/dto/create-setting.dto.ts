import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateSettingDto {
    @ApiProperty({ description: 'Clave de configuración', example: 'company_name' })
    @IsString()
    key: string;

    @ApiProperty({ description: 'Valor de configuración', example: 'Sales CRM' })
    @IsString()
    value: string;

    @ApiPropertyOptional({ description: 'Descripción de la configuración' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Tipo de dato', example: 'string', enum: ['string', 'number', 'boolean', 'json'] })
    @IsIn(['string', 'number', 'boolean', 'json'])
    @IsOptional()
    type?: string;
}
