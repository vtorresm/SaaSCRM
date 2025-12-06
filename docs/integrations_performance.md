# Integration Services & Performance Architecture

## 1. Payment Gateway Integration

### 1.1 Multi-Provider Payment Strategy

#### Payment Provider Interface
```typescript
// interfaces/payment-provider.interface.ts
export interface PaymentProvider {
  // Create payment intent for quotes/invoices
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    reference: string;
    description: string;
    customerEmail: string;
  }): Promise<PaymentIntent>;

  // Process refund
  refundPayment(paymentId: string, amount?: number): Promise<Refund>;

  // Verify webhook signature
  verifyWebhook(payload: string, signature: string): boolean;

  // Get payment status
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;

  // Handle subscription payments (for retainer services)
  createSubscription(params: {
    customerId: string;
    priceId: string;
    paymentMethodId: string;
  }): Promise<Subscription>;
}
```

#### Stripe Implementation
```typescript
// services/stripe-provider.service.ts
@Injectable()
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    reference: string;
    description: string;
    customerEmail: string;
  }): Promise<PaymentIntent> {
    try {
      // Create or retrieve customer
      const customer = await this.getOrCreateCustomer(params.customerEmail);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        customer: customer.id,
        description: params.description,
        metadata: {
          reference: params.reference,
          type: 'quote_payment',
        },
        // Enable automatic payment methods
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      throw new PaymentProviderError('Failed to create payment intent', error);
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason,
      };
    } catch (error) {
      throw new PaymentProviderError('Failed to process refund', error);
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    try {
      const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async getOrCreateCustomer(email: string): Promise<Stripe.Customer> {
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    return await this.stripe.customers.create({
      email,
    });
  }
}
```

#### PayPal Implementation
```typescript
// services/paypal-provider.service.ts
@Injectable()
export class PayPalProvider implements PaymentProvider {
  private paypal: paypal.core.PayPalHttpClient;

  constructor(private readonly configService: ConfigService) {
    const environment = new paypal.core.SandboxEnvironment(
      this.configService.get('PAYPAL_CLIENT_ID'),
      this.configService.get('PAYPAL_CLIENT_SECRET')
    );
    this.paypal = new paypal.core.PayPalHttpClient(environment);
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    reference: string;
    description: string;
    customerEmail: string;
  }): Promise<PaymentIntent> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.reference,
          description: params.description,
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      payer: {
        email_address: params.customerEmail,
      },
      application_context: {
        return_url: `${this.configService.get('APP_URL')}/payment/success`,
        cancel_url: `${this.configService.get('APP_URL')}/payment/cancel`,
      },
    });

    const response = await this.paypal.execute(request);
    
    return {
      id: response.result.id,
      approvalUrl: response.result.links.find(link => link.rel === 'approve')?.href,
      status: 'pending',
      amount: params.amount,
      currency: params.currency,
    };
  }
}
```

### 1.2 Webhook Handler

```typescript
// controllers/webhooks.controller.ts
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeProvider: StripeProvider,
    private readonly paypalProvider: PayPalProvider,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() request: Request, @Res() response: Response) {
    const signature = request.headers['stripe-signature'] as string;
    const payload = JSON.stringify(request.body);

    if (!this.stripeProvider.verifyWebhook(payload, signature)) {
      return response.status(400).send('Invalid signature');
    }

    try {
      const event = JSON.parse(payload);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaid(event.data.object);
          break;
      }

      return response.status(200).send('OK');
    } catch (error) {
      return response.status(500).send('Webhook handler failed');
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    await this.paymentService.markAsPaid({
      provider: 'stripe',
      providerId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: 'succeeded',
    });
  }
}
```

## 2. Email Service Integration

### 2.1 React Email Templates

```typescript
// templates/quote-email.tsx
import * as React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Button, Img } from '@react-email/components';

interface QuoteEmailProps {
  clientName: string;
  quoteNumber: string;
  totalAmount: number;
  validUntil: Date;
  quoteUrl: string;
  companyLogo?: string;
  companyName: string;
}

export default function QuoteEmail({
  clientName,
  quoteNumber,
  totalAmount,
  validUntil,
  quoteUrl,
  companyLogo,
  companyName,
}: QuoteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Quote {quoteNumber} - {companyName}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {companyLogo && (
            <Img
              src={companyLogo}
              width="150"
              height="50"
              alt={companyName}
              style={{ marginBottom: '20px' }}
            />
          )}
          
          <Heading style={{ color: '#2563eb', marginBottom: '20px' }}>
            Nueva Cotización
          </Heading>
          
          <Text style={{ fontSize: '16px', marginBottom: '15px' }}>
            Hola {clientName},
          </Text>
          
          <Text style={{ fontSize: '16px', marginBottom: '15px' }}>
            Hemos preparado una cotización para ti. Aquí están los detalles:
          </Text>
          
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', marginBottom: '5px' }}>
              <strong>Número de Cotización:</strong> {quoteNumber}
            </Text>
            <Text style={{ fontSize: '14px', marginBottom: '5px' }}>
              <strong>Monto Total:</strong> ${totalAmount.toFixed(2)}
            </Text>
            <Text style={{ fontSize: '14px' }}>
              <strong>Válida hasta:</strong> {validUntil.toLocaleDateString('es-ES')}
            </Text>
          </div>
          
          <Button
            href={quoteUrl}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Ver Cotización
          </Button>
          
          <Text style={{ fontSize: '14px', marginTop: '30px', color: '#6b7280' }}>
            Si tienes alguna pregunta, no dudes en contactarnos.
          </Text>
          
          <Text style={{ fontSize: '14px', marginTop: '10px' }}>
            Saludos,<br />
            Equipo de {companyName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### 2.2 Email Service Implementation

```typescript
// services/email.service.ts
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly renderer: ReactEmailRenderer,
  ) {}

  async sendQuoteEmail(params: {
    to: string;
    clientName: string;
    quoteNumber: string;
    totalAmount: number;
    validUntil: Date;
    quoteUrl: string;
  }): Promise<void> {
    const template = render(
      <QuoteEmail
        clientName={params.clientName}
        quoteNumber={params.quoteNumber}
        totalAmount={params.totalAmount}
        validUntil={params.validUntil}
        quoteUrl={params.quoteUrl}
        companyName={this.configService.get('COMPANY_NAME')}
        companyLogo={this.configService.get('COMPANY_LOGO')}
      />
    );

    await this.sendEmail({
      to: params.to,
      subject: `Cotización ${params.quoteNumber} - ${this.configService.get('COMPANY_NAME')}`,
      html: template,
      from: {
        email: this.configService.get('FROM_EMAIL'),
        name: this.configService.get('COMPANY_NAME'),
      },
    });
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    from: { email: string; name: string };
  }): Promise<void> {
    // Using SendGrid or similar service
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));

    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      html: params.html,
    });
  }
}
```

## 3. Performance & Caching Strategy

### 3.1 Redis Cache Implementation

```typescript
// services/cache.service.ts
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 3.2 Query Cache Decorator

