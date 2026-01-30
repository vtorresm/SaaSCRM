import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { User, UserStatus } from '@prisma/client';

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    companyId?: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: UserStatus;
    companyId?: string;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    companyId?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<UserResponse> {
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: createUserDto.password,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                role: (createUserDto.role as any) || 'SALES_REP',
                companyId: createUserDto.companyId,
                status: 'ACTIVE',
            },
        });

        return this.toUserResponse(user);
    }

    async findAll(): Promise<UserResponse[]> {
        const users = await this.prisma.user.findMany({
            where: { deletedAt: null },
            include: { company: true },
            orderBy: { createdAt: 'desc' },
        });

        return users.map(user => this.toUserResponse(user));
    }

    async findOne(id: string): Promise<UserResponse | null> {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { company: true, teams: true },
        });

        if (!user) return null;
        return this.toUserResponse(user);
    }

    async findByEmail(email: string): Promise<UserResponse | null> {
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { company: true, teams: true },
        });

        if (!user) return null;
        return this.toUserResponse(user);
    }

    async findByEmailWithPassword(email: string): Promise<(User & { company?: any }) | null> {
        return this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { company: true },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto as any,
            include: { company: true },
        });

        return this.toUserResponse(user);
    }

    async remove(id: string): Promise<UserResponse> {
        const user = await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return this.toUserResponse(user);
    }

    async findByCompany(companyId: string): Promise<UserResponse[]> {
        const users = await this.prisma.user.findMany({
            where: { companyId, deletedAt: null },
            include: { teams: true },
        });

        return users.map(user => this.toUserResponse(user));
    }

    async findByRole(role: string): Promise<UserResponse[]> {
        const users = await this.prisma.user.findMany({
            where: { role: role as any, deletedAt: null },
            include: { company: true },
        });

        return users.map(user => this.toUserResponse(user));
    }

    async search(query: string): Promise<UserResponse[]> {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
                deletedAt: null,
            },
            include: { company: true },
        });

        return users.map(user => this.toUserResponse(user));
    }

    async getUserStats() {
        const totalUsers = await this.prisma.user.count({
            where: { deletedAt: null },
        });

        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
            where: { deletedAt: null },
        });

        const activeUsers = await this.prisma.user.count({
            where: { status: 'ACTIVE', deletedAt: null },
        });

        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            usersByRole: usersByRole.reduce((acc, curr) => {
                acc[curr.role] = curr._count.id;
                return acc;
            }, {}),
        };
    }

    private toUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            companyId: user.companyId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
