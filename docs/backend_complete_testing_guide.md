# 🧪 Guía Completa de Pruebas del Backend

## 📋 Resumen

Esta guía proporciona instrucciones paso a paso para probar todas las funcionalidades del backend implementado en los sprints 1-10, incluyendo configuración, casos de prueba y flujos completos.

## 🏗️ Configuración del Entorno de Pruebas

### Prerrequisitos

1. Node.js v18+
2. PostgreSQL 14+
3. Redis (para caching)
4. Docker (opcional para contenedores)

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"

# Email (para pruebas)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourapp.com"

# Stripe (modo sandbox)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal (modo sandbox)
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# API
API_PREFIX="api/v1"
```

### Instalación y Setup

```bash
# Instalar dependencias
npm install

# Configurar base de datos
createdb crm_db
npx prisma migrate dev
npx prisma db seed

# Ejecutar servidor
npm run start:dev
```

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "SUPER_ADMIN"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Guardar el token JWT de la respuesta para las siguientes peticiones**

```bash
TOKEN="your-jwt-token-here"
```

## 👥 Gestión de Usuarios

### Crear Usuario

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "password": "Password123!",
    "role": "SALES_REP"
  }'
```

### Listar Usuarios

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Actualizar Usuario

```bash
curl -X PUT http://localhost:3000/api/v1/users/{userId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan Carlos",
    "phone": "+51 999 888 777"
  }'
```

## 🏢 Gestión de Empresas

### Crear Empresa

```bash
curl -X POST http://localhost:3000/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Tech Solutions S.A.C.",
    "legalName": "Tech Solutions Sociedad Anónima Cerrada",
    "taxId": "20123456789",
    "email": "contact@techsolutions.com",
    "phone": "+51 999 888 777",
    "address": "Av. Larco 123",
    "city": "Miraflores",
    "country": "Perú",
    "paymentTerms": 30,
    "currency": "PEN"
  }'
```

### Listar Empresas

```bash
curl -X GET http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer $TOKEN"
```

## 👤 Gestión de Contactos

### Crear Contacto

```bash
curl -X POST http://localhost:3000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "María",
    "lastName": "González",
    "email": "maria.gonzalez@cliente.com",
    "phone": "+51 999 777 666",
    "position": "Gerente de IT",
    "companyId": "{companyId}"
  }'
```

### Listar Contactos

```bash
curl -X GET http://localhost:3000/api/v1/contacts \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Gestión de Cotizaciones

### Crear Cotización

```bash
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Desarrollo de Sistema CRM",
    "description": "Implementación completa de CRM personalizado",
    "clientId": "{companyId}",
    "assignedToId": "{userId}",
    "validUntil": "2024-02-01T00:00:00.000Z",
    "priority": "HIGH",
    "items": [
      {
        "description": "Desarrollo backend",
        "quantity": 80,
        "unitPrice": 150,
        "taxRate": 0.18,
        "discount": 0
      },
      {
        "description": "Desarrollo frontend",
        "quantity": 60,
        "unitPrice": 120,
        "taxRate": 0.18,
        "discount": 0
      }
    ]
  }'
```

### Enviar Cotización

```bash
curl -X POST http://localhost:3000/api/v1/quotes/{quoteId}/send \
  -H "Authorization: Bearer $TOKEN"
```

### Aceptar Cotización

```bash
curl -X PATCH http://localhost:3000/api/v1/quotes/{quoteId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "ACCEPTED"}'
```

## 🏗️ Gestión de Proyectos

### Crear Proyecto

```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Implementación CRM",
    "description": "Proyecto de implementación del sistema CRM",
    "companyId": "{companyId}",
    "quoteId": "{quoteId}",
    "budget": 15000,
    "startDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-03-15T00:00:00.000Z"
  }'
```

## 💰 Gestión de Facturas

### Crear Factura desde Cotización

```bash
curl -X POST http://localhost:3000/api/v1/invoices/from-quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "quoteId": "{quoteId}",
    "createdById": "{userId}",
    "dueDate": "2024-02-15T00:00:00.000Z"
  }'
```

### Crear Factura Manual

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "clientId": "{companyId}",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "taxRate": 0.18,
    "items": [
      {
        "description": "Servicio de consultoría",
        "quantity": 10,
        "unitPrice": 500,
        "taxRate": 0.18,
        "taxType": "IVA_18"
      }
    ]
  }'
```

### Enviar Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices/{invoiceId}/send \
  -H "Authorization: Bearer $TOKEN"
