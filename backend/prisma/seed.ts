import { PrismaClient, UserRole, UserStatus, CompanyStatus, ContactStatus, QuoteStatus, ProjectStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean existing data (in reverse dependency order)
    await prisma.timeEntry.deleteMany();
    await prisma.task.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quoteVersion.deleteMany();
    await prisma.quoteItem.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.project.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.userTeam.deleteMany();
    await prisma.team.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    console.log('Cleaned existing data');

    // ========================
    // COMPANIES
    // ========================
    const companies = await Promise.all([
        prisma.company.create({
            data: {
                name: 'Acme Corp',
                legalName: 'Acme Corporation S.A.',
                taxId: 'J-12345678-9',
                status: CompanyStatus.CLIENT,
                address: 'Av. Principal 123',
                city: 'Lima',
                state: 'Lima',
                country: 'Perú',
                email: 'contacto@acme.com',
                phone: '+51 1 234 5678',
                website: 'https://acme.com',
                paymentTerms: 30,
                currency: 'USD',
                taxRate: 0.18,
            },
        }),
        prisma.company.create({
            data: {
                name: 'TechStart Solutions',
                legalName: 'TechStart Solutions LLC',
                taxId: 'J-98765432-1',
                status: CompanyStatus.ACTIVE,
                address: 'Calle Innovación 456',
                city: 'Bogotá',
                country: 'Colombia',
                email: 'info@techstart.co',
                phone: '+57 1 987 6543',
                paymentTerms: 15,
                currency: 'USD',
                taxRate: 0.19,
            },
        }),
        prisma.company.create({
            data: {
                name: 'Global Industries',
                legalName: 'Global Industries Inc.',
                taxId: 'J-55555555-0',
                status: CompanyStatus.PROSPECT,
                address: '500 Market Street',
                city: 'San Francisco',
                state: 'California',
                country: 'USA',
                email: 'sales@globalind.com',
                paymentTerms: 45,
                currency: 'USD',
                taxRate: 0.08,
            },
        }),
    ]);

    console.log(`Created ${companies.length} companies`);

    // ========================
    // USERS
    // ========================
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@salescrm.dev',
                firstName: 'Admin',
                lastName: 'Sistema',
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                language: 'es',
                timezone: 'America/Lima',
            },
        }),
        prisma.user.create({
            data: {
                email: 'manager@salescrm.dev',
                firstName: 'María',
                lastName: 'González',
                password: hashedPassword,
                role: UserRole.SALES_MANAGER,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                companyId: companies[0].id,
            },
        }),
        prisma.user.create({
            data: {
                email: 'sales@salescrm.dev',
                firstName: 'Carlos',
                lastName: 'Pérez',
                password: hashedPassword,
                role: UserRole.SALES_REP,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                companyId: companies[0].id,
            },
        }),
        prisma.user.create({
            data: {
                email: 'dev@salescrm.dev',
                firstName: 'Ana',
                lastName: 'Rodríguez',
                password: hashedPassword,
                role: UserRole.DEVELOPER,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
        }),
    ]);

    console.log(`Created ${users.length} users`);

    // ========================
    // TEAMS
    // ========================
    const teams = await Promise.all([
        prisma.team.create({
            data: {
                name: 'Ventas LATAM',
                description: 'Equipo de ventas para Latinoamérica',
            },
        }),
        prisma.team.create({
            data: {
                name: 'Desarrollo',
                description: 'Equipo de desarrollo de software',
            },
        }),
    ]);

    await Promise.all([
        prisma.userTeam.create({ data: { userId: users[1].id, teamId: teams[0].id, role: 'lead' } }),
        prisma.userTeam.create({ data: { userId: users[2].id, teamId: teams[0].id, role: 'member' } }),
        prisma.userTeam.create({ data: { userId: users[3].id, teamId: teams[1].id, role: 'lead' } }),
    ]);

    console.log(`Created ${teams.length} teams with members`);

    // ========================
    // CONTACTS
    // ========================
    const contacts = await Promise.all([
        prisma.contact.create({
            data: {
                firstName: 'Roberto',
                lastName: 'Martínez',
                email: 'roberto@acme.com',
                phone: '+51 1 111 2222',
                position: 'CTO',
                status: ContactStatus.CLIENT,
                companyId: companies[0].id,
                assignedToId: users[2].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Laura',
                lastName: 'Silva',
                email: 'laura@techstart.co',
                phone: '+57 1 333 4444',
                position: 'CEO',
                status: ContactStatus.ACTIVE,
                companyId: companies[1].id,
                assignedToId: users[1].id,
                source: 'LinkedIn',
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@globalind.com',
                position: 'VP Engineering',
                status: ContactStatus.PROSPECT,
                companyId: companies[2].id,
                assignedToId: users[2].id,
                source: 'Referral',
            },
        }),
    ]);

    console.log(`Created ${contacts.length} contacts`);

    // ========================
    // QUOTES
    // ========================
    const quotes = await Promise.all([
        prisma.quote.create({
            data: {
                quoteNumber: 'QTE-2501-0001',
                title: 'Desarrollo de plataforma web',
                description: 'Desarrollo completo de plataforma e-commerce',
                status: QuoteStatus.ACCEPTED,
                priority: 'HIGH',
                subtotal: 45000,
                taxAmount: 8100,
                totalAmount: 53100,
                validUntil: new Date('2025-03-31'),
                acceptedAt: new Date('2025-01-20'),
                clientId: companies[0].id,
                assignedToId: users[2].id,
                createdById: users[1].id,
                items: {
                    create: [
                        { description: 'Diseño UX/UI', quantity: 1, unitPrice: 15000, taxRate: 0.18, totalPrice: 17700, order: 0 },
                        { description: 'Desarrollo Frontend', quantity: 1, unitPrice: 18000, taxRate: 0.18, totalPrice: 21240, order: 1 },
                        { description: 'Desarrollo Backend', quantity: 1, unitPrice: 12000, taxRate: 0.18, totalPrice: 14160, order: 2 },
                    ],
                },
            },
        }),
        prisma.quote.create({
            data: {
                quoteNumber: 'QTE-2501-0002',
                title: 'App Móvil TechStart',
                description: 'Desarrollo de aplicación móvil multiplataforma',
                status: QuoteStatus.SENT,
                priority: 'MEDIUM',
                subtotal: 35000,
                taxAmount: 6650,
                totalAmount: 41650,
                validUntil: new Date('2025-04-15'),
                sentAt: new Date('2025-01-25'),
                clientId: companies[1].id,
                assignedToId: users[2].id,
                createdById: users[1].id,
                items: {
                    create: [
                        { description: 'Diseño de App', quantity: 1, unitPrice: 10000, taxRate: 0.19, totalPrice: 11900, order: 0 },
                        { description: 'Desarrollo React Native', quantity: 1, unitPrice: 25000, taxRate: 0.19, totalPrice: 29750, order: 1 },
                    ],
                },
            },
        }),
    ]);

    console.log(`Created ${quotes.length} quotes`);

    // ========================
    // PROJECTS
    // ========================
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: 'Plataforma E-commerce Acme',
                description: 'Desarrollo de plataforma e-commerce completa',
                status: ProjectStatus.IN_PROGRESS,
                budget: 53100,
                hourlyRate: 75,
                estimatedHours: 600,
                actualHours: 120,
                startDate: new Date('2025-02-01'),
                dueDate: new Date('2025-07-31'),
                companyId: companies[0].id,
                quoteId: quotes[0].id,
                createdById: users[1].id,
                tasks: {
                    create: [
                        { title: 'Wireframes', description: 'Crear wireframes de todas las páginas', status: 'done', priority: 'high', estimatedHours: 40, actualHours: 35, completedAt: new Date('2025-02-15'), assignedToId: users[3].id, order: 0 },
                        { title: 'Diseño visual', description: 'Diseño de alta fidelidad', status: 'in_progress', priority: 'high', estimatedHours: 60, assignedToId: users[3].id, order: 1 },
                        { title: 'Setup del proyecto', description: 'Configuración inicial Next.js + NestJS', status: 'done', priority: 'urgent', estimatedHours: 16, actualHours: 12, completedAt: new Date('2025-02-05'), assignedToId: users[3].id, order: 2 },
                        { title: 'Auth module', description: 'Implementar autenticación', status: 'todo', priority: 'high', estimatedHours: 24, assignedToId: users[3].id, order: 3 },
                        { title: 'Catálogo de productos', description: 'CRUD de productos', status: 'todo', priority: 'medium', estimatedHours: 40, order: 4 },
                    ],
                },
            },
        }),
    ]);

    // Time entries
    await Promise.all([
        prisma.timeEntry.create({ data: { description: 'Wireframes - páginas principales', hours: 8, hourlyRate: 75, date: new Date('2025-02-03'), projectId: projects[0].id, userId: users[3].id } }),
        prisma.timeEntry.create({ data: { description: 'Wireframes - flujo de checkout', hours: 6, hourlyRate: 75, date: new Date('2025-02-04'), projectId: projects[0].id, userId: users[3].id } }),
        prisma.timeEntry.create({ data: { description: 'Setup proyecto + CI/CD', hours: 12, hourlyRate: 75, date: new Date('2025-02-05'), projectId: projects[0].id, userId: users[3].id } }),
    ]);

    console.log(`Created ${projects.length} projects with tasks and time entries`);

    // ========================
    // INVOICES
    // ========================
    const invoices = await Promise.all([
        prisma.invoice.create({
            data: {
                invoiceNumber: 'INV-2502-0001',
                status: InvoiceStatus.SENT,
                subtotal: 17700,
                taxAmount: 0,
                totalAmount: 17700,
                paidAmount: 0,
                dueAmount: 17700,
                issueDate: new Date('2025-02-01'),
                dueDate: new Date('2025-03-03'),
                clientId: companies[0].id,
                quoteId: quotes[0].id,
                projectId: projects[0].id,
                createdById: users[1].id,
                items: {
                    create: [
                        { description: 'Diseño UX/UI - Fase 1 (50%)', quantity: 1, unitPrice: 17700, taxRate: 0, totalPrice: 17700, order: 0 },
                    ],
                },
            },
        }),
    ]);

    console.log(`Created ${invoices.length} invoices`);

    // ========================
    // SYSTEM SETTINGS
    // ========================
    await Promise.all([
        prisma.systemSetting.create({ data: { key: 'company_name', value: 'Sales CRM', description: 'Nombre de la empresa', type: 'string' } }),
        prisma.systemSetting.create({ data: { key: 'default_currency', value: 'USD', description: 'Moneda por defecto', type: 'string' } }),
        prisma.systemSetting.create({ data: { key: 'default_tax_rate', value: '0.18', description: 'Tasa de impuesto por defecto', type: 'number' } }),
        prisma.systemSetting.create({ data: { key: 'invoice_prefix', value: 'INV', description: 'Prefijo para números de factura', type: 'string' } }),
        prisma.systemSetting.create({ data: { key: 'quote_prefix', value: 'QTE', description: 'Prefijo para números de cotización', type: 'string' } }),
        prisma.systemSetting.create({ data: { key: 'enable_notifications', value: 'true', description: 'Habilitar notificaciones', type: 'boolean' } }),
    ]);

    console.log('Created system settings');

    // ========================
    // SAMPLE NOTIFICATIONS
    // ========================
    await Promise.all([
        prisma.notification.create({
            data: {
                title: 'Cotización aceptada',
                message: 'La cotización QTE-2501-0001 para Acme Corp ha sido aceptada.',
                type: 'in_app',
                entityType: 'Quote',
                entityId: quotes[0].id,
                userId: users[1].id,
                read: true,
                readAt: new Date(),
            },
        }),
        prisma.notification.create({
            data: {
                title: 'Nueva factura pendiente',
                message: 'Se ha generado la factura INV-2502-0001 por $17,700.',
                type: 'in_app',
                entityType: 'Invoice',
                entityId: invoices[0].id,
                userId: users[1].id,
            },
        }),
        prisma.notification.create({
            data: {
                title: 'Tarea asignada',
                message: 'Se te ha asignado la tarea "Diseño visual" en el proyecto Plataforma E-commerce Acme.',
                type: 'in_app',
                entityType: 'Task',
                userId: users[3].id,
            },
        }),
    ]);

    console.log('Created sample notifications');

    console.log('\nSeed completed successfully!');
    console.log('\nTest credentials:');
    console.log('  Admin:   admin@salescrm.dev / Password123!');
    console.log('  Manager: manager@salescrm.dev / Password123!');
    console.log('  Sales:   sales@salescrm.dev / Password123!');
    console.log('  Dev:     dev@salescrm.dev / Password123!');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
