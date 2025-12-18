import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInvoiceFromQuoteDto } from './dto/create-invoice-from-quote.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new invoice' })
    @ApiResponse({ status: 201, description: 'Invoice created successfully' })
    async create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices' })
    @ApiResponse({ status: 200, description: 'List of invoices' })
    async findAll() {
        return this.invoicesService.findAll();
    }

    // IMPORTANT: mantener rutas estáticas/semánticas antes de ':id' para evitar colisiones
    @Get('search')
    @ApiOperation({ summary: 'Search invoices' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@Query('q') query: string) {
        return this.invoicesService.search(query);
    }

    @Get('client/:clientId')
    @ApiOperation({ summary: 'Get invoices by client' })
    @ApiResponse({ status: 200, description: 'List of invoices for specific client' })
    async findByClient(@Param('clientId') clientId: string) {
        return this.invoicesService.findByClient(clientId);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get invoices by status' })
    @ApiResponse({ status: 200, description: 'List of invoices with specific status' })
    async findByStatus(@Param('status') status: string) {
        return this.invoicesService.findByStatus(status);
    }

    @Get('overdue')
    @ApiOperation({ summary: 'Get overdue invoices' })
    @ApiResponse({ status: 200, description: 'List of overdue invoices' })
    async findOverdue() {
        return this.invoicesService.findOverdue();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get invoice statistics' })
    @ApiResponse({ status: 200, description: 'Invoice statistics and metrics' })
    async getStats() {
        return this.invoicesService.getInvoiceStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get invoice by ID' })
    @ApiResponse({ status: 200, description: 'Invoice details' })
    async findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update invoice' })
    @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
    async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
        return this.invoicesService.update(id, updateInvoiceDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update invoice status' })
    @ApiResponse({ status: 200, description: 'Invoice status updated successfully' })
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
        return this.invoicesService.updateStatus(id, dto.status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete invoice (soft delete)' })
    @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.invoicesService.remove(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate invoice PDF' })
    @ApiResponse({ status: 200, description: 'PDF generated successfully', type: 'application/pdf' })
    async generatePdf(@Param('id') id: string) {
        const pdf = await this.invoicesService.generatePdf(id);
        return {
            pdf: pdf.toString('base64'),
            contentType: 'application/pdf',
        };
    }

    // Payment Management Endpoints
    @Post(':id/payments')
    @ApiOperation({ summary: 'Add payment to invoice' })
    @ApiResponse({ status: 201, description: 'Payment added successfully' })
    async addPayment(@Param('id') id: string, @Body() createPaymentDto: CreatePaymentDto) {
        return this.invoicesService.addPayment(id, createPaymentDto);
    }

    @Get(':id/payments')
    @ApiOperation({ summary: 'Get payments for invoice' })
    @ApiResponse({ status: 200, description: 'List of payments' })
    async getPayments(@Param('id') id: string) {
        return this.invoicesService.getPayments(id);
    }

    // Quote to Invoice Conversion (Sprint 6 Feature)
    @Post('from-quote')
    @ApiOperation({ summary: 'Create invoice from approved quote' })
    @ApiResponse({ status: 201, description: 'Invoice created from quote successfully' })
    async createFromQuote(@Body() createInvoiceFromQuoteDto: CreateInvoiceFromQuoteDto) {
        return this.invoicesService.createFromQuote(createInvoiceFromQuoteDto);
    }

    // Convenience methods for status tracking
    @Post(':id/send')
    @ApiOperation({ summary: 'Send invoice to client' })
    @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
    async sendInvoice(@Param('id') id: string) {
        return this.invoicesService.updateStatus(id, 'SENT' as any);
    }

    @Post(':id/mark-paid')
    @ApiOperation({ summary: 'Mark invoice as paid' })
    @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
    async markAsPaid(@Param('id') id: string) {
        return this.invoicesService.updateStatus(id, 'PAID' as any);
    }

    @Post(':id/mark-overdue')
    @ApiOperation({ summary: 'Mark invoice as overdue' })
    @ApiResponse({ status: 200, description: 'Invoice marked as overdue' })
    async markAsOverdue(@Param('id') id: string) {
        return this.invoicesService.updateStatus(id, 'OVERDUE' as any);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel invoice' })
    @ApiResponse({ status: 200, description: 'Invoice cancelled successfully' })
    async cancel(@Param('id') id: string) {
        return this.invoicesService.updateStatus(id, 'CANCELLED' as any);
    }

    @Post(':id/refund')
    @ApiOperation({ summary: 'Refund invoice' })
    @ApiResponse({ status: 200, description: 'Invoice refunded successfully' })
    async refund(@Param('id') id: string) {
        return this.invoicesService.updateStatus(id, 'REFUNDED' as any);
    }
}