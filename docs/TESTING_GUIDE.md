# 🧪 Guía Completa de Testing - SaaS CRM Backend

## 📋 Resumen Ejecutivo

Esta guía proporciona instrucciones paso a paso para configurar, probar y validar todas las funcionalidades del backend del sistema SaaS CRM. Incluye flujos completos desde la autenticación hasta los reportes, con ejemplos prácticos y comandos ejecutables.

## 🏗️ 1. Configuración del Entorno de Testing

### Prerrequisitos del Sistema

```bash
# Verificar versiones mínimas
node --version      # v18.0.0 o superior
npm --version       # v8.0.0 o superior
docker --version    # v20.0.0 o superior
```

### Instalación de Dependencias

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd sales-crm-saas

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno (.env)

```env
# Base de Datos
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/sales_crm_dev"

# JWT
JWT_SECRET="sales-crm-super-secret-jwt-key-2024"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="sales-crm-super-secret-refresh-key-2024"
JWT_REFRESH_EXPIRATION="7d"

# Redis
REDIS_URL="redis://:redis123@localhost:6379"

# Email (para testing)
EMAIL_HOST="localhost"
EMAIL_PORT=1025

# Stripe (modo sandbox)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# PayPal (modo sandbox)
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# API
API_PREFIX="api/v1"
PORT=3001
```

### Setup de Base de Datos con Docker

```bash
# 1. Iniciar servicios de infraestructura
docker-compose up -d postgres redis minio

# 2. Esperar a que los servicios estén listos
sleep 10

# 3. Generar cliente Prisma
npx prisma generate

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Poblar con datos de prueba
npx prisma db seed
```

### Verificación del Setup

```bash
# 1. Verificar servicios Docker
docker-compose ps

# 2. Verificar conectividad a BD
npx prisma studio

# 3. Ejecutar servidor en modo desarrollo
npm run start:dev
```

## 🔐 2. Flujo de Autenticación

### 2.1 Registro de Usuario Administrador

```bash
# Endpoint: POST /api/v1/auth/register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "Sistema",
    "email": "admin@crm.com",
    "password": "Admin123!",
    "role": "SUPER_ADMIN"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "uuid-admin",
  "email": "admin@crm.com",
  "firstName": "Admin",
  "lastName": "Sistema",
  "role": "SUPER_ADMIN",
  "accessToken": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

### 2.2 Login y Obtención de Token

```bash
# Endpoint: POST /api/v1/auth/login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crm.com",
    "password": "Admin123!"
  }')

# Extraer token JWT
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

echo "Token JWT obtenido: $TOKEN"
```

### 2.3 Verificación de Perfil

```bash
# Endpoint: GET /api/v1/auth/profile
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 2.4 Refresh Token

```bash
# Endpoint: POST /api/v1/auth/refresh
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }')

NEW_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
echo "Nuevo token: $NEW_TOKEN"
```

## 👥 3. Gestión de Usuarios

### 3.1 Crear Usuario Vendedor

```bash
# Endpoint: POST /api/v1/users
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@crm.com",
    "password": "Password123!",
    "role": "SALES_REP",
    "phone": "+51 999 888 777"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "Usuario creado con ID: $USER_ID"
```

### 3.2 Listar Todos los Usuarios

```bash
# Endpoint: GET /api/v1/users
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 Buscar Usuario por Email

```bash
# Endpoint: GET /api/v1/users/email/{email}
curl -X GET http://localhost:3001/api/v1/users/email/juan.perez@crm.com \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 Actualizar Perfil de Usuario

```bash
# Endpoint: PUT /api/v1/users/{userId}/profile
curl -X PUT http://localhost:3001/api/v1/users/$USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan Carlos",
    "phone": "+51 999 777 666"
  }'
```

### 3.5 Cambiar Contraseña

```bash
# Endpoint: PUT /api/v1/users/{userId}/password
curl -X PUT http://localhost:3001/api/v1/users/$USER_ID/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

## 🏢 4. Gestión de Empresas

### 4.1 Crear Empresa Cliente

```bash
# Endpoint: POST /api/v1/companies
COMPANY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Tech Solutions S.A.C.",
    "legalName": "Tech Solutions Sociedad Anónima Cerrada",
    "taxId": "20123456789",
    "email": "contact@techsolutions.com",
    "phone": "+51 999 888 777",
    "address": "Av. Larco 123, Miraflores",
    "city": "Lima",
    "country": "Perú",
    "paymentTerms": 30,
    "currency": "PEN"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.id')
