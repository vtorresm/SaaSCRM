import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../../config/prisma.service';
import { AuthService } from '../../auth/auth.service';
import { CompaniesService } from '../../companies/companies.service';

describe('UsersService', () => {
    let service: UsersService;
    let prismaService: PrismaService;
    let authService: AuthService;
    let companiesService: CompaniesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            count: jest.fn(),
                            groupBy: jest.fn(),
                        },
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        hashPassword: jest.fn().mockResolvedValue('hashed-password'),
                    },
                },
                {
                    provide: CompaniesService,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prismaService = module.get<PrismaService>(PrismaService);
        authService = module.get<AuthService>(AuthService);
        companiesService = module.get<CompaniesService>(CompaniesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'ADMIN',
                companyId: 'company-1',
            };

            jest.spyOn(prismaService.user, 'create').mockResolvedValue({
                id: 'test-user-id',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'hashed-password',
                role: 'ADMIN',
                status: 'ACTIVE',
                phone: '1234567890',
                emailVerified: false,
                emailVerifiedAt: null,
                lastLoginAt: null,
                failedLoginAttempts: 0,
                companyId: 'company-1',
                timezone: 'UTC',
                language: 'en',
                lockedUntil: null,
                refreshToken: null,
                refreshTokenExpiresAt: null,
                profilePicture: null,
                dataRetentionDate: new Date(),
                twoFactorEnabled: false,
                twoFactorSecret: null,
                googleId: null,
                linkedinId: null,
                dataConsentGiven: false,
                dataConsentDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            } as any);

            const result = await service.create(createUserDto as any);
            expect(result).toBeDefined();
            expect(result.firstName).toBe(createUserDto.firstName);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const mockUsers = [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

            const result = await service.findAll();
            expect(result).toEqual(mockUsers);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            const mockUser = {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

            const result = await service.findOne('1');
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto = {
                firstName: 'Updated',
                lastName: 'User',
            };

            jest.spyOn(prismaService.user, 'update').mockResolvedValue({
                id: '1',
                ...updateUserDto,
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                phone: '1234567890',
                emailVerified: false,
                emailVerifiedAt: null,
                lastLoginAt: null,
                failedLoginAttempts: 0,
                companyId: 'company-1',
                timezone: 'UTC',
                language: 'en',
                lockedUntil: null,
                refreshToken: null,
                refreshTokenExpiresAt: null,
                profilePicture: null,
                dataRetentionDate: new Date(),
                twoFactorEnabled: false,
                twoFactorSecret: null,
                googleId: null,
                linkedinId: null,
                dataConsentGiven: false,
                dataConsentDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            } as any);

            const result = await service.update('1', updateUserDto);
            expect(result).toBeDefined();
            expect(result.firstName).toBe(updateUserDto.firstName);
        });
    });

    describe('remove', () => {
        it('should soft delete a user', async () => {
            jest.spyOn(prismaService.user, 'update').mockResolvedValue({
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                phone: '1234567890',
                emailVerified: false,
                emailVerifiedAt: null,
                lastLoginAt: null,
                failedLoginAttempts: 0,
                companyId: 'company-1',
                timezone: 'UTC',
                language: 'en',
                lockedUntil: null,
                refreshToken: null,
                refreshTokenExpiresAt: null,
                profilePicture: null,
                dataRetentionDate: new Date(),
                twoFactorEnabled: false,
                twoFactorSecret: null,
                googleId: null,
                linkedinId: null,
                dataConsentGiven: false,
                dataConsentDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
            } as any);

            const result = await service.remove('1');
            expect(result).toBeDefined();
            expect(result.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const mockUser = {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

            const result = await service.findByEmail('john.doe@example.com');
            expect(result).toEqual(mockUser);
        });
    });

    describe('findByCompany', () => {
        it('should find users by company', async () => {
            const mockUsers = [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    companyId: 'company-1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

            const result = await service.findByCompany('company-1');
            expect(result).toEqual(mockUsers);
        });
    });

    describe('findByRole', () => {
        it('should find users by role', async () => {
            const mockUsers = [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

            const result = await service.findByRole('ADMIN');
            expect(result).toEqual(mockUsers);
        });
    });

    describe('search', () => {
        it('should search users by query', async () => {
            const mockUsers = [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any);

            const result = await service.search('john');
            expect(result).toEqual(mockUsers);
        });
    });

    describe('updateProfile', () => {
        it('should update user profile', async () => {
            const updateUserProfileDto = {
                firstName: 'Updated',
                lastName: 'User',
            };

            jest.spyOn(prismaService.user, 'update').mockResolvedValue({
                id: '1',
                ...updateUserProfileDto,
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.updateProfile('1', updateUserProfileDto);
            expect(result).toBeDefined();
            expect(result.firstName).toBe(updateUserProfileDto.firstName);
        });
    });

    describe('updatePassword', () => {
        it('should update user password', async () => {
            const updateUserPasswordDto = {
                currentPassword: 'old-password',
                newPassword: 'new-password',
                confirmPassword: 'new-password',
            };

            jest.spyOn(prismaService.user, 'update').mockResolvedValue({
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                password: 'hashed-new-password',
                phone: '1234567890',
                emailVerified: false,
                emailVerifiedAt: null,
                lastLoginAt: null,
                failedLoginAttempts: 0,
                companyId: 'company-1',
                timezone: 'UTC',
                language: 'en',
                lockedUntil: null,
                refreshToken: null,
                refreshTokenExpiresAt: null,
                profilePicture: null,
                dataRetentionDate: new Date(),
                twoFactorEnabled: false,
                twoFactorSecret: null,
                googleId: null,
                linkedinId: null,
                dataConsentGiven: false,
                dataConsentDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            } as any);

            const result = await service.updatePassword('1', updateUserPasswordDto as any);
            expect(result).toBeDefined();
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics', async () => {
            jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);
            jest.spyOn(prismaService.user, 'groupBy').mockResolvedValue([
                {
                    role: 'ADMIN',
                    _count: { id: 2 },
                },
                {
                    role: 'USER',
                    _count: { id: 8 },
                },
            ]);
            jest.spyOn(prismaService.user, 'count').mockResolvedValueOnce(8);

            const result = await service.getUserStats();
            expect(result).toBeDefined();
            expect(result.totalUsers).toBe(10);
            expect(result.activeUsers).toBe(8);
            expect(result.usersByRole).toEqual({ ADMIN: 2, USER: 8 });
        });
    });

    describe('getUserActivity', () => {
        it('should return user activity', async () => {
            const mockUser = {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                createdQuotes: [],
                assignedQuotes: [],
            };

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

            const result = await service.getUserActivity('1');
            expect(result).toBeDefined();
            expect(result.user).toEqual(mockUser);
        });
    });
});