```

### Generar PDF de Factura

```bash
curl -X GET http://localhost:3000/api/v1/invoices/{invoiceId}/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output invoice.pdf
```

## 💳 Procesamiento de Pagos

### Crear Intención de Pago (Stripe)

```bash
curl -X POST http://localhost:3000/api/v1/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "invoiceId": "{invoiceId}"
  }'
```

### Agregar Pago a Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices/{invoiceId}/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 1000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TXN123456",
    "notes": "Pago por transferencia bancaria"
  }'
```

### Crear Pago con PayPal

```bash
curl -X POST http://localhost:3000/api/v1/paypal/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "description": "Pago de factura",
    "invoiceId": "{invoiceId}"
  }'
```

## 📊 Reportes y Analytics

### Generar Reporte Financiero

```bash
curl -X POST http://localhost:3000/api/v1/reports/financial \
  -H "Authorization: Bearer $TOKEN"
```

### Generar Reporte de Ingresos

```bash
curl -X POST http://localhost:3000/api/v1/reports/revenue \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Generar Reporte Fiscal

```bash
curl -X POST http://localhost:3000/api/v1/reports/fiscal \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Obtener Dashboard Data

```bash
curl -X GET http://localhost:3000/api/v1/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## 📱 Pagos Móviles con QR

### Generar Código QR para Pago

```bash
curl -X GET http://localhost:3000/api/v1/qr/payment/{invoiceId} \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Casos de Prueba Completos

### Flujo Completo: De Cotización a Pago

1. **Crear Empresa**
2. **Crear Contacto**
3. **Crear Cotización**
4. **Enviar Cotización**
5. **Aceptar Cotización**
6. **Crear Factura desde Cotización**
7. **Enviar Factura**
8. **Generar QR para Pago**
9. **Procesar Pago**
10. **Generar Reportes**

### Casos de Error

#### Usuario ya existe
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
# Debería retornar 409 Conflict
```

#### Acceso sin autenticación
```bash
curl -X GET http://localhost:3000/api/v1/users
# Debería retornar 401 Unauthorized
```

#### Factura no encontrada
```bash
curl -X GET http://localhost:3000/api/v1/invoices/non-existent-id \
  -H "Authorization: Bearer $TOKEN"
# Debería retornar 404 Not Found
```

## 📋 Pruebas con Postman

### Configuración del Entorno

1. **Crear Entorno en Postman**
   - Nombre: `CRM Backend Testing`
   - Variables:
     ```
     base_url: http://localhost:3000
     api_prefix: api/v1
     jwt_token: (se llenará después)
     ```

2. **Importar Variables Globales**
   - `{{base_url}}`
   - `{{api_prefix}}`
   - `{{jwt_token}}`

### Colección de Pruebas

#### 1. Autenticación

**Registro de Usuario**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/auth/register`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "SUPER_ADMIN"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Response has id", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('id');
  });
  ```

**Login**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "Admin123!"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Response has access token", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('access_token');
      pm.environment.set("jwt_token", jsonData.access_token);
  });
  ```

#### 2. Gestión de Usuarios

**Crear Usuario**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/users`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "password": "Password123!",
    "role": "SALES_REP"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("User created successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('email', 'juan.perez@example.com');
  });
  ```

