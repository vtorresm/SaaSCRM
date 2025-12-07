import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../companies.service';
import { PrismaService } from '../../../config/prisma.service';

describe('CompaniesService', () => {
    let service: CompaniesService;
    let prismaService: PrismaService;

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

            jest.spyOn(prismaService.company, 'create').mockResolvedValue({
                id: 'test-id',
                ...createCompanyDto,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.create(createCompanyDto);
            expect(result).toBeDefined();
            expect(result.name).toBe(createCompanyDto.name);
        });
    });

    describe('findAll', () => {
        it('should return an array of companies', async () => {
            const mockCompanies = [
                {
                    id: '1',
                    name: 'Company 1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: '2',
                    name: 'Company 2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.company, 'findMany').mockResolvedValue(mockCompanies);

            const result = await service.findAll();
            expect(result).toEqual(mockCompanies);
        });
    });

    describe('findOne', () => {
        it('should return a single company', async () => {
            const mockCompany = {
                id: '1',
                name: 'Test Company',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

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

            jest.spyOn(prismaService.company, 'update').mockResolvedValue({
                id: '1',
                ...updateCompanyDto,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.update('1', updateCompanyDto);
            expect(result).toBeDefined();
            expect(result.name).toBe(updateCompanyDto.name);
        });
    });

    describe('remove', () => {
        it('should soft delete a company', async () => {
            jest.spyOn(prismaService.company, 'update').mockResolvedValue({
                id: '1',
                name: 'Test Company',
                deletedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.remove('1');
            expect(result.deletedAt).toBeDefined();
        });
    });
});