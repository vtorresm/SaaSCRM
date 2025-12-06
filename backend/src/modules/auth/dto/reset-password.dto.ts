import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de restablecimiento de contraseña',
    })
    @IsString()
    @IsNotEmpty({ message: 'El token es requerido' })
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
            'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;
}
