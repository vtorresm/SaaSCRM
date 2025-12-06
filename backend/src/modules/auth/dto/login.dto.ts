import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'juan.perez@example.com',
        description: 'Email del usuario',
    })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    email: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Contraseña del usuario',
        minLength: 1,
    })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(1, { message: 'La contraseña es requerida' })
    password: string;
}