echo "Empresa creada con ID: $COMPANY_ID"
```

### 4.2 Listar Empresas

```bash
# Endpoint: GET /api/v1/companies
curl -X GET http://localhost:3001/api/v1/companies \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 Buscar Empresas

```bash
# Endpoint: GET /api/v1/companies/search?q=Tech
curl -X GET "http://localhost:3001/api/v1/companies/search?q=Tech" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.4 Actualizar Empresa

```bash
# Endpoint: PUT /api/v1/companies/{companyId}
curl -X PUT http://localhost:3001/api/v1/companies/$COMPANY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone": "+51 999 777 666",
    "paymentTerms": 15
  }'
```

## 👤 5. Gestión de Contactos

### 5.1 Crear Contacto

```bash
# Endpoint: POST /api/v1/contacts
CONTACT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "María",
    "lastName": "González",
    "email": "maria.gonzalez@techsolutions.com",
    "phone": "+51 999 777 666",
    "position": "Gerente de IT",
    "companyId": "'$COMPANY_ID'"
  }')

CONTACT_ID=$(echo $CONTACT_RESPONSE | jq -r '.id')
echo "Contacto creado con ID: $CONTACT_ID"
```

### 5.2 Listar Contactos por Empresa

```bash
# Endpoint: GET /api/v1/contacts/company/{companyId}
curl -X GET http://localhost:3001/api/v1/contacts/company/$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 Actualizar Contacto

```bash
# Endpoint: PUT /api/v1/contacts/{contactId}
curl -X PUT http://localhost:3001/api/v1/contacts/$CONTACT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "position": "Directora de Tecnología",
    "phone": "+51 999 666 555"
  }'
```

## 📝 6. Gestión de Cotizaciones

### 6.1 Crear Cotización

```bash
# Endpoint: POST /api/v1/quotes
QUOTE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Desarrollo de Sistema CRM Empresarial",
    "description": "Implementación completa de CRM personalizado para gestión de ventas",
    "clientId": "'$COMPANY_ID'",
    "assignedToId": "'$USER_ID'",
    "validUntil": "2024-02-01T00:00:00.000Z",
    "priority": "HIGH",
    "items": [
      {
        "description": "Análisis y diseño del sistema",
        "quantity": 40,
        "unitPrice": 150,
        "taxRate": 0.18,
        "discount": 0
      },
      {
        "description": "Desarrollo backend",
        "quantity": 80,
        "unitPrice": 180,
        "taxRate": 0.18,
        "discount": 0
      },
      {
        "description": "Desarrollo frontend",
        "quantity": 60,
        "unitPrice": 160,
        "taxRate": 0.18,
        "discount": 0
      }
    ]
  }')

QUOTE_ID=$(echo $QUOTE_RESPONSE | jq -r '.id')
echo "Cotización creada con ID: $QUOTE_ID"
```

### 6.2 Enviar Cotización por Email

```bash
# Endpoint: POST /api/v1/quotes/{quoteId}/send
curl -X POST http://localhost:3001/api/v1/quotes/$QUOTE_ID/send \
  -H "Authorization: Bearer $TOKEN"
```

### 6.3 Aceptar Cotización

```bash
# Endpoint: PATCH /api/v1/quotes/{quoteId}/status
curl -X PATCH http://localhost:3001/api/v1/quotes/$QUOTE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "ACCEPTED"
  }'
```

### 6.4 Generar PDF de Cotización

```bash
# Endpoint: GET /api/v1/quotes/{quoteId}/pdf
curl -X GET http://localhost:3001/api/v1/quotes/$QUOTE_ID/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output cotizacion_$QUOTE_ID.pdf

echo "PDF generado: cotizacion_$QUOTE_ID.pdf"
```

## 💰 7. Gestión de Facturas

### 7.1 Crear Factura desde Cotización Aprobada

```bash
# Endpoint: POST /api/v1/invoices/from-quote
INVOICE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/invoices/from-quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "quoteId": "'$QUOTE_ID'",
    "createdById": "'$USER_ID'",
    "dueDate": "2024-03-01T00:00:00.000Z"
  }')

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.id')
INVOICE_NUMBER=$(echo $INVOICE_RESPONSE | jq -r '.invoiceNumber')
echo "Factura creada: $INVOICE_NUMBER (ID: $INVOICE_ID)"
```

