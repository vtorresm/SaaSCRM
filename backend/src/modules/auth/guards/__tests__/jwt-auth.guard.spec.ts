import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    const createMockExecutionContext = (user: any = null): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user,
                    headers: {
                        'user-agent': 'test-user-agent',
                    },
                    ip: '127.0.0.1',
                }),
                getResponse: () => ({}),
            }),
            getHandler: () => ({}),
            getClass: () => ({}),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true for public routes', () => {
            (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
            const context = createMockExecutionContext();

            const result = guard.canActivate(context);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should call super.canActivate for protected routes', () => {
            (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

            const mockContext = createMockExecutionContext({
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'ACTIVE',
            });

            // For this test, we expect the parent guard to return true
            // since we have a valid user
            const result = guard.canActivate(mockContext);

            // The guard should not throw for valid users
            expect(result).toBe(true);
        });
    });

    describe('handleRequest', () => {
        it('should throw UnauthorizedException for invalid token', () => {
            expect(() => guard.handleRequest(null, null, null, {} as ExecutionContext))
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when no user', () => {
            const context = createMockExecutionContext();
            expect(() => guard.handleRequest(null, null, null, context))
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for SUSPENDED user', () => {
            const suspendedUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'SUSPENDED',
            };
            const context = createMockExecutionContext(suspendedUser);

            expect(() => guard.handleRequest(null, suspendedUser, null, context))
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for INACTIVE user', () => {
            const inactiveUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'INACTIVE',
            };
            const context = createMockExecutionContext(inactiveUser);

            expect(() => guard.handleRequest(null, inactiveUser, null, context))
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for locked user', () => {
            const lockedUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'ACTIVE',
                lockedUntil: new Date(Date.now() + 60000),
            };
            const context = createMockExecutionContext(lockedUser);

            expect(() => guard.handleRequest(null, lockedUser, null, context))
                .toThrow(UnauthorizedException);
        });

        it('should return user object with additional info for valid user', () => {
            const validUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'ACTIVE',
                firstName: 'John',
                lastName: 'Doe',
            };
            const context = createMockExecutionContext(validUser);

            const result = guard.handleRequest(null, validUser, null, context);

            expect(result).toEqual({
                ...validUser,
                ip: '127.0.0.1',
                userAgent: 'test-user-agent',
            });
        });

        it('should handle user without status', () => {
            const userWithoutStatus = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };
            const context = createMockExecutionContext(userWithoutStatus);

            // Should throw because status is undefined
            expect(() => guard.handleRequest(null, userWithoutStatus, null, context))
                .toThrow(UnauthorizedException);
        });

        it('should handle user with null lockedUntil', () => {
            const userWithNullLock = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'ACTIVE',
                lockedUntil: null,
            };
            const context = createMockExecutionContext(userWithNullLock);

            const result = guard.handleRequest(null, userWithNullLock, null, context);

            expect(result.lockedUntil).toBeNull();
        });

        it('should handle user with past lockedUntil', () => {
            const userWithPastLock = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                status: 'ACTIVE',
                lockedUntil: new Date(Date.now() - 60000), // 1 minute ago
            };
            const context = createMockExecutionContext(userWithPastLock);

            const result = guard.handleRequest(null, userWithPastLock, null, context);

            expect(result).toBeDefined();
            expect(result.id).toBe(userWithPastLock.id);
        });

        it('should preserve all original user properties', () => {
            const completeUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                firstName: 'Admin',
                lastName: 'User',
                companyId: 'company-id',
                lastLoginAt: new Date(),
                lockedUntil: null,
            };
            const context = createMockExecutionContext(completeUser);

            const result = guard.handleRequest(null, completeUser, null, context);

            expect(result.id).toBe(completeUser.id);
            expect(result.email).toBe(completeUser.email);
            expect(result.role).toBe(completeUser.role);
            expect(result.status).toBe(completeUser.status);
            expect(result.firstName).toBe(completeUser.firstName);
            expect(result.lastName).toBe(completeUser.lastName);
            expect(result.companyId).toBe(completeUser.companyId);
        });
    });
});
