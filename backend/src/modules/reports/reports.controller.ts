import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('users')
    @ApiOperation({ summary: 'Generate user activity report' })
    @ApiResponse({ status: 200, description: 'User activity report' })
    async generateUserReport() {
        return this.reportsService.generateUserReport();
    }

    @Get('companies')
    @ApiOperation({ summary: 'Generate company activity report' })
    @ApiResponse({ status: 200, description: 'Company activity report' })
    async generateCompanyReport() {
        return this.reportsService.generateCompanyReport();
    }

    @Get('sales')
    @ApiOperation({ summary: 'Generate sales performance report' })
    @ApiResponse({ status: 200, description: 'Sales performance report' })
    async generateSalesReport() {
        return this.reportsService.generateSalesReport();
    }

    @Get('system')
    @ApiOperation({ summary: 'Generate system overview report' })
    @ApiResponse({ status: 200, description: 'System overview report' })
    async generateSystemReport() {
        return this.reportsService.generateSystemReport();
    }

    @Post('custom')
    @ApiOperation({ summary: 'Generate custom report' })
    @ApiResponse({ status: 200, description: 'Custom report' })
    async generateCustomReport(
        @Body('startDate') startDate: string,
        @Body('endDate') endDate: string,
        @Body('reportType') reportType: string,
    ) {
        return this.reportsService.generateCustomReport(startDate, endDate, reportType);
    }
}