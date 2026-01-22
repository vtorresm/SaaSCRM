import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { CompaniesService } from "@/modules/companies/companies.service";
import { CreateCompanyDto } from "@/modules/companies/dto/create-company.dto";
import { UpdateCompanyDto } from "@/modules/companies/dto/update-company.dto";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new company' })
    @ApiResponse({ status: 201, description: 'Company created successfully' })
    async create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companiesService.create(createCompanyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all companies' })
    @ApiResponse({ status: 200, description: 'List of companies' })
    async findAll() {
        return this.companiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get company by ID' })
    @ApiResponse({ status: 200, description: 'Company details' })
    async findOne(@Param('id') id: string) {
        return this.companiesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update company' })
    @ApiResponse({ status: 200, description: 'Company updated successfully' })
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        return this.companiesService.update(id, updateCompanyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete company (soft delete)' })
    @ApiResponse({ status: 200, description: 'Company deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.companiesService.remove(id);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get companies by status' })
    @ApiResponse({ status: 200, description: 'List of companies with specific status' })
    async findByStatus(@Param('status') status: string) {
        return this.companiesService.findByStatus(status);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search companies' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@Query('q') query: string) {
        return this.companiesService.search(query);
    }
}