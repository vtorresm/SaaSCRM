import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
    firstName!: string;
    lastName!: string;
    email!: string;
    password!: string;
    role?: UserRole;
    status?: UserStatus;
    phone?: string;
    timezone?: string;
    language?: string;
    companyId?: string;
}