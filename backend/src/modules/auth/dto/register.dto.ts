import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsEnum,
} from 'class-validator';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    SALES_MANAGER = 'SALES_MANAGER',
    SALES_REP = 'SALES_REP',
    DEVELOPER = 'DEVELOPER',
    CLIENT = 'CLIENT',
}

export class RegisterDto {
    @ApiProperty({
        example: 'juan.perez@example.com',
        description: 'Email del usuario (único)',
    })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
    email: string;

    @ApiProperty({
        example: 'Juan',
        description: 'Nombre del usuario',
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    firstName: string;

    @ApiProperty({
        example: 'Pérez',
        description: 'Apellido del usuario',
    })
    @IsString({ message: 'El apellido debe ser una cadena de texto' })
    @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
    lastName: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Contraseña segura',
        minLength: 8,
    })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
        },
    )
    password: string;

    @ApiProperty({
        example: '+1234567890',
        description: 'Número de teléfono (opcional)',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
    phone?: string;

    @ApiProperty({
        example: UserRole.SALES_REP,
        description: 'Rol del usuario',
        enum: UserRole,
        required: false,
        default: UserRole.SALES_REP,
    })
    @IsOptional()
    @IsEnum(UserRole, { message: 'Rol inválido' })
    role?: UserRole = UserRole.SALES_REP;

    @ApiProperty({
        example: 'America/Lima',
        description: 'Zona horaria del usuario',
        required: false,
        default: 'UTC',
    })
    @IsOptional()
    @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
    @MaxLength(50, { message: 'La zona horaria no puede exceder 50 caracteres' })
    timezone?: string = 'UTC';

    @ApiProperty({
        example: 'es',
        description: 'Idioma preferido del usuario',
        required: false,
        default: 'es',
    })
    @IsOptional()
    @IsString({ message: 'El idioma debe ser una cadena de texto' })
    @MaxLength(10, { message: 'El idioma no puede exceder 10 caracteres' })
    language?: string = 'es';
}