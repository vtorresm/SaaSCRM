import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '@/modules/companies/companies.service';
import { PrismaService } from '@/config/prisma.service';
import { CompanyStatus } from '@prisma/client';

describe('CompaniesService', () => {
    let service: CompaniesService;
    let prismaService: PrismaService;

    // Helper function to create a complete mock company object
    const createMockCompany = (overrides = {}) => {
        const baseCompany = {
            id: 'test-id',
            name: 'Test Company',
            legalName: 'Test Company Inc.',
            taxId: '123456789',
            status: CompanyStatus.PROSPECT,
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            email: 'test@example.com',
            phone: '555-1234',
            website: 'https://example.com',
            paymentTerms: 30,
            currency: 'USD',
            taxRate: 0.18,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            users: [],
            contacts: [],
            quotes: [],
            projects: [],
            invoices: [],
        };

        return { ...baseCompany, ...overrides };
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompaniesService,
                {
                    provide: PrismaService,
                    useValue: {
                        company: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CompaniesService>(CompaniesService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a company', async () => {
            const createCompanyDto = {
                name: 'Test Company',
                email: 'test@example.com',
            };

            jest.spyOn(prismaService.company, 'create').mockResolvedValue(
                createMockCompany(createCompanyDto),
            );

            const result = await service.create(createCompanyDto);
            expect(result).toBeDefined();
            expect(result.name).toBe(createCompanyDto.name);
        });
    });

    describe('findAll', () => {
        it('should return an array of companies', async () => {
            const mockCompanies = [
                createMockCompany({ id: '1', name: 'Company 1' }),
                createMockCompany({ id: '2', name: 'Company 2' }),
            ];

            jest.spyOn(prismaService.company, 'findMany').mockResolvedValue(mockCompanies);

            const result = await service.findAll();
            expect(result).toEqual(mockCompanies);
        });
    });

    describe('findOne', () => {
        it('should return a single company', async () => {
            const mockCompany = createMockCompany({ id: '1' });

            jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);

            const result = await service.findOne('1');
            expect(result).toEqual(mockCompany);
        });
    });

    describe('update', () => {
        it('should update a company', async () => {
            const updateCompanyDto = {
                name: 'Updated Company',
            };

            jest.spyOn(prismaService.company, 'update').mockResolvedValue(
                createMockCompany({ id: '1', ...updateCompanyDto }),
            );

            const result = await service.update('1', updateCompanyDto);
            expect(result).toBeDefined();
            expect(result.name).toBe(updateCompanyDto.name);
        });
    });

    describe('remove', () => {
        it('should soft delete a company', async () => {
            jest.spyOn(prismaService.company, 'update').mockResolvedValue(
                createMockCompany({ id: '1', deletedAt: new Date() }),
            );

            const result = await service.remove('1');
            expect(result.deletedAt).toBeDefined();
        });
    });
});