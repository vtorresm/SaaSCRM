# Security & Deployment Architecture Guide

## 1. Security Architecture

### 1.1 Authentication & Authorization Strategy

#### JWT Implementation
```typescript
// Authentication Service
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      permissions: await this.getUserPermissions(user.role)
    };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET')
    });
    
    const refreshToken = this.jwtService.sign(
      { sub: user.id }, 
      { expiresIn: '7d', secret: this.configService.get('JWT_REFRESH_SECRET') }
    );
    
    await this.saveRefreshToken(user.id, refreshToken);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    
    const storedToken = await this.getStoredRefreshToken(payload.sub);
    if (storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const user = await this.userService.findById(payload.sub);
    return this.login(user);
  }
}
```

#### Role-Based Access Control (RBAC)
```typescript
// Roles Enum
export enum Permission {
  // Users
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  
  // Clients
  CLIENTS_CREATE = 'clients:create',
  CLIENTS_READ = 'clients:read',
  CLIENTS_UPDATE = 'clients:update',
  CLIENTS_DELETE = 'clients:delete',
  
  // Quotes
  QUOTES_CREATE = 'quotes:create',
  QUOTES_READ = 'quotes:read',
  QUOTES_UPDATE = 'quotes:update',
  QUOTES_DELETE = 'quotes:delete',
  QUOTES_APPROVE = 'quotes:approve',
  
  // Finance
  FINANCE_READ = 'finance:read',
  FINANCE_UPDATE = 'finance:update',
  INVOICES_CREATE = 'invoices:create',
  PAYMENTS_CREATE = 'payments:create',
  
  // Admin
  ADMIN_PANEL = 'admin:panel',
  SYSTEM_CONFIG = 'system:config'
}

// Role-Permission Matrix
const ROLE_PERMISSIONS = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.USERS_READ,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_READ,
    Permission.CLIENTS_UPDATE,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
    Permission.QUOTES_APPROVE,
    Permission.FINANCE_READ,
    Permission.INVOICES_CREATE,
    Permission.PAYMENTS_CREATE,
  ],
  [Role.SALES_MANAGER]: [
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_READ,
    Permission.CLIENTS_UPDATE,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
    Permission.QUOTES_APPROVE,
    Permission.FINANCE_READ,
  ],
  [Role.SALES_REP]: [
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_READ,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
  ],
  [Role.DEVELOPER]: [
    Permission.CLIENTS_READ,
    Permission.QUOTES_READ,
    Permission.FINANCE_READ,
  ],
  [Role.CLIENT]: [
    Permission.CLIENTS_READ,
  ],
};

// Permission Guard
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<Permission>(
      'permission',
      context.getHandler(),
    );
    
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return ROLE_PERMISSIONS[user.role].includes(requiredPermission);
  }
}
```

### 1.2 Security Middleware

#### Rate Limiting
```typescript
// Rate limiting configuration
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ThrottlerGuard)
      .forRoutes('*');
  }
}

// Custom throttling for sensitive endpoints
@Throttle(5, 60) // 5 requests per minute
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Login logic
}
```

#### Security Headers
```typescript
// Helmet configuration
import helmet from 'helmet';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityHeadersInterceptor,
    },
  ],
})
export class SecurityModule {}

@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.setHeader('Content-Security-Policy', "default-src 'self'");
    
    return next.handle();
  }
}
```

## 2. GDPR Compliance Implementation

### 2.1 Data Privacy Features

#### Data Export
```typescript
// GDPR Data Export Service
@Injectable()
export class DataExportService {
  async exportUserData(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    const clients = await this.clientService.findByUser(userId);
    const quotes = await this.quoteService.findByUser(userId);
    const projects = await this.projectService.findByUser(userId);
    
    return {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
      clients: clients.map(client => ({
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        createdAt: client.createdAt,
      })),
      quotes: quotes.map(quote => ({
        quoteNumber: quote.quoteNumber,
        title: quote.title,
        totalAmount: quote.totalAmount,
        status: quote.status,
        createdAt: quote.createdAt,
      })),
      projects: projects.map(project => ({
        name: project.name,
        status: project.status,
        budget: project.budget,
        createdAt: project.createdAt,
      })),
    };
  }
}
```

#### Right to Deletion
```typescript
// GDPR Data Deletion Service
@Injectable()
export class DataDeletionService {
  async deleteUserData(userId: string): Promise<void> {
    // Anonymize instead of hard delete for audit purposes
    await this.userService.anonymizeUser(userId);
    
    // Update audit log
    await this.auditLogService.log({
      action: 'USER_DATA_ANONYMIZED',
      entity: 'User',
      entityId: userId,
      newValues: { isAnonymized: true },
    });
  }

  async anonymizeUser(userId: string): Promise<void> {
    await this.userService.update(userId, {
      email: `deleted_${Date.now()}@deleted.local`,
      firstName: 'Deleted',
      lastName: 'User',
      passwordHash: '',
      isActive: false,
      deletedAt: new Date(),
    });
  }
}
```

## 3. Deployment Architecture

### 3.1 Docker Configuration

#### Backend Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Kubernetes Deployment

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sales-crm-api
  labels:
    app: sales-crm-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sales-crm-api
  template:
    metadata:
      labels:
        app: sales-crm-api
    spec:
      containers:
      - name: api
        image: sales-crm-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sales-crm-api-service
spec:
  selector:
    app: sales-crm-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### 3.3 CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Generate test coverage
      run: npm run test:coverage

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add deployment commands here
    
    - name: Run E2E tests
      run: npm run test:e2e:staging
    
    - name: Deploy to production
      if: success()
      run: |
        echo "Deploying to production environment..."
        # Add production deployment commands here
```

This comprehensive security and deployment guide ensures robust protection of user data, compliance with regulations, and scalable infrastructure deployment.