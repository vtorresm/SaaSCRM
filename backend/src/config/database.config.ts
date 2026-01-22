import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => ({
    url: process.env.DATABASE_URL,
    testUrl: process.env.DATABASE_URL_TEST,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'sales_crm_dev',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));