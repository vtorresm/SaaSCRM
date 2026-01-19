# Playwright E2E Tests Implementation

## Descripción

Se ha implementado un sistema completo de pruebas end-to-end usando **Playwright** para testing de APIs REST.

## Características

- ✅ **Testing multi-navegador** (Chrome, Firefox, Safari, Edge)
- ✅ **Testing móvil** (iOS, Android)
- ✅ **API Testing** con requests HTTP
- ✅ **Configuración paralela** para ejecución rápida
- ✅ **Reportes HTML** detallados
- ✅ **CI/CD ready** con configuración optimizada
- ✅ **Auto-setup** del servidor de desarrollo

## Estructura de Tests

```
e2e/
├── auth.spec.ts      # Tests de autenticación
├── users.spec.ts     # Tests de gestión de usuarios
├── companies.spec.ts # Tests de empresas
├── contacts.spec.ts  # Tests de contactos
├── quotes.spec.ts    # Tests de cotizaciones
├── invoices.spec.ts  # Tests de facturas
├── reports.spec.ts   # Tests de reportes y dashboard
├── qr.spec.ts        # Tests de pagos QR
└── health.spec.ts    # Tests de health checks
```

## Cobertura de Tests por Módulo

### 🔐 **auth.spec.ts** - Autenticación
- ✅ Registro de usuario
- ✅ Login exitoso
- ✅ Rechazo de credenciales inválidas

### 👥 **users.spec.ts** - Gestión de Usuarios
- ✅ Crear usuario
- ✅ Listar usuarios
- ✅ Obtener usuario por ID
- ✅ Actualizar perfil
- ✅ Cambiar contraseña
- ✅ Buscar por email
- ✅ Búsqueda general
- ✅ Estadísticas de usuarios
- ✅ Eliminación suave
- ✅ Validación de acceso no autorizado

### 🏢 **companies.spec.ts** - Gestión de Empresas
- ✅ Crear empresa
- ✅ Listar empresas
- ✅ Obtener empresa por ID
- ✅ Actualizar empresa
- ✅ Filtrar por estado
- ✅ Búsqueda de empresas
- ✅ Eliminación suave
- ✅ Validación de campos requeridos
- ✅ Validación de acceso no autorizado

### 👤 **contacts.spec.ts** - Gestión de Contactos
- ✅ Crear contacto
- ✅ Listar contactos
- ✅ Obtener contacto por ID
- ✅ Actualizar contacto
- ✅ Obtener contactos por empresa
- ✅ Filtrar por estado
- ✅ Búsqueda de contactos
- ✅ Eliminación suave
- ✅ Validación de empresa requerida
- ✅ Validación de acceso no autorizado

### 📝 **quotes.spec.ts** - Gestión de Cotizaciones
- ✅ Crear cotización
- ✅ Listar cotizaciones
- ✅ Obtener cotización por ID
- ✅ Actualizar cotización
- ✅ Enviar cotización
- ✅ Aceptar cotización
- ✅ Obtener cotizaciones por cliente
- ✅ Filtrar por estado
- ✅ Búsqueda de cotizaciones
- ✅ Eliminación suave
- ✅ Validación de cliente requerido
- ✅ Validación de acceso no autorizado

### 💰 **invoices.spec.ts** - Gestión de Facturas
- ✅ Crear factura desde cotización
- ✅ Crear factura manual
- ✅ Listar facturas
- ✅ Obtener factura por ID
- ✅ Actualizar factura
- ✅ Enviar factura
- ✅ Agregar pago
- ✅ Obtener pagos de factura
- ✅ Obtener facturas por cliente
- ✅ Filtrar por estado
- ✅ Obtener facturas vencidas
- ✅ Búsqueda de facturas
- ✅ Estadísticas de facturas
- ✅ Eliminación suave
- ✅ Validación de campos requeridos
- ✅ Validación de acceso no autorizado

### 📊 **reports.spec.ts** - Reportes y Dashboard
- ✅ Generar reporte financiero
- ✅ Generar reporte de ingresos
- ✅ Generar reporte fiscal
- ✅ Obtener datos del dashboard
- ✅ Reporte de actividad de usuario
- ✅ Validación de acceso no autorizado
- ✅ Validación de rango de fechas

### 📱 **qr.spec.ts** - Pagos QR
- ✅ Generar código QR para pago
- ✅ Rechazo para factura inexistente
- ✅ Validación de acceso no autorizado
- ✅ Validación de estructura de datos QR

### 🏥 **health.spec.ts** - Health Checks
- ✅ Health check completo
- ✅ Health check de base de datos
- ✅ Health check de memoria
- ✅ Health check de disco

## Configuración

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run start:dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Ejemplos de Tests

