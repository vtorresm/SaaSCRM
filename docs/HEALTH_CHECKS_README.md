# Health Checks Implementation

## Descripción

Se ha implementado un sistema completo de health checks para monitoreo de infraestructura usando **@nestjs/terminus**.

## Endpoints Disponibles

### Health Check Completo
```
GET /api/v1/health
```
Verifica todos los componentes del sistema:
- Base de datos (Prisma)
- Memoria (Heap y RSS)
- Disco (Espacio disponible)

### Health Checks Específicos
```
GET /api/v1/health/database  # Solo base de datos
GET /api/v1/health/memory    # Solo memoria
GET /api/v1/health/disk      # Solo disco
```

## Respuesta de Ejemplo

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "used": 45000000,
      "available": 100000000
    },
    "memory_rss": {
      "status": "up",
      "used": 78000000,
      "available": 100000000
    },
    "storage": {
      "status": "up",
      "available": 50000000000,
      "used": 20000000000
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

## Configuración

Los umbrales se pueden configurar modificando los valores en `health.controller.ts`:

```typescript
// Memoria (150MB límite)
() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)

// Disco (90% uso máximo)
() =>
  this.disk.checkStorage('storage', {
    path: '/',
    thresholdPercent: 0.9,
  })
```

## Uso con Monitoreo

### Prometheus + Grafana
Los health checks son compatibles con sistemas de monitoreo como Prometheus.

### Kubernetes
Los endpoints pueden ser usados como liveness y readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/v1/health/database
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Instalación

```bash
npm install @nestjs/terminus
```

## Testing

```bash
# Tests unitarios
npm run test

# Tests E2E con Playwright
npm run test:e2e:playwright