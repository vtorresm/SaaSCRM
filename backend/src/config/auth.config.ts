import { registerAs } from '@nestjs/config';

export const AuthConfig = registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    accountLockoutTime: parseInt(process.env.ACCOUNT_LOCKOUT_TIME, 10) || 30,
}));