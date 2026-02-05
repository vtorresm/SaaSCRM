import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateAuditLogDto } from '@/modules/audit/dto/create-audit-log.dto';
import { QueryAuditDto } from '@/modules/audit/dto/query-audit.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Post()
    @ApiOperation({ summary: 'Create an audit log entry' })
    @ApiResponse({ status: 201, description: 'Audit log created' })
    async create(@Body() createAuditLogDto: CreateAuditLogDto) {
        return this.auditService.log(createAuditLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get audit logs with filters' })
    @ApiResponse({ status: 200, description: 'Paginated list of audit logs' })
    async findAll(@Query() query: QueryAuditDto) {
        return this.auditService.findAll(query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get audit statistics' })
    @ApiResponse({ status: 200, description: 'Audit statistics' })
    async getStats() {
        return this.auditService.getStats();
    }

    @Get('entity/:entityType/:entityId')
    @ApiOperation({ summary: 'Get audit logs for a specific entity' })
    @ApiResponse({ status: 200, description: 'Audit logs for entity' })
    async findByEntity(
        @Param('entityType') entityType: string,
        @Param('entityId') entityId: string,
    ) {
        return this.auditService.findByEntity(entityType, entityId);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get audit logs for a specific user' })
    @ApiResponse({ status: 200, description: 'Audit logs for user' })
    async findByUser(@Param('userId') userId: string) {
        return this.auditService.findByUser(userId);
    }
}
