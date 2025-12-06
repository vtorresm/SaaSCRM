import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global prefix for API routes
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    // Enable CORS
    const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
    app.enableCors({
        origin: corsOrigin.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new TransformInterceptor(),
    );

    // Swagger documentation
    if (configService.get('ENABLE_SWAGGER') === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Sales CRM API')
            .setDescription('API para SaaS CRM de gestión de ventas de software')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Enter JWT token',
                    in: 'header',
                },
                'JWT-auth',
            )
            .addTag('auth', 'Autenticación y autorización')
            .addTag('users', 'Gestión de usuarios')
            .addTag('companies', 'Gestión de empresas')
            .addTag('contacts', 'Gestión de contactos')
            .addTag('quotes', 'Gestión de cotizaciones')
            .addTag('projects', 'Gestión de proyectos')
            .addTag('invoices', 'Gestión de facturas')
            .addTag('dashboard', 'Dashboard y métricas')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }

    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);

    console.log(`🚀 Sales CRM API está ejecutándose en: http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();