**Listar Usuarios**
- **Método**: GET
- **URL**: `{{base_url}}/{{api_prefix}}/users`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Response is array", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.be.an('array');
  });
  ```

#### 3. Gestión de Empresas

**Crear Empresa**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/companies`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "name": "Tech Solutions S.A.C.",
    "legalName": "Tech Solutions Sociedad Anónima Cerrada",
    "taxId": "20123456789",
    "email": "contact@techsolutions.com",
    "phone": "+51 999 888 777",
    "address": "Av. Larco 123",
    "city": "Miraflores",
    "country": "Perú",
    "paymentTerms": 30,
    "currency": "PEN"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Company created successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('name', 'Tech Solutions S.A.C.');
      pm.environment.set("company_id", jsonData.id);
  });
  ```

#### 4. Gestión de Contactos

**Crear Contacto**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/contacts`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "firstName": "María",
    "lastName": "González",
    "email": "maria.gonzalez@cliente.com",
    "phone": "+51 999 777 666",
    "position": "Gerente de IT",
    "companyId": "{{company_id}}"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Contact created successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('email', 'maria.gonzalez@cliente.com');
      pm.environment.set("contact_id", jsonData.id);
  });
  ```

#### 5. Gestión de Cotizaciones

**Crear Cotización**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/quotes`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "title": "Desarrollo de Sistema CRM",
    "description": "Implementación completa de CRM personalizado",
    "clientId": "{{company_id}}",
    "assignedToId": "{{user_id}}",
    "validUntil": "2024-02-01T00:00:00.000Z",
    "priority": "HIGH",
    "items": [
      {
        "description": "Desarrollo backend",
        "quantity": 80,
        "unitPrice": 150,
        "taxRate": 0.18,
        "discount": 0
      },
      {
        "description": "Desarrollo frontend",
        "quantity": 60,
        "unitPrice": 120,
        "taxRate": 0.18,
        "discount": 0
      }
    ]
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Quote created successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('title', 'Desarrollo de Sistema CRM');
      pm.expect(jsonData).to.have.property('totalAmount');
      pm.environment.set("quote_id", jsonData.id);
  });
  ```

**Enviar Cotización**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/quotes/{{quote_id}}/send`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Quote sent successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('message', 'Quote sent successfully');
  });
  ```

**Aceptar Cotización**
- **Método**: PATCH
- **URL**: `{{base_url}}/{{api_prefix}}/quotes/{{quote_id}}/status`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Quote accepted successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('status', 'ACCEPTED');
  });
  ```

#### 6. Gestión de Facturas

**Crear Factura desde Cotización**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/invoices/from-quote`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "quoteId": "{{quote_id}}",
    "createdById": "{{user_id}}",
    "dueDate": "2024-02-15T00:00:00.000Z"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Invoice created successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('invoiceNumber');
      pm.expect(jsonData).to.have.property('totalAmount');
      pm.environment.set("invoice_id", jsonData.id);
  });
  ```

**Enviar Factura**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/invoices/{{invoice_id}}/send`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Invoice sent successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('message', 'Invoice sent successfully');
  });
  ```

**Generar PDF de Factura**
- **Método**: GET
- **URL**: `{{base_url}}/{{api_prefix}}/invoices/{{invoice_id}}/pdf`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Response is PDF", function () {
      pm.expect(pm.response.headers.get("Content-Type")).to.include("application/pdf");
  });
  ```

#### 7. Procesamiento de Pagos

**Crear Intención de Pago (Stripe)**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/stripe/create-payment-intent`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "amount": 1000,
    "currency": "usd",
    "invoiceId": "{{invoice_id}}"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Payment intent created", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('clientSecret');
  });
  ```

**Agregar Pago a Factura**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/invoices/{{invoice_id}}/payments`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "amount": 1000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TXN123456",
    "notes": "Pago por transferencia bancaria"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  
  pm.test("Payment added successfully", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('amount', 1000);
  });
  ```

#### 8. Reportes

**Generar Reporte Financiero**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/reports/financial`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Financial report generated", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('title', 'Financial Overview Report');
      pm.expect(jsonData).to.have.property('summary');
  });
  ```

**Generar Reporte Fiscal**
- **Método**: POST
- **URL**: `{{base_url}}/{{api_prefix}}/reports/fiscal`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
  ```json
  {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Fiscal report generated", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('title');
      pm.expect(jsonData).to.have.property('totalTaxCollected');
  });
  ```

**Obtener Dashboard Data**
- **Método**: GET
- **URL**: `{{base_url}}/{{api_prefix}}/reports/dashboard`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("Dashboard data retrieved", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('invoiceStats');
      pm.expect(jsonData).to.have.property('userStats');
  });
  ```

#### 9. Pagos Móviles con QR

**Generar Código QR para Pago**
- **Método**: GET
- **URL**: `{{base_url}}/{{api_prefix}}/qr/payment/{{invoice_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  
  pm.test("QR code generated", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property('qrCode');
      pm.expect(jsonData).to.have.property('paymentUrl');
  });
  ```

### Variables de Entorno en Postman

**Configuración de Variables:**
```javascript
// En la pestaña "Environments" de Postman
{
  "base_url": "http://localhost:3000",
  "api_prefix": "api/v1",
  "jwt_token": "",
  "company_id": "",
  "contact_id": "",
  "quote_id": "",
  "invoice_id": "",
  "user_id": ""
}
```

### Scripts de Prueba Avanzados

**Validación de Estructura de Respuesta:**
```javascript
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    const requiredFields = ['id', 'createdAt', 'updatedAt'];
    
    requiredFields.forEach(field => {
        pm.expect(jsonData).to.have.property(field);
    });
});
```

