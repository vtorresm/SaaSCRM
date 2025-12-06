# Database Schema Design & Implementation Guide

## Prisma Schema Architecture

### Core Entities

```prisma
// User & Authentication
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          Role     @default(SALES_REP)
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  // Relations
  clients       Client[]
  quotes        Quote[]
  auditLogs     AuditLog[]
  
  @@map("users")
}

enum Role {
  SUPER_ADMIN
  ADMIN
  SALES_MANAGER
  SALES_REP
  DEVELOPER
  CLIENT
}

// Client Management (CRM)
model Client {
  id            String       @id @default(cuid())
  companyName   String
  contactName   String
  email         String
  phone         String?
  address       String?
  taxId         String?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?
  
  // Foreign Keys
  assignedToId  String
  assignedTo    User         @relation(fields: [assignedToId], references: [id])
  
  // Relations
  quotes        Quote[]
  projects      Project[]
  invoices      Invoice[]
  
  @@map("clients")
}

// Sales & Quote Management
model Quote {
  id              String        @id @default(cuid())
  quoteNumber     String        @unique
  title           String
  description     String?
  status          QuoteStatus   @default(DRAFT)
  version         Int           @default(1)
  currency        String        @default("USD")
  subtotal        Decimal       @default(0)
  taxAmount       Decimal       @default(0)
  discountAmount  Decimal       @default(0)
  totalAmount     Decimal       @default(0)
  validUntil      DateTime?
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  // Foreign Keys
  clientId        String
  client          Client        @relation(fields: [clientId], references: [id])
  createdById     String
  createdBy       User          @relation(fields: [createdById], references: [id])
  
  // Relations
  items           QuoteItem[]
  projects        Project[]
  invoices        Invoice[]
  attachments     Attachment[]
  
  @@map("quotes")
}

enum QuoteStatus {
  DRAFT
  SENT
  REVIEWING
  NEGOTIATING
  APPROVED
  REJECTED
  EXPIRED
}

model QuoteItem {
  id          String    @id @default(cuid())
  description String
  quantity    Decimal   @default(1)
  unitPrice   Decimal
  totalPrice  Decimal
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  
  // Foreign Keys
  quoteId     String
  quote       Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  
  // Relations
  serviceId   String?
  service     Service?  @relation(fields: [serviceId], references: [id])
  
  @@map("quote_items")
}

// Service Catalog
model Service {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  unitPrice   Decimal
  unit        String   @default("hour") // hour, project, month
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  quoteItems  QuoteItem[]
  
  @@map("services")
}

// Project Management
model Project {
  id            String        @id @default(cuid())
  name          String
  description   String?
  status        ProjectStatus @default(PLANNING)
  startDate     DateTime?
  endDate       DateTime?
  budget        Decimal?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Foreign Keys
  clientId      String
  client        Client        @relation(fields: [clientId], references: [id])
  quoteId       String?
  quote         Quote?        @relation(fields: [quoteId], references: [id])
  
  // Relations
  tasks         Task[]
  invoices      Invoice[]
  
  @@map("projects")
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  estimatedHours Decimal?
  actualHours Decimal?
  startDate   DateTime?
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Foreign Keys
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// Financial Management
model Invoice {
  id            String         @id @default(cuid())
  invoiceNumber String         @unique
  status        InvoiceStatus  @default(DRAFT)
  dueDate       DateTime
  paidDate      DateTime?
  subtotal      Decimal        @default(0)
  taxAmount     Decimal        @default(0)
  totalAmount   Decimal        @default(0)
  notes         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Foreign Keys
  clientId      String
  client        Client         @relation(fields: [clientId], references: [id])
  quoteId       String?
  quote         Quote?         @relation(fields: [quoteId], references: [id])
  projectId     String?
  project       Project?       @relation(fields: [projectId], references: [id])
  
  // Relations
  payments      Payment[]
  attachments   Attachment[]
  
  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model Payment {
  id            String        @id @default(cuid())
  amount        Decimal
  method        PaymentMethod
  reference     String?
  notes         String?
  paidAt        DateTime      @default(now())
  createdAt     DateTime      @default(now())
  
  // Foreign Keys
  invoiceId     String
  invoice       Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@map("payments")
}

enum PaymentMethod {
  BANK_TRANSFER
  CREDIT_CARD
  PAYPAL
  STRIPE
  CASH
  CHECK
}

// File Management
model Attachment {
  id        String   @id @default(cuid())
  filename  String
  originalName String
  mimeType  String
  size      Int
  path      String
  createdAt DateTime @default(now())
  
  // Foreign Keys
  quoteId   String?
  quote     Quote?   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  invoiceId String?
  invoice   Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@map("attachments")
}

// Audit & Compliance
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // CREATE, UPDATE, DELETE, LOGIN, etc.
  entity    String   // User, Client, Quote, etc.
  entityId  String
  oldValues Json?
  newValues Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  // Foreign Keys
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("audit_logs")
}

// Notifications
model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  data      Json?            // Additional data for the notification
  createdAt DateTime         @default(now())
  readAt    DateTime?
  
  // Foreign Keys
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  
  @@map("notifications")
}

enum NotificationType {
  QUOTE_SENT
  QUOTE_APPROVED
  QUOTE_REJECTED
  PAYMENT_RECEIVED
  INVOICE_OVERDUE
  PROJECT_ASSIGNED
}
```

## Indexes Strategy

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_clients_assigned_to ON clients(assigned_to_id);
CREATE INDEX idx_quotes_client_status ON quotes(client_id, status);
CREATE INDEX idx_quotes_created_by ON quotes(created_by_id);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Composite indexes for complex queries
CREATE INDEX idx_quotes_status_date ON quotes(status, created_at DESC);
CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
```

## Database Configuration

### Docker Compose Setup

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sales_crm
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      postgres 
      -c shared_preload_libraries=pg_stat_statements
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-admin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sales_crm?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=sales_crm

# Redis
REDIS_URL=redis://localhost:6379

# File Storage
S3_BUCKET_NAME=sales-crm-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
```

This schema provides a solid foundation for the SaaS CRM system with proper relationships, indexing, and scalability considerations.