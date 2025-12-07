import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from '../contacts.service';
import { PrismaService } from '../../../config/prisma.service';

describe('ContactsService', () => {
    let service: ContactsService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactsService,
                {
                    provide: PrismaService,
                    useValue: {
                        contact: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<ContactsService>(ContactsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a contact', async () => {
            const createContactDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                companyId: 'test-company-id',
            };

            jest.spyOn(prismaService.contact, 'create').mockResolvedValue({
                id: 'test-id',
                ...createContactDto,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.create(createContactDto);
            expect(result).toBeDefined();
            expect(result.firstName).toBe(createContactDto.firstName);
        });
    });

    describe('findAll', () => {
        it('should return an array of contacts', async () => {
            const mockContacts = [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: '2',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.contact, 'findMany').mockResolvedValue(mockContacts);

            const result = await service.findAll();
            expect(result).toEqual(mockContacts);
        });
    });

    describe('findOne', () => {
        it('should return a single contact', async () => {
            const mockContact = {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            jest.spyOn(prismaService.contact, 'findUnique').mockResolvedValue(mockContact);

            const result = await service.findOne('1');
            expect(result).toEqual(mockContact);
        });
    });

    describe('update', () => {
        it('should update a contact', async () => {
            const updateContactDto = {
                firstName: 'Updated',
                lastName: 'Name',
            };

            jest.spyOn(prismaService.contact, 'update').mockResolvedValue({
                id: '1',
                ...updateContactDto,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.update('1', updateContactDto);
            expect(result).toBeDefined();
            expect(result.firstName).toBe(updateContactDto.firstName);
        });
    });

    describe('remove', () => {
        it('should soft delete a contact', async () => {
            jest.spyOn(prismaService.contact, 'update').mockResolvedValue({
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                deletedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.remove('1');
            expect(result.deletedAt).toBeDefined();
        });
    });
});