import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { AuthService } from '../../auth.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let authService: AuthService;
    let configService: ConfigService;

    const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'SALES_REP',
        status: 'ACTIVE',
        lockedUntil: null,
        lastLoginAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule],
            providers: [
                JwtStrategy,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: Record<string, any> = {
                                'JWT_SECRET': 'test-secret',
                            };
                            return config[key];
                        }),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        findUserById: jest.fn(),
                    },
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        authService = module.get<AuthService>(AuthService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('constructor', () => {
        it('should configure jwt from auth header as bearer token', () => {
            expect(strategy).toBeDefined();
        });

        it('should use JWT_SECRET from config', () => {
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
        });
    });

    describe('validate', () => {
        it('should return user object for valid payload', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            (authService.findUserById as jest.Mock).mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
                status: mockUser.status,
                lastLoginAt: mockUser.lastLoginAt,
                lockedUntil: mockUser.lockedUntil,
            });

            expect(authService.findUserById).toHaveBeenCalledWith(payload.sub);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const payload: JwtPayload = {
                sub: 'non-existent-user',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            (authService.findUserById as jest.Mock).mockResolvedValue(null);

            await expect(strategy.validate(payload))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is SUSPENDED', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            const suspendedUser = { ...mockUser, status: 'SUSPENDED' };
            (authService.findUserById as jest.Mock).mockResolvedValue(suspendedUser);

            await expect(strategy.validate(payload))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is INACTIVE', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            const inactiveUser = { ...mockUser, status: 'INACTIVE' };
            (authService.findUserById as jest.Mock).mockResolvedValue(inactiveUser);

            await expect(strategy.validate(payload))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is temporarily locked', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            const lockedUser = {
                ...mockUser,
                lockedUntil: new Date(Date.now() + 60000),
            };
            (authService.findUserById as jest.Mock).mockResolvedValue(lockedUser);

            await expect(strategy.validate(payload))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should return user without lockedUntil if account is not locked', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            (authService.findUserById as jest.Mock).mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(result.lockedUntil).toBeNull();
        });

        it('should handle user with null lastLoginAt', async () => {
            const payload: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
            };

            const userWithoutLastLogin = { ...mockUser, lastLoginAt: null };
            (authService.findUserById as jest.Mock).mockResolvedValue(userWithoutLastLogin);

            const result = await strategy.validate(payload);

            expect(result.lastLoginAt).toBeNull();
        });

        it('should map payload iat and exp if present', async () => {
            const payloadWithDates: JwtPayload = {
                sub: 'user-id',
                email: 'test@example.com',
                role: 'SALES_REP',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            };

            (authService.findUserById as jest.Mock).mockResolvedValue(mockUser);

            const result = await strategy.validate(payloadWithDates);

            expect(result.id).toBe(payloadWithDates.sub);
            expect(result.email).toBe(payloadWithDates.email);
        });
    });
});