**Validación de Datos:**
```javascript
pm.test("Data validation", function () {
    const jsonData = pm.response.json();
    
    // Validar email
    pm.expect(jsonData.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    
    // Validar fechas
    pm.expect(new Date(jsonData.createdAt)).to.be.a('date');
    pm.expect(new Date(jsonData.updatedAt)).to.be.a('date');
});
```

### Runner de Pruebas

**Para ejecutar toda la colección:**

1. Abrir Postman
2. Importar la colección
3. Seleccionar el entorno "CRM Backend Testing"
4. Ir a "Runner"
5. Seleccionar la colección y el entorno
6. Ejecutar

**Configuración del Runner:**
- Iterations: 1
- Delay: 100ms
- Environment: CRM Backend Testing

### Reportes de Pruebas

**Exportar Resultados:**
```javascript
// En el script de test de la colección
pm.test("Save test results", function () {
    const results = {
        test: pm.test.name,
        passed: pm.test.passed,
        responseTime: pm.response.responseTime,
        responseBody: pm.response.text()
    };
    
    // Guardar en variables
    pm.environment.set("last_test_result", JSON.stringify(results));
});
```

## 🧪 Ejecución de Pruebas Automatizadas

### Pruebas Unitarias

```bash
# Ejecutar todas las pruebas unitarias
npm run test:unit

# Ejecutar pruebas de un módulo específico
npm run test:unit -- --testPathPattern=invoices
```

### Pruebas de Integración

```bash
# Ejecutar pruebas de integración
npm run test:integration
```

### Pruebas E2E

```bash
# Ejecutar pruebas end-to-end
npm run test:e2e
```

### Cobertura de Pruebas

```bash
# Generar reporte de cobertura
npm run test:coverage
```

## 📊 Monitoreo y Health Checks

### Health Check

```bash
curl -X GET http://localhost:3000/health
```

### Métricas de Rendimiento

- Tiempo de respuesta API < 200ms
- Tasa de éxito de pagos > 99%
- Cobertura de pruebas > 85%

## 🔧 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a BD**
   - Verificar DATABASE_URL
   - Asegurar que PostgreSQL esté ejecutándose

2. **JWT expirado**
   - Hacer login nuevamente para obtener nuevo token

3. **Errores de validación**
   - Verificar formato de datos enviados
   - Revisar campos requeridos

4. **Pagos no procesados**
   - Verificar configuración de Stripe/PayPal
   - Revisar logs del servidor

## 📝 Scripts de Testing Útiles

### Script de Setup Completo

```bash
#!/bin/bash

# Setup completo para testing
echo "🚀 Iniciando setup de testing..."

# Instalar dependencias
npm install

# Configurar base de datos
createdb crm_test
export DATABASE_URL="postgresql://user:pass@localhost:5432/crm_test"
npx prisma migrate deploy
npx prisma db seed

# Ejecutar pruebas
npm run test:e2e

echo "✅ Setup completado"
```

### Script de Datos de Prueba

```bash
#!/bin/bash

# Crear datos de prueba
echo "📝 Creando datos de prueba..."

# Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | jq -r '.access_token')

# Crear empresa de prueba
COMPANY_ID=$(curl -s -X POST http://localhost:3000/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Empresa Prueba","email":"test@empresa.com"}' | jq -r '.id')

echo "🏢 Empresa creada: $COMPANY_ID"
echo "🔑 Token: $TOKEN"
```

## 🎯 Checklist de Testing

### Pre-Testing
- [ ] Base de datos configurada
- [ ] Variables de entorno seteadas
- [ ] Servidor ejecutándose
- [ ] Datos de prueba creados

### Testing por Módulo
- [ ] ✅ Autenticación (login/register)
- [ ] ✅ Usuarios (CRUD)
- [ ] ✅ Empresas (CRUD)
- [ ] ✅ Contactos (CRUD)
- [ ] ✅ Cotizaciones (CRUD + envío)
- [ ] ✅ Proyectos (CRUD)
- [ ] ✅ Facturas (CRUD + PDF)
- [ ] ✅ Pagos (Stripe + PayPal)
- [ ] ✅ Reportes (financieros + fiscales)
- [ ] ✅ QR (pagos móviles)

### Post-Testing
- [ ] Reportes de cobertura generados
- [ ] Logs de error revisados
- [ ] Rendimiento validado

Esta guía proporciona todo lo necesario para probar exhaustivamente el backend del sistema CRM implementado en los sprints 1-10.