### Test de Autenticación

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  test('should register a new user', async ({ request }) => {
    const response = await request.post('/api/v1/auth/register', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!',
        role: 'SALES_REP'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: { email: 'user@example.com', password: 'Password123!' }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
  });
});
```

### Test de Health Checks

```typescript
test.describe('Health Checks API', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/v1/health');

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.status).toBe('ok');
    expect(body.info).toHaveProperty('database');
    expect(body.info).toHaveProperty('memory_heap');
  });
});
```

### Test con Autenticación

```typescript
test.describe('Protected API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // Login y obtener token
    const response = await request.post('/api/v1/auth/login', {
      data: { email: 'admin@example.com', password: 'Admin123!' }
    });
    const body = await response.json();
    token = body.access_token;
  });

  test('should access protected resource', async ({ request }) => {
    const response = await request.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
  });
});
```

## Ejecución de Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests E2E
npm run test:e2e:playwright

# Ejecutar con UI visual
npm run test:e2e:playwright:ui

# Ejecutar en modo debug
npm run test:e2e:playwright:debug

# Ejecutar solo un archivo
npx playwright test auth.spec.ts

# Ejecutar solo un test específico
npx playwright test --grep "should register a new user"

# Ejecutar en navegador específico
npx playwright test --project=chromium

# Ejecutar tests móviles
npx playwright test --project="Mobile Chrome"
```

### Variables de Entorno

```env
BASE_URL=http://localhost:3001  # URL base de la API
CI=true                         # Modo CI (desactiva UI, configura retries)
```

## Reportes

### Reporte HTML
```bash
npm run test:e2e:playwright
# Abre automáticamente: playwright-report/index.html
```

### Reporte JSON
```json
{
  "config": { ... },
  "suites": [
    {
      "title": "Authentication API",
      "tests": [
        {
          "title": "should register a new user",
          "status": "passed",
          "duration": 1250,
          "error": null
        }
      ]
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e:playwright
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Docker para CI

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx playwright install

CMD ["npm", "run", "test:e2e:playwright"]
```

## Debugging

### Modo Interactivo
```bash
# Abrir Playwright UI
npm run test:e2e:playwright:ui

# Debug específico
npx playwright test --debug auth.spec.ts
```

### Screenshots y Videos
```typescript
test('should handle error', async ({ page }) => {
  await page.screenshot({ path: 'error.png' });
  // Test code...
});
```

### Trace Viewer
```bash
# Ver traces de ejecución
npx playwright show-trace test-results/trace.zip
```

## Mejores Prácticas

### Estructura de Tests
- ✅ **Describe blocks** para agrupar tests relacionados
- ✅ **beforeAll/beforeEach** para setup común
- ✅ **afterAll/afterEach** para cleanup
- ✅ **test.skip/test.only** para control de ejecución

### Assertions
- ✅ **expect().toBe()** para valores exactos
- ✅ **expect().toHaveProperty()** para objetos
- ✅ **expect().toBeGreaterThan()** para números
- ✅ **expect().toMatch()** para strings/regexp

### Fixtures y Helpers
```typescript
// helpers/auth.ts
export async function loginAsAdmin(request: APIRequestContext) {
  const response = await request.post('/api/v1/auth/login', {
    data: { email: 'admin@example.com', password: 'Admin123!' }
  });
  return (await response.json()).access_token;
}

// En test
test('should access admin resource', async ({ request }) => {
  const token = await loginAsAdmin(request);
  // Use token...
});
```

## Instalación

```bash
# Instalar Playwright
npm install @playwright/test

# Instalar navegadores
npx playwright install

# Instalar con dependencias del sistema
npx playwright install --with-deps
```

## Troubleshooting

### Problemas Comunes

1. **Navegadores no encontrados**
   ```bash
   npx playwright install chromium
   ```

2. **Servidor no inicia**
   ```typescript
   webServer: {
     command: 'npm run start:dev',
     url: 'http://localhost:3001',
     timeout: 120 * 1000, // Aumentar timeout
   }
   ```

3. **Tests lentos**
   - Usar `fullyParallel: true`
   - Configurar `workers` apropiado
   - Evitar `page.waitForTimeout()`

4. **Flaky tests**
   - Usar `page.waitForLoadState('networkidle')`
   - Implementar retries
   - Usar `expect().toBeVisible()` en lugar de timeouts

## Métricas y Cobertura

### Cobertura de Tests
```bash
# Generar reporte de cobertura
npx nyc report --reporter=html
```

### Métricas de Rendimiento
- **Tiempo promedio de respuesta**
- **Tasa de éxito de tests**
- **Cobertura de endpoints**
- **Tiempo de ejecución total**

## Conclusión

Playwright proporciona una solución robusta para testing E2E con:
- ✅ Soporte multi-navegador y multi-dispositivo
- ✅ API testing poderosa
- ✅ Reportes detallados
- ✅ Integración CI/CD
- ✅ Comunidad activa y soporte excelente