```typescript
// decorators/cache.decorator.ts
export function Cacheable(options: {
  key: string;
  ttl: number;
  invalidateOn?: string[];
} = { key: '', ttl: 300 }) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = generateCacheKey(options.key, args);
      const cacheService = this.cacheService;
      
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.set(cacheKey, result, options.ttl);
      
      return result;
    };

    return descriptor;
  };
}

function generateCacheKey(prefix: string, args: any[]): string {
  const argsHash = crypto
    .createHash('md5')
    .update(JSON.stringify(args))
    .digest('hex');
    
  return `${prefix}:${argsHash}`;
}
```

### 3.3 Database Query Optimization

```typescript
// services/quotes.service.ts
@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @Cacheable({ key: 'quotes:list', ttl: 300 })
  async getQuotes(params: {
    clientId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { clientId, status, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const where = {
      ...(clientId && { clientId }),
      ...(status && { status }),
      deletedAt: null,
    };

    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          client: {
            select: { companyName: true, contactName: true },
          },
          items: {
            include: {
              service: {
                select: { name: true, unitPrice: true },
              },
            },
          },
          createdBy: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async invalidateQuotesCache(clientId?: string): Promise<void> {
    const patterns = ['quotes:list:*'];
    if (clientId) {
      patterns.push(`quotes:client:${clientId}:*`);
    }
    
    await Promise.all(
      patterns.map(pattern => this.cacheService.invalidatePattern(pattern))
    );
  }
}
```

## 4. File Storage & CDN

### 4.1 S3 Storage Service

```typescript
// services/storage.service.ts
@Injectable()
export class StorageService {
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get('S3_ENDPOINT'), // For MinIO
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadFile(params: {
    file: Buffer;
    filename: string;
    mimeType: string;
    folder?: string;
  }): Promise<{ url: string; key: string }> {
    const key = `${params.folder || 'uploads'}/${Date.now()}-${params.filename}`;
    
    await this.s3
      .putObject({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key,
        Body: params.file,
        ContentType: params.mimeType,
        ACL: 'private',
      })
      .promise();

    return {
      key,
      url: await this.getSignedUrl(key),
    };
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('S3_BUCKET'),
      Key: key,
      Expires: expiresIn,
    });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key,
      })
      .promise();
  }
}
```

### 4.2 File Upload Component

```typescript
// components/file-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function FileUpload({ onUploadComplete }: { onUploadComplete: (file: File) => void }) {
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      return response.json();
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      setProgress(percentCompleted);
    },
    onSuccess: () => {
      setProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isLoading}
      >
        {uploadMutation.isLoading ? 'Subiendo...' : 'Seleccionar archivo'}
      </Button>
      
      {progress > 0 && progress < 100 && (
        <Progress value={progress} className="w-full" />
      )}
    </div>
  );
}
```

## 5. Monitoring & Observability

### 5.1 Application Monitoring

```typescript
// services/monitoring.service.ts
@Injectable()
export class MonitoringService {
  constructor(private readonly configService: ConfigService) {}

  async trackEvent(event: {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
  }): Promise<void> {
    // Implementation for analytics tracking
    // Could integrate with Google Analytics, Mixpanel, etc.
  }

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    // Send to error tracking service (Sentry, DataDog, etc.)
    console.error('Application Error:', error, context);
  }

  async trackPerformance(metric: {
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count';
    tags?: Record<string, string>;
  }): Promise<void> {
    // Send to monitoring service
    console.log('Performance Metric:', metric);
  }
}
```

### 5.2 Health Checks

```typescript
// controllers/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  async healthCheck() {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      storage: await this.checkStorage(),
      timestamp: new Date().toISOString(),
    };

    const isHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : true
    );

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      await this.monitoringService.trackError(error, { component: 'database' });
      return false;
    }
  }

  private async checkCache(): Promise<boolean> {
    try {
      await this.cacheService.set('health-check', 'ok', 10);
      const result = await this.cacheService.get('health-check');
      return result === 'ok';
    } catch (error) {
      await this.monitoringService.trackError(error, { component: 'cache' });
      return false;
    }
  }
}
```

This comprehensive integration and performance architecture ensures robust external service integration, optimal caching strategies, and comprehensive monitoring for the SaaS CRM system.