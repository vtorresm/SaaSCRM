import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
            errorFormat: 'pretty',
        });
    }

    async onModuleInit() {
        this.logger.log('Connecting to database...');

        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('Successfully disconnected from database');
    }

    /**
     * Clean disconnect for graceful shutdowns
     */
    async cleanDisconnect(): Promise<void> {
        await this.$disconnect();
    }

    /**
     * Health check for database connection
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }

    /**
     * Enable query logging in development
     */
    enableQueryLogging() {
        // Query logging configuration for Prisma 6.x
        if (process.env.NODE_ENV === 'development') {
            this.logger.log('Query logging enabled');
        }
    }

    /**
     * Transaction wrapper with automatic error handling
     */
    async transaction<T>(
        fn: (prisma: PrismaClient) => Promise<T>,
        options?: {
            maxWait?: number;
            timeout?: number;
        },
    ): Promise<T> {
        try {
            return await this.$transaction(fn, options);
        } catch (error) {
            this.logger.error('Transaction failed', error);
            throw error;
        }
    }

    /**
     * Count records with error handling
     */
    async safeCount(model: any, where?: any): Promise<number> {
        try {
            return await model.count({ where });
        } catch (error) {
            this.logger.error(`Failed to count records in ${model.constructor.name}`, error);
            return 0;
        }
    }

    /**
     * Find many with pagination
     */
    async findManyPaginated(
        model: any,
        options: {
            where?: any;
            orderBy?: any;
            skip?: number;
            take?: number;
            include?: any;
            select?: any;
        },
    ) {
        try {
            const { skip = 0, take = 10, ...restOptions } = options;

            const [data, total] = await Promise.all([
                model.findMany({
                    ...restOptions,
                    skip,
                    take,
                }),
                model.count({
                    where: options.where,
                }),
            ]);

            return {
                data,
                pagination: {
                    total,
                    skip,
                    take,
                    totalPages: Math.ceil(total / take),
                    currentPage: Math.floor(skip / take) + 1,
                },
            };
        } catch (error) {
            this.logger.error('Failed to fetch paginated data', error);
            throw error;
        }
    }
}