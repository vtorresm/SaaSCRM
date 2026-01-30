import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyStatus } from '@prisma/client';
import { IsString, IsOptional, IsEmail, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateCompanyDto {
    @ApiProperty({ description: 'Nombre de la empresa', example: 'Acme Corp' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: 'Nombre legal de la empresa', example: 'Acme Corporation S.A.' })
    @IsString()
    @IsOptional()
    legalName?: string;

    @ApiPropertyOptional({ description: 'ID Fiscal / Tax ID', example: 'J12345678' })
    @IsString()
    @IsOptional()
    taxId?: string;

    @ApiPropertyOptional({ enum: CompanyStatus, example: CompanyStatus.ACTIVE })
    @IsEnum(CompanyStatus)
    @IsOptional()
    status?: CompanyStatus;

    @ApiPropertyOptional({ description: 'Dirección', example: 'Av. Principal 123' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ description: 'Ciudad', example: 'Lima' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ description: 'Estado/Provincia', example: 'Lima' })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiPropertyOptional({ description: 'Código Postal', example: '15001' })
    @IsString()
    @IsOptional()
    postalCode?: string;

    @ApiPropertyOptional({ description: 'País', example: 'Perú' })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiPropertyOptional({ description: 'Email de contacto', example: 'contacto@acme.com' })
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ description: 'Teléfono', example: '+51 1 234 5678' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ description: 'Sitio web', example: 'https://acme.com' })
    @IsString()
    @IsOptional()
    website?: string;

    @ApiPropertyOptional({ description: 'Días de crédito para pagos', example: 30 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    paymentTerms?: number;

    @ApiPropertyOptional({ description: 'Moneda default', example: 'USD' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({ description: 'Tasa de impuesto default', example: 0.18 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    taxRate?: number;
}
