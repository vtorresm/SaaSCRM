import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new contact' })
    @ApiResponse({ status: 201, description: 'Contact created successfully' })
    async create(@Body() createContactDto: CreateContactDto) {
        return this.contactsService.create(createContactDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all contacts' })
    @ApiResponse({ status: 200, description: 'List of contacts' })
    async findAll() {
        return this.contactsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get contact by ID' })
    @ApiResponse({ status: 200, description: 'Contact details' })
    async findOne(@Param('id') id: string) {
        return this.contactsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update contact' })
    @ApiResponse({ status: 200, description: 'Contact updated successfully' })
    async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
        return this.contactsService.update(id, updateContactDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete contact (soft delete)' })
    @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.contactsService.remove(id);
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'Get contacts by company' })
    @ApiResponse({ status: 200, description: 'List of contacts for specific company' })
    async findByCompany(@Param('companyId') companyId: string) {
        return this.contactsService.findByCompany(companyId);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get contacts by status' })
    @ApiResponse({ status: 200, description: 'List of contacts with specific status' })
    async findByStatus(@Param('status') status: string) {
        return this.contactsService.findByStatus(status);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search contacts' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@Query('q') query: string) {
        return this.contactsService.search(query);
    }
}