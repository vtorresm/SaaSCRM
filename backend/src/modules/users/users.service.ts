import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { AuthService } from '../auth/auth.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService,
        private companiesService: CompaniesService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        // Hash password before creating user
        const hashedPassword = await this.authService.hashPassword(createUserDto.password);

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                status: 'ACTIVE',
            },
            include: {
                company: true,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                company: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                company: true,
                teams: true,
                assignedQuotes: true,
                createdQuotes: true,
            },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: updateUserDto,
            include: {
                company: true,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
                deletedAt: null,
            },
            include: {
                company: true,
                teams: true,
            },
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.user.findMany({
            where: {
                companyId,
                deletedAt: null,
            },
            include: {
                teams: true,
            },
        });
    }

    async findByRole(role: string) {
        return this.prisma.user.findMany({
            where: {
                role: role as any,
                deletedAt: null,
            },
            include: {
                company: true,
            },
        });
    }

    async search(query: string) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        firstName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                deletedAt: null,
            },
            include: {
                company: true,
            },
        });
    }

    async updateProfile(id: string, updateUserProfileDto: UpdateUserProfileDto) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: updateUserProfileDto,
        });
    }

    async updatePassword(id: string, updateUserPasswordDto: UpdateUserPasswordDto) {
        const hashedPassword = await this.authService.hashPassword(updateUserPasswordDto.newPassword);

        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                password: hashedPassword,
            },
        });
    }

    async getUserStats() {
        const totalUsers = await this.prisma.user.count({
            where: {
                deletedAt: null,
            },
        });

        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: {
                id: true,
            },
            where: {
                deletedAt: null,
            },
        });

        const activeUsers = await this.prisma.user.count({
            where: {
                status: 'ACTIVE',
                deletedAt: null,
            },
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

    async getUserActivity(userId: string) {
        const user = await this.findOne(userId);

        return {
            user,
            recentQuotes: user.createdQuotes.slice(0, 5),
            assignedQuotes: user.assignedQuotes.slice(0, 5),
        };
    }
}