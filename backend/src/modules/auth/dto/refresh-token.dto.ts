import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Refresh token válido',
    })
    @IsString({ message: 'El refresh token debe ser una cadena de texto' })
    refreshToken: string;
}