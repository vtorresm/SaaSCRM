import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

    async create(createContactDto: CreateContactDto) {
        return this.prisma.contact.create({
            data: createContactDto,
        });
    }

    async findAll() {
        return this.prisma.contact.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                company: true,
                assignedTo: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.contact.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                company: true,
                assignedTo: true,
            },
        });
    }

    async update(id: string, updateContactDto: UpdateContactDto) {
        return this.prisma.contact.update({
            where: {
                id,
            },
            data: updateContactDto,
        });
    }

    async remove(id: string) {
        return this.prisma.contact.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.contact.findMany({
            where: {
                companyId,
                deletedAt: null,
            },
        });
    }

    async findByStatus(status: string) {
        return this.prisma.contact.findMany({
            where: {
                status: status as any,
                deletedAt: null,
            },
        });
    }

    async search(query: string) {
        return this.prisma.contact.findMany({
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
                    {
                        company: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
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
}