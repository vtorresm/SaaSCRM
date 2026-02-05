import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSettingDto {
    @ApiProperty({ description: 'Nuevo valor' })
    @IsString()
    value: string;

    @ApiPropertyOptional({ description: 'Descripción actualizada' })
    @IsString()
    @IsOptional()
    description?: string;
}
