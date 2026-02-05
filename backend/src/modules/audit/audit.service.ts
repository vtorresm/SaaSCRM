import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateAuditLogDto } from '@/modules/audit/dto/create-audit-log.dto';
import { QueryAuditDto } from '@/modules/audit/dto/query-audit.dto';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(createAuditLogDto: CreateAuditLogDto) {
        return this.prisma.auditLog.create({
            data: createAuditLogDto,
        });
    }

    async findAll(query: QueryAuditDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.action) where.action = query.action;
        if (query.entityType) where.entityType = query.entityType;
        if (query.entityId) where.entityId = query.entityId;
        if (query.userId) where.userId = query.userId;

        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByEntity(entityType: string, entityId: string) {
        return this.prisma.auditLog.findMany({
            where: { entityType, entityId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    async getStats() {
        const [totalLogs, actionCounts, recentActivity] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
            }),
            this.prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
        ]);

        return { totalLogs, actionCounts, recentActivity };
    }
}
