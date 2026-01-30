import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService, AuthResponse } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthResponse: AuthResponse = {
        user: {
            id: 'user-id',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'SALES_REP',
            status: 'ACTIVE',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        register: jest.fn(),
                        generateTokens: jest.fn(),
                        validateToken: jest.fn(),
                        rotateTokens: jest.fn(),
                        updateLastLogin: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(LocalAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto: RegisterDto = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
            };

            (authService.register as jest.Mock).mockResolvedValue(mockAuthResponse);

            const result = await controller.register(registerDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login user and return tokens', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const user = {
                id: 'user-id',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'SALES_REP',
                status: 'ACTIVE',
            };

            (authService.generateTokens as jest.Mock).mockResolvedValue(mockAuthResponse);
            (authService.updateLastLogin as jest.Mock).mockResolvedValue(undefined);

            const mockRequest = { user };
            const result = await controller.login(loginDto, mockRequest);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.generateTokens).toHaveBeenCalledWith(user);
            expect(authService.updateLastLogin).toHaveBeenCalledWith(user.id);
        });
    });

    describe('refresh', () => {
        it('should refresh tokens with valid refresh token', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: 'valid-refresh-token',
            };

            const payload = { sub: 'user-id', email: 'test@example.com', role: 'SALES_REP' };
            const newAuthResponse: AuthResponse = {
                ...mockAuthResponse,
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            };

            (authService.validateToken as jest.Mock).mockResolvedValue(payload);
            (authService.rotateTokens as jest.Mock).mockResolvedValue(newAuthResponse);

            const result = await controller.refresh(refreshTokenDto);

            expect(result).toEqual(newAuthResponse);
            expect(authService.validateToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
            expect(authService.rotateTokens).toHaveBeenCalledWith(payload.sub, refreshTokenDto.refreshToken);
        });
    });

    describe('logout', () => {
        it('should return logout success message', async () => {
            const mockRequest = { user: { id: 'user-id' } };

            const result = await controller.logout(mockRequest);

            expect(result).toEqual({ message: 'Logout exitoso' });
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const user = {
                id: 'user-id',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'SALES_REP',
                status: 'ACTIVE',
                lastLoginAt: new Date(),
            };

            const mockRequest = { user };
            const result = await controller.getProfile(mockRequest);

            expect(result).toEqual({ user });
        });
    });

    describe('forgotPassword', () => {
        it('should return password reset message', async () => {
            const forgotPasswordDto = { email: 'test@example.com' };

            const result = await controller.forgotPassword(forgotPasswordDto);

            expect(result.message).toContain('Si el email existe');
        });
    });

    describe('resetPassword', () => {
        it('should return password reset success message', async () => {
            const resetPasswordDto = {
                token: 'reset-token',
                password: 'newPassword123',
            };

            const result = await controller.resetPassword(resetPasswordDto);

            expect(result.message).toContain('contraseña restablecida');
        });
    });

    describe('verifyEmail', () => {
        it('should return email verification success message', async () => {
            const result = await controller.verifyEmail({ token: 'verify-token' });

            expect(result.message).toContain('Email verificado');
        });
    });

    describe('health', () => {
        it('should return health status', async () => {
            const result = await controller.health();

            expect(result.status).toBe('ok');
            expect(result.timestamp).toBeDefined();
        });
    });
});
