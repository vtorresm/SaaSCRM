import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                ...createNotificationDto,
                scheduledAt: createNotificationDto.scheduledAt
                    ? new Date(createNotificationDto.scheduledAt)
                    : undefined,
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findUnreadByUser(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    async countUnread(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string) {
        const notification = await this.prisma.notification.findUnique({ where: { id } });
        if (!notification) {
            throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
        }

        return this.prisma.notification.update({
            where: { id },
            data: { read: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, readAt: new Date() },
        });
    }

    async remove(id: string) {
        return this.prisma.notification.delete({ where: { id } });
    }

    async removeAllByUser(userId: string) {
        return this.prisma.notification.deleteMany({ where: { userId } });
    }
}
