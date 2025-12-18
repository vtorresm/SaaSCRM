import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new quote' })
    @ApiResponse({ status: 201, description: 'Quote created successfully' })
    async create(@Body() createQuoteDto: CreateQuoteDto) {
        return this.quotesService.create(createQuoteDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all quotes' })
    @ApiResponse({ status: 200, description: 'List of quotes' })
    async findAll() {
        return this.quotesService.findAll();
    }

    // IMPORTANT: mantener rutas estáticas/semánticas antes de ':id' para evitar colisiones
    @Get('search')
    @ApiOperation({ summary: 'Search quotes' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@Query('q') query: string) {
        return this.quotesService.search(query);
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'Get quotes by company' })
    @ApiResponse({ status: 200, description: 'List of quotes for specific company' })
    async findByCompany(@Param('companyId') companyId: string) {
        return this.quotesService.findByCompany(companyId);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get quotes by status' })
    @ApiResponse({ status: 200, description: 'List of quotes with specific status' })
    async findByStatus(@Param('status') status: string) {
        return this.quotesService.findByStatus(status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get quote by ID' })
    @ApiResponse({ status: 200, description: 'Quote details' })
    async findOne(@Param('id') id: string) {
        return this.quotesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update quote' })
    @ApiResponse({ status: 200, description: 'Quote updated successfully' })
    async update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
        return this.quotesService.update(id, updateQuoteDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update quote status (pipeline)' })
    @ApiResponse({ status: 200, description: 'Quote status updated successfully' })
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
        return this.quotesService.updateStatus(id, dto.status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete quote (soft delete)' })
    @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.quotesService.remove(id);
    }

    @Post(':id/version')
    @ApiOperation({ summary: 'Create quote version' })
    @ApiResponse({ status: 201, description: 'Quote version created' })
    async createVersion(@Param('id') id: string, @Body('createdById') createdById: string) {
        return this.quotesService.createVersion(id, createdById);
    }

    @Post(':id/send')
    @ApiOperation({ summary: 'Send quote to client' })
    @ApiResponse({ status: 200, description: 'Quote sent successfully' })
    async sendQuote(@Param('id') id: string) {
        return this.quotesService.sendQuote(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate quote PDF' })
    @ApiResponse({ status: 200, description: 'PDF generated successfully', type: 'application/pdf' })
    async generatePdf(@Param('id') id: string) {
        const pdf = await this.quotesService.generatePdf(id);
        return {
            pdf: pdf.toString('base64'),
            contentType: 'application/pdf',
        };
    }

    // Endpoints de conveniencia para status tracking (Sprint 5)
    // Mejoran la Developer Experience con URLs semánticas

    @Post(':id/view')
    @ApiOperation({ summary: 'Mark quote as viewed' })
    @ApiResponse({ status: 200, description: 'Quote marked as viewed' })
    async markAsViewed(@Param('id') id: string) {
        return this.quotesService.markAsViewed(id);
    }

    @Post(':id/accept')
    @ApiOperation({ summary: 'Accept quote' })
    @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
    async accept(@Param('id') id: string) {
        return this.quotesService.accept(id);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Reject quote' })
    @ApiResponse({ status: 200, description: 'Quote rejected successfully' })
    async reject(@Param('id') id: string) {
        return this.quotesService.reject(id);
    }

    @Post(':id/expire')
    @ApiOperation({ summary: 'Mark quote as expired' })
    @ApiResponse({ status: 200, description: 'Quote marked as expired' })
    async expire(@Param('id') id: string) {
        return this.quotesService.expire(id);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel quote' })
    @ApiResponse({ status: 200, description: 'Quote cancelled successfully' })
    async cancel(@Param('id') id: string) {
        return this.quotesService.cancel(id);
    }
}