### 7.2 Enviar Factura

```bash
# Endpoint: POST /api/v1/invoices/{invoiceId}/send
curl -X POST http://localhost:3001/api/v1/invoices/$INVOICE_ID/send \
  -H "Authorization: Bearer $TOKEN"
```

### 7.3 Agregar Pago a Factura

```bash
# Endpoint: POST /api/v1/invoices/{invoiceId}/payments
curl -X POST http://localhost:3001/api/v1/invoices/$INVOICE_ID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TXN_001_'$RANDOM'",
    "notes": "Pago parcial por transferencia bancaria"
  }'
```

### 7.4 Verificar Estado de Pagos

```bash
# Endpoint: GET /api/v1/invoices/{invoiceId}/payments
curl -X GET http://localhost:3001/api/v1/invoices/$INVOICE_ID/payments \
  -H "Authorization: Bearer $TOKEN"
```

## 💳 8. Procesamiento de Pagos

### 8.1 Crear Intención de Pago (Stripe)

```bash
# Endpoint: POST /api/v1/stripe/create-payment-intent
STRIPE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 10000,
    "currency": "usd",
    "invoiceId": "'$INVOICE_ID'"
  }')

CLIENT_SECRET=$(echo $STRIPE_RESPONSE | jq -r '.clientSecret')
echo "Client Secret para Stripe: $CLIENT_SECRET"
```

### 8.2 Confirmar Pago (Stripe)

```bash
# Endpoint: POST /api/v1/stripe/confirm-payment
curl -X POST http://localhost:3001/api/v1/stripe/confirm-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentIntentId": "pi_test_...",
    "invoiceId": "'$INVOICE_ID'"
  }'
```

### 8.3 Crear Pago con PayPal

```bash
# Endpoint: POST /api/v1/paypal/create-payment
PAYPAL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/paypal/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Pago de factura '$INVOICE_NUMBER'",
    "invoiceId": "'$INVOICE_ID'"
  }')

PAYPAL_URL=$(echo $PAYPAL_RESPONSE | jq -r '.approvalUrl')
echo "URL de aprobación PayPal: $PAYPAL_URL"
```

## 📊 9. Reportes y Analytics

### 9.1 Generar Reporte Financiero

```bash
# Endpoint: POST /api/v1/reports/financial
curl -X POST http://localhost:3001/api/v1/reports/financial \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### 9.2 Generar Reporte de Ingresos

```bash
# Endpoint: POST /api/v1/reports/revenue
curl -X POST http://localhost:3001/api/v1/reports/revenue \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "groupBy": "month"
  }'
```

### 9.3 Obtener Estadísticas del Dashboard

```bash
# Endpoint: GET /api/v1/reports/dashboard
curl -X GET http://localhost:3001/api/v1/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 9.4 Reporte de Usuarios

```bash
# Endpoint: GET /api/v1/reports/users
curl -X GET http://localhost:3001/api/v1/reports/users \
  -H "Authorization: Bearer $TOKEN"
```

## 📱 10. Pagos Móviles con QR

### 10.1 Generar Código QR para Pago

```bash
# Endpoint: GET /api/v1/qr/payment/{invoiceId}
curl -X GET http://localhost:3001/api/v1/qr/payment/$INVOICE_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "paymentUrl": "https://payment.crm.com/pay/...",
  "invoiceId": "uuid-invoice",
  "amount": 10000,
  "currency": "PEN"
}
```

## 🧪 11. Testing Automatizado

### 11.1 Ejecutar Todos los Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Tests de Playwright
npm run test:e2e:playwright
```

### 11.2 Tests Específicos por Módulo

```bash
# Tests de autenticación
npm run test -- --testPathPattern=auth

# Tests de usuarios
npm run test -- --testPathPattern=users

# Tests de facturas
npm run test -- --testPathPattern=invoices
```

### 11.3 Health Checks

```bash
# Health check general
curl -X GET http://localhost:3001/health

# Health check de base de datos
curl -X GET http://localhost:3001/api/v1/health/database

# Health check de memoria
curl -X GET http://localhost:3001/api/v1/health/memory
```

## 🔧 12. Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error de Conexión a Base de Datos

```bash
# Verificar servicios Docker
docker-compose ps

# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar logs
docker-compose logs postgres
```

#### 2. Token JWT Expirado

```bash
# Refrescar token
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

#### 3. Error 429 (Rate Limiting)

```bash
# Esperar el tiempo de cooldown (60 segundos por defecto)
sleep 60

# Reintentar la petición
```

#### 4. Error de Validación

```bash
# Verificar formato de datos enviados
# Ejemplo: Email debe tener formato válido
# Fechas deben estar en ISO 8601
# IDs deben ser UUIDs válidos
```

#### 5. Problemas con Docker

```bash
# Limpiar contenedores
docker-compose down -v --remove-orphans

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar completo
docker-compose up -d --force-recreate
```

### Logs de Debugging

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de base de datos
docker-compose logs -f postgres

# Ver logs de Redis
docker-compose logs -f redis
```

## 📋 Checklist de Testing Completo

### Pre-Testing
- [ ] Servicios Docker ejecutándose
- [ ] Base de datos migrada y poblada
- [ ] Variables de entorno configuradas
- [ ] Backend ejecutándose en puerto 3001

### Testing por Módulo
- [ ] ✅ Autenticación (register/login/refresh/profile)
- [ ] ✅ Gestión de Usuarios (CRUD + perfil + contraseña)
- [ ] ✅ Gestión de Empresas (CRUD + búsqueda)
- [ ] ✅ Gestión de Contactos (CRUD + por empresa)
- [ ] ✅ Gestión de Cotizaciones (CRUD + envío + PDF + aceptación)
- [ ] ✅ Gestión de Facturas (crear desde cotización + envío + PDF)
- [ ] ✅ Procesamiento de Pagos (Stripe + PayPal + pagos manuales)
- [ ] ✅ Reportes (financieros + ingresos + dashboard)
- [ ] ✅ Pagos QR (generación + validación)
- [ ] ✅ Health Checks (servicios + base de datos)

### Post-Testing
- [ ] Tests unitarios pasan (cobertura > 80%)
- [ ] Tests e2e pasan
- [ ] Documentación Swagger accesible
- [ ] Logs sin errores críticos
- [ ] Rendimiento aceptable (< 200ms respuestas)

## 🚀 Scripts de Automatización

### Script de Setup Completo

```bash
#!/bin/bash
# setup-testing.sh

echo "🚀 Iniciando setup completo de testing..."

# Instalar dependencias
npm install

# Iniciar infraestructura
docker-compose up -d postgres redis minio
sleep 15

# Configurar base de datos
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Ejecutar tests
npm run test
npm run test:e2e

echo "✅ Setup completado exitosamente"
```

### Script de Testing de Flujo Completo

```bash
#!/bin/bash
# test-full-flow.sh

echo "🧪 Ejecutando flujo completo de testing..."

# Obtener token admin
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin123!"}' | jq -r '.accessToken')

echo "Token obtenido: ${TOKEN:0:20}..."

# Crear empresa
COMPANY_ID=$(curl -s -X POST http://localhost:3001/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Company","email":"test@company.com"}' | jq -r '.id')

echo "Empresa creada: $COMPANY_ID"

# Crear cotización
QUOTE_ID=$(curl -s -X POST http://localhost:3001/api/v1/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Test Quote",
    "clientId":"'$COMPANY_ID'",
    "items":[{"description":"Service","quantity":1,"unitPrice":100,"taxRate":0.18}]
  }' | jq -r '.id')

echo "Cotización creada: $QUOTE_ID"

# Aceptar cotización
curl -X PATCH http://localhost:3001/api/v1/quotes/$QUOTE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"ACCEPTED"}'

# Crear factura
INVOICE_ID=$(curl -s -X POST http://localhost:3001/api/v1/invoices/from-quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"quoteId":"'$QUOTE_ID'"}' | jq -r '.id')

echo "Factura creada: $INVOICE_ID"

# Agregar pago
curl -X POST http://localhost:3001/api/v1/invoices/$INVOICE_ID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":100,"paymentMethod":"bank_transfer","transactionId":"TEST001"}'

echo "✅ Flujo completo ejecutado exitosamente"
```

---

**Nota**: Esta guía proporciona cobertura completa para testing del sistema. Para entornos de producción, asegúrese de configurar variables de entorno seguras y no usar datos de prueba reales.