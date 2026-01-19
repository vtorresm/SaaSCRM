# Instalación de Mejoras del Proyecto

## Descripción

Este documento describe cómo instalar y configurar las nuevas funcionalidades implementadas:
- Health Checks con @nestjs/terminus
- Logging estructurado con Winston
- Tests E2E con Playwright

## Instalación de Dependencias

### 1. Instalar dependencias principales

```bash
cd backend

# Instalar todas las nuevas dependencias
npm install @nestjs/terminus winston winston-daily-rotate-file @playwright/test

# O con pnpm
pnpm add @nestjs/terminus winston winston-daily-rotate-file @playwright/test
```

### 2. Instalar navegadores de Playwright

```bash
# Instalar navegadores para testing
npx playwright install

# Instalar con dependencias del sistema (recomendado para CI)
npx playwright install --with-deps
```

## Verificación de Instalación

### 1. Verificar dependencias instaladas

```bash
npm list @nestjs/terminus winston @playwright/test
```

### 2. Verificar navegadores de Playwright

```bash
npx playwright --version
npx playwright install-deps
```

## Configuración del Entorno

### 1. Variables de entorno adicionales

Agregar a tu archivo `.env`:

```env
# Logging
LOG_LEVEL=info

# Playwright E2E Tests
BASE_URL=http://localhost:3001
```

### 2. Crear directorio de logs

```bash
mkdir -p backend/logs
```

## Ejecutar y Probar

### 1. Health Checks

```bash
# Iniciar el servidor
npm run start:dev

# Probar health checks
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/database
curl http://localhost:3001/api/v1/health/memory
curl http://localhost:3001/api/v1/health/disk
```

### 2. Winston Logging

```bash
# Iniciar el servidor y verificar logs
npm run start:dev

# Los logs aparecerán en:
# - Consola (desarrollo)
# - backend/logs/application-YYYY-MM-DD.log
# - backend/logs/error-YYYY-MM-DD.log
# - backend/logs/warn-YYYY-MM-DD.log
```

### 3. Tests E2E con Playwright

```bash
# Ejecutar tests E2E
npm run test:e2e:playwright

# Ejecutar con UI visual
npm run test:e2e:playwright:ui

# Ejecutar en modo debug
npm run test:e2e:playwright:debug

# Ver reportes
# Abre automáticamente: playwright-report/index.html
```

## Scripts Disponibles

### Nuevos scripts en package.json

```json
{
  "scripts": {
    "test:e2e:playwright": "playwright test",
    "test:e2e:playwright:ui": "playwright test --ui",
    "test:e2e:playwright:debug": "playwright test --debug",
    "test:e2e:playwright:install": "playwright install"
  }
}
```

## Estructura de Archivos Creados

```
backend/
├── src/
│   ├── modules/
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   └── config/
│       ├── winston.config.ts
│       └── winston.logger.ts
├── e2e/
│   ├── auth.spec.ts
│   └── health.spec.ts
├── playwright.config.ts
├── HEALTH_CHECKS_README.md
├── WINSTON_LOGGING_README.md
├── PLAYWRIGHT_E2E_README.md
└── INSTALL_IMPROVEMENTS.md
```

## Troubleshooting

### Problemas Comunes

#### 1. Error: "Cannot find module '@nestjs/terminus'"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 2. Error: "Cannot find module 'winston'"

```bash
# Instalar winston específicamente
npm install winston winston-daily-rotate-file
```

#### 3. Error: "Cannot find module '@playwright/test'"

```bash
# Instalar playwright
npm install @playwright/test
npx playwright install
```

#### 4. Error de TypeScript en archivos nuevos

```bash
# Verificar configuración de TypeScript
npx tsc --noEmit

# Si hay errores, verificar tsconfig.json
cat tsconfig.json
```

#### 5. Playwright no encuentra navegadores

```bash
# Reinstalar navegadores
npx playwright install --force

# O instalar manualmente
npx playwright install chromium firefox webkit
```

#### 6. Tests E2E fallan por conexión

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/api/v1/health

# Verificar BASE_URL en playwright.config.ts
cat playwright.config.ts | grep baseURL
```

#### 7. Logs no se generan

```bash
# Verificar permisos del directorio logs
ls -la logs/

# Crear directorio si no existe
mkdir -p logs

# Verificar configuración de Winston
cat src/config/winston.config.ts
```

## Verificación Completa

### Script de verificación

```bash
#!/bin/bash

echo "🔍 Verificando instalación de mejoras..."

# Verificar dependencias
echo "📦 Verificando dependencias..."
npm list @nestjs/terminus winston @playwright/test || exit 1

# Verificar navegadores
echo "🌐 Verificando navegadores de Playwright..."
npx playwright --version || exit 1

# Verificar directorios
echo "📁 Verificando directorios..."
test -d logs && echo "✅ Directorio logs existe" || echo "❌ Directorio logs no existe"
test -d e2e && echo "✅ Directorio e2e existe" || echo "❌ Directorio e2e no existe"

# Verificar archivos
echo "📄 Verificando archivos..."
test -f src/modules/health/health.controller.ts && echo "✅ Health controller existe" || echo "❌ Health controller no existe"
test -f src/config/winston.logger.ts && echo "✅ Winston logger existe" || echo "❌ Winston logger no existe"
test -f playwright.config.ts && echo "✅ Playwright config existe" || echo "❌ Playwright config no existe"

# Verificar compilación
echo "🔨 Verificando compilación TypeScript..."
npx tsc --noEmit --skipLibCheck && echo "✅ TypeScript compila correctamente" || echo "❌ Errores de TypeScript"

echo "🎉 Verificación completada!"
```

## Próximos Pasos

1. **Configurar CI/CD** para ejecutar tests E2E automáticamente
2. **Configurar monitoreo** con los health checks
3. **Configurar ELK stack** para análisis de logs
4. **Crear más tests E2E** para cubrir todos los endpoints
5. **Configurar alertas** basadas en health checks

## Documentación Adicional

- [Health Checks README](./HEALTH_CHECKS_README.md)
- [Winston Logging README](./WINSTON_LOGGING_README.md)
- [Playwright E2E README](./PLAYWRIGHT_E2E_README.md)
- [Guía de Testing Completa](../docs/backend_complete_testing_guide.md)

## Soporte

Si encuentras problemas durante la instalación:

1. Verifica los logs de instalación
2. Revisa la documentación específica de cada componente
3. Verifica las versiones de Node.js y npm
4. Asegúrate de tener permisos adecuados en el sistema

---

**Nota**: Estas mejoras elevan significativamente la calidad y mantenibilidad del proyecto, agregando capacidades profesionales de monitoreo, logging y testing.