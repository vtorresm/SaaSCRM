import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService) { }

    async create(createCompanyDto: CreateCompanyDto) {
        return this.prisma.company.create({
            data: createCompanyDto,
        });
    }

    async findAll() {
        return this.prisma.company.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                contacts: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.company.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                contacts: true,
                users: true,
                quotes: true,
                projects: true,
                invoices: true,
            },
        });
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto) {
        return this.prisma.company.update({
            where: {
                id,
            },
            data: updateCompanyDto,
        });
    }

    async remove(id: string) {
        return this.prisma.company.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByStatus(status: string) {
        return this.prisma.company.findMany({
            where: {
                status: status as any,
                deletedAt: null,
            },
        });
    }

    async search(query: string) {
        return this.prisma.company.findMany({
            where: {
                OR: [
                    {
                        name: {
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
                    {
                        taxId: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                deletedAt: null,
            },
        });
    }
}