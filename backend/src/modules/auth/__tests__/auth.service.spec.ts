import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService, RegisterDto, AuthResponse } from '../auth.service';
import { UsersService } from '../../users/users.service';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let configService: ConfigService;
    let usersService: UsersService;

    const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'SALES_REP',
        status: 'ACTIVE',
        password: 'hashedPassword',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: Record<string, any> = {
                                'JWT_SECRET': 'test-secret',
                                'JWT_REFRESH_SECRET': 'refresh-secret',
                                'JWT_EXPIRATION': '15m',
                                'JWT_REFRESH_EXPIRATION': '7d',
                                'BCRYPT_ROUNDS': 10,
                                'MAX_LOGIN_ATTEMPTS': 5,
                                'ACCOUNT_LOCKOUT_TIME': 30,
                            };
                            return config[key];
                        }),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        findByEmail: jest.fn(),
                        findByEmailWithPassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);
        usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hashPassword', () => {
        it('should hash password with bcrypt', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await service.hashPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });

        it('should use default bcrypt rounds if not configured', async () => {
            (configService.get as jest.Mock).mockReturnValueOnce(undefined);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

            await service.hashPassword('password');

            expect(bcrypt.hash).toHaveBeenCalledWith('password', 12);
        });
    });

    describe('validatePassword', () => {
        it('should return true for valid password', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validatePassword('password', 'hashed');

            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
            expect(result).toBe(true);
        });

        it('should return false for invalid password', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validatePassword('wrongPassword', 'hashed');

            expect(result).toBe(false);
        });
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', async () => {
            const user = { ...mockUser };
            (jwtService.sign as jest.Mock)
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');

            const result = await service.generateTokens(user);

            expect(result).toEqual({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                },
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                role: user.role,
            });

            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, email: user.email, role: user.role },
                { secret: 'refresh-secret', expiresIn: '7d' }
            );
        });
    });

    describe('validateUser', () => {
        it('should return user if credentials are valid', async () => {
            (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password');

            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(null);

            await expect(service.validateUser('notfound@example.com', 'password'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if account is locked', async () => {
            const lockedUser = {
                ...mockUser,
                lockedUntil: new Date(Date.now() + 60000),
            };
            (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(lockedUser);

            await expect(service.validateUser('test@example.com', 'password'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.validateUser('test@example.com', 'wrongPassword'))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('should register a new user and return auth response', async () => {
            const registerDto: RegisterDto = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
            };

            const createdUser = {
                id: 'new-user-id',
                ...registerDto,
                role: 'SALES_REP',
                status: 'PENDING_VERIFICATION',
            };

            const authResponse: AuthResponse = {
                user: {
                    id: createdUser.id,
                    email: createdUser.email,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    role: createdUser.role,
                    status: createdUser.status,
                },
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (usersService.create as jest.Mock).mockResolvedValue(createdUser);
            (jwtService.sign as jest.Mock)
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');

            const result = await service.register(registerDto);

            expect(result).toEqual(authResponse);
            expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(usersService.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if user already exists', async () => {
            const registerDto: RegisterDto = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'Existing',
                lastName: 'User',
            };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

            await expect(service.register(registerDto))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('validateToken', () => {
        it('should return payload for valid token', async () => {
            const payload = { sub: 'user-id', email: 'test@example.com', role: 'SALES_REP' };
            (jwtService.verify as jest.Mock).mockReturnValue(payload);

            const result = await service.validateToken('valid-token');

            expect(result).toEqual(payload);
        });

        it('should throw UnauthorizedException for invalid token', async () => {
            (jwtService.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.validateToken('invalid-token'))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('rotateTokens', () => {
        it('should generate new tokens for valid user', async () => {
            const user = {
                id: 'user-id',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'SALES_REP',
                status: 'ACTIVE',
            };

            (usersService.findOne as jest.Mock).mockResolvedValue(user);
            (jwtService.sign as jest.Mock)
                .mockReturnValueOnce('new-access-token')
                .mockReturnValueOnce('new-refresh-token');

            const result = await service.rotateTokens('user-id', 'refresh-token');

            expect(result.accessToken).toBe('new-access-token');
            expect(result.refreshToken).toBe('new-refresh-token');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            (usersService.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.rotateTokens('invalid-id', 'refresh-token'))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('findUserById', () => {
        it('should find user by id using usersService', async () => {
            (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.findUserById('user-id');

            expect(result).toEqual(mockUser);
            expect(usersService.findOne).toHaveBeenCalledWith('user-id');
        });
    });
});
