import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a notification' })
    @ApiResponse({ status: 201, description: 'Notification created' })
    async create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all notifications for a user' })
    @ApiResponse({ status: 200, description: 'List of notifications' })
    async findByUser(@Param('userId') userId: string) {
        return this.notificationsService.findByUser(userId);
    }

    @Get('user/:userId/unread')
    @ApiOperation({ summary: 'Get unread notifications for a user' })
    @ApiResponse({ status: 200, description: 'List of unread notifications' })
    async findUnreadByUser(@Param('userId') userId: string) {
        return this.notificationsService.findUnreadByUser(userId);
    }

    @Get('user/:userId/unread/count')
    @ApiOperation({ summary: 'Get unread notification count for a user' })
    @ApiResponse({ status: 200, description: 'Unread count' })
    async countUnread(@Param('userId') userId: string) {
        const count = await this.notificationsService.countUnread(userId);
        return { count };
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('user/:userId/read-all')
    @ApiOperation({ summary: 'Mark all notifications as read for a user' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    async markAllAsRead(@Param('userId') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({ status: 200, description: 'Notification deleted' })
    async remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }

    @Delete('user/:userId')
    @ApiOperation({ summary: 'Delete all notifications for a user' })
    @ApiResponse({ status: 200, description: 'All notifications deleted' })
    async removeAllByUser(@Param('userId') userId: string) {
        return this.notificationsService.removeAllByUser(userId);
    }
}
