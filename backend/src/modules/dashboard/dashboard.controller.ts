import { Controller, Get } from '@nestjs/common';
import { DashboardService } from "@/modules/dashboard/dashboard.service";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('metrics')
    @ApiOperation({ summary: 'Get dashboard metrics' })
    @ApiResponse({ status: 200, description: 'Dashboard metrics' })
    async getMetrics() {
        return this.dashboardService.getMetrics();
    }

    @Get('recent-activities')
    @ApiOperation({ summary: 'Get recent activities' })
    @ApiResponse({ status: 200, description: 'Recent activities' })
    async getRecentActivities() {
        return this.dashboardService.getRecentActivities();
    }
}