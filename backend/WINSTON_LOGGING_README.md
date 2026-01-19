# Winston Logging Implementation

## Descripción

Se ha implementado un sistema de logging estructurado usando **Winston** para reemplazar el logger por defecto de NestJS.

## Características

- ✅ **Logging estructurado en JSON**
- ✅ **Rotación automática de archivos**
- ✅ **Múltiples transportes** (consola, archivos)
- ✅ **Niveles de log configurables**
- ✅ **Separación por tipo** (errores, warnings, generales)
- ✅ **Métodos especializados** para diferentes tipos de eventos

## Configuración

### Variables de Entorno

```env
LOG_LEVEL=info  # debug, info, warn, error
```

### Archivos de Log

Los logs se guardan en el directorio `logs/`:

```
logs/
├── application-2024-01-15.log  # Logs generales
├── error-2024-01-15.log        # Solo errores
└── warn-2024-01-15.log         # Solo warnings
```

## Uso

### Logger Automático

El logger se configura automáticamente en `main.ts`:

```typescript
import { WinstonLogger } from './config/winston.logger';

app = await NestFactory.create(AppModule, {
  logger: new WinstonLogger(),
});
```

### Logging en Servicios

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Mensaje informativo');
    this.logger.error('Error ocurrido', error.stack);
    this.logger.warn('Advertencia');
    this.logger.debug('Información de debug');
  }
}
```

### Logging Estructurado Avanzado

```typescript
import { WinstonLogger } from '../config/winston.logger';

@Injectable()
export class AuthService {
  constructor(private logger: WinstonLogger) {}

  async login(userId: string, success: boolean) {
    this.logger.logAuth('login_attempt', userId, success, '192.168.1.1');
  }

  async databaseOperation(operation: string, error?: any) {
    if (error) {
      this.logger.logDatabaseError(operation, error, 'users');
    } else {
      this.logger.logWithMeta('info', `Database ${operation} successful`, {
        operation,
        collection: 'users',
        duration: 150
      });
    }
  }
}
```

## Métodos Especializados

### logAuth(action, userId?, success?, ip?)
Para eventos de autenticación.

### logDatabaseError(operation, error, collection?)
Para errores de base de datos.

### logRequest(method, url, statusCode, responseTime, userId?)
Para logging de requests HTTP.

### logWithMeta(level, message, meta, context?)
Para logging con metadatos personalizados.

## Formato de Logs

### Consola (Desarrollo)
```
2024-01-15 14:30:25 [AuthService] info: User login successful
```

### Archivo (JSON Estructurado)
```json
{
  "timestamp": "2024-01-15 14:30:25",
  "level": "INFO",
  "message": "User login successful",
  "context": "AuthService",
  "userId": "user123",
  "ip": "192.168.1.1",
  "success": true
}
```

## Configuración de Winston

### Transporte de Consola
- Nivel: `info` (configurable)
- Formato: legible para humanos

### Transporte de Archivos
- Rotación diaria
- Máximo 20MB por archivo
- Retención de 14 días para generales
- Retención de 30 días para errores
- Retención de 7 días para warnings

## Instalación

```bash
npm install winston winston-daily-rotate-file
```

## Monitoreo y Análisis

### Búsqueda en Logs
```bash
# Buscar errores
grep '"level":"ERROR"' logs/application-*.log

# Buscar por usuario
grep '"userId":"user123"' logs/application-*.log

# Buscar requests lentos
grep '"responseTime":[0-9]\{4,\}' logs/application-*.log
```

### Integración con ELK Stack
Los logs en formato JSON son compatibles con:
- **Elasticsearch** para indexación
- **Logstash** para procesamiento
- **Kibana** para visualización

### Configuración ELK
```json
{
  "index_patterns": ["logs-*"],
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "context": { "type": "keyword" },
      "userId": { "type": "keyword" },
      "responseTime": { "type": "integer" }
    }
  }
}
```

## Testing

```bash
# Tests unitarios
npm run test

# Verificar logs generados
ls -la logs/
tail logs/application-$(date +%Y-%m-%d).log