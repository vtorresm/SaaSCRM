import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { winstonConfig } from './winston.config';

export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, stack?: string, context?: string) {
    this.logger.error(message, { context, stack });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Método adicional para logging estructurado
  logWithMeta(level: string, message: string, meta: any = {}, context?: string) {
    this.logger.log(level, message, { context, ...meta });
  }

  // Método para logging de requests HTTP
  logRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string) {
    this.logger.info('HTTP Request', {
      context: 'HTTP',
      method,
      url,
      statusCode,
      responseTime,
      userId,
    });
  }

  // Método para logging de errores de base de datos
  logDatabaseError(operation: string, error: any, collection?: string) {
    this.logger.error('Database Error', {
      context: 'Database',
      operation,
      collection,
      error: error.message,
      stack: error.stack,
    });
  }

  // Método para logging de autenticación
  logAuth(action: string, userId?: string, success: boolean = true, ip?: string) {
    this.logger.info('Authentication Event', {
      context: 'Auth',
      action,
      userId,
      success,
      ip,
    });
  }
}