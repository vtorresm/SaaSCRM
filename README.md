# <SaaS CRM> - Sistema de Gestión de Ventas

## 🚀 Descripción

SaaS CRM completo para la gestión de ventas de software, desarrollado con tecnologías modernas y arquitectura escalable. Este sistema permite gestionar clientes, cotizaciones, proyectos, facturación y reportes de ventas de manera integral.

## 🛠️ Stack Tecnológico

### Backend
- **TypeScript 5.x** con **Node.js 20/22 LTS**
- **NestJS 10.x** - Framework modular y escalable
- **Prisma 5.x** - ORM type-safe con PostgreSQL 16.x
- **JWT** para autenticación con refresh tokens
- **Passport.js** para OAuth (Google, LinkedIn)
- **Nodemailer** para notificaciones por email
- **Redis** para caché y rate limiting
- **Swagger** para documentación API

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **React 18** con Server Components
- **Tailwind CSS** para estilos
- **TanStack Query** para gestión de estado del servidor
- **Zustand** para gestión de estado del cliente
- **React Hook Form** + **Zod** para formularios y validación

### Base de Datos e Infraestructura
- **PostgreSQL 16.x** como base de datos principal (Docker)
- **Prisma** como ORM
- **Redis** para caché y sesiones (Docker)
- **MinIO** para almacenamiento de archivos (Docker)
- **pgAdmin** para administración de BD (Docker, opcional)
- **MailHog** para testing de emails (Docker, opcional)

## 🏗️ Arquitectura

### Backend (NestJS)
```
backend/src/
├── main.ts                 # Entry point
├── app.module.ts          # Root module
├── config/                # Configuration files
│   ├── prisma.module.ts   # Prisma module
│   └── prisma.service.ts  # Prisma service
├── modules/              # Feature modules
│   ├── auth/             # Authentication & Authorization
│   ├── users/            # User management
│   ├── companies/        # Company management
│   ├── contacts/         # Contact management
│   ├── quotes/           # Quote system
│   ├── projects/         # Project management
│   ├── invoices/         # Invoice system
│   ├── dashboard/        # Dashboard & metrics
│   ├── teams/            # Team management
│   └── audit/            # Audit & compliance
```

## 📋 Roadmap de Desarrollo

### ✅ Sprint 1 (Semana 1): Authentication & Authorization - COMPLETADO
- [x] Setup del entorno de desarrollo
- [x] JWT implementation con refresh tokens
- [x] RBAC system básico
- [x] Social login (Google, LinkedIn) - básico
- [x] Rate limiting y account lockout
- [x] **Docker setup completo (PostgreSQL, Redis, MinIO)**

### 🔄 Sprint 2 (Semana 2): Core CRM
- [ ] Database schema implementation
- [ ] Company and contact CRUD operations
- [ ] Basic dashboard with metrics
- [ ] API endpoints for CRM functionality

### 📋 Sprint 3 (Semana 3): MVP Quote System
- [ ] Basic quote creation form
- [ ] Simple PDF generation
- [ ] Email template system
- [ ] Quote management interface

### 👥 Sprint 4 (Semana 4): User Management
- [ ] User profiles and settings
- [ ] Team and role management
- [ ] Basic reporting system
- [ ] Admin interface

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Docker Desktop** (强烈推荐) o Docker Engine + Docker Compose
- Node.js 18+ 
- npm, yarn o pnpm

### ⚡ Setup Rápido con Docker

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sales-crm-saas
```

2. **Ejecutar el script de setup automático**
```bash
# En Linux/macOS
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# En Windows (usar Git Bash o WSL)
bash scripts/setup-dev.sh
```

3. **¡Listo!** Los servicios estarán corriendo en:
   - Backend API: `http://localhost:3001/api/v1`
   - Swagger Docs: `http://localhost:3001/api/v1/docs`
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`
   - MinIO Console: `http://localhost:9001`

### 🛠️ Setup Manual (Sin scripts)

1. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

2. **Iniciar servicios con Docker**
```bash
# Servicios básicos (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# Con herramientas adicionales (pgAdmin, MailHog)
docker-compose --profile tools up -d
```

3. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

4. **Configurar la base de datos**
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
# Desde la raíz del proyecto
npm run dev

# O solo el backend
cd backend && npm run start:dev
```

## 🐳 Servicios Docker

### Servicios Principales
- **PostgreSQL 16**: Base de datos principal
- **Redis 7**: Cache y sesiones
- **MinIO**: Almacenamiento S3-compatible

### Servicios Opcionales (con `--profile tools`)
- **pgAdmin 4**: Administración web de PostgreSQL
- **MailHog**: Testing de emails

### Puertos
| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | `postgresql://postgres:postgres123@localhost:5432` |
| Redis | 6379 | `redis://:redis123@localhost:6379` |
| MinIO API | 9000 | `http://localhost:9000` |
| MinIO Console | 9001 | `http://localhost:9001` |
| pgAdmin | 8080 | `http://localhost:8080` |
| MailHog | 8025 | `http://localhost:8025` |

### Scripts Disponibles

```bash
# Setup completo del entorno
./scripts/setup-dev.sh

# Reset de base de datos
./scripts/reset-db.sh

# Comandos manuales
docker-compose up -d              # Iniciar servicios
docker-compose down               # Detener servicios
docker-compose logs -f [servicio] # Ver logs
docker-compose exec postgres psql -U postgres -d sales_crm_dev # Acceder a BD
```

## 🔐 Configuración de Entorno

### Variables de Entorno (.env)
```env
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/sales_crm_dev"

# JWT
JWT_SECRET="sales-crm-super-secret-jwt-key-2024"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="sales-crm-super-secret-refresh-key-2024"
JWT_REFRESH_EXPIRATION="7d"

# Redis (Docker)
REDIS_URL="redis://:redis123@localhost:6379"

# MinIO (Docker)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin123"

# Email (MailHog en desarrollo)
EMAIL_HOST="localhost"
EMAIL_PORT=1025
```

### Credenciales por Defecto
| Servicio | Usuario | Contraseña |
|----------|---------|------------|
| PostgreSQL | postgres | postgres123 |
| Redis | - | redis123 |
| MinIO | minioadmin | minioadmin123 |
| pgAdmin | admin@salescrm.com | admin123 |

## 🗄️ Esquema de Base de Datos

### Entidades Principales
- **Users**: Gestión de usuarios con roles y permisos
- **Companies**: Empresas/clientes
- **Contacts**: Contactos de empresas
- **Quotes**: Cotizaciones con items y versiones
- **Projects**: Proyectos derivados de cotizaciones aprobadas
- **Invoices**: Facturación con items y pagos
- **Teams**: Equipos de trabajo
- **AuditLog**: Registro de auditoría para compliance

### Características de Seguridad
- Soft deletes con `deletedAt`
- Timestamps automáticos
- Índices optimizados para consultas frecuentes
- Audit trail completo

## 📚 API Documentation

La documentación de la API está disponible en:
- **Swagger UI**: `http://localhost:3001/api/v1/docs`
- **JSON Schema**: `http://localhost:3001/api/v1/docs-json`

### Endpoints Principales

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/google          # Iniciar Google OAuth
GET    /api/v1/auth/google/callback # Google OAuth callback
GET    /api/v1/auth/linkedin        # Iniciar LinkedIn OAuth
GET    /api/v1/auth/linkedin/callback # LinkedIn OAuth callback
```

## 🧪 Testing

```bash
# Tests del backend
cd backend
npm run test
npm run test:e2e

# Tests con base de datos de prueba
TEST_DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/sales_crm_test" npm run test
```

## 📦 Scripts Disponibles

### Proyecto Principal
```bash
npm run dev          # Ejecutar backend y frontend en desarrollo
npm run build        # Construir proyecto completo
npm run test         # Ejecutar todos los tests
npm run lint         # Linting de todo el proyecto
```

### Backend
```bash
npm run start:dev    # Desarrollo con hot reload
npm run start:prod   # Producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar base de datos con datos de prueba
npm run db:reset     # Reset completo de la base de datos
```

### Docker Operations
```bash
# Gestión de servicios
docker-compose up -d postgres redis minio
docker-compose down
docker-compose --profile tools up -d  # Con herramientas adicionales

# Gestión de base de datos
docker-compose exec postgres psql -U postgres -d sales_crm_dev
docker-compose logs postgres

# Limpieza completa
docker-compose down -v --remove-orphans
```

## 🚦 Estado del Proyecto

**Desarrollo en curso** - Sprint 1 (Authentication & Authorization) ✅ **100% COMPLETADO**

### ✅ Sprint 1 - Completado
- Sistema de autenticación JWT completo
- RBAC con 6 roles diferentes
- Social OAuth (Google + LinkedIn)
- Rate limiting y account lockout
- **Docker setup completo**
- **Prisma schema con 20+ entidades**

### 🔄 Próximos Pasos
1. Iniciar Sprint 2 (Core CRM)
2. Desarrollar módulos de Companies y Contacts
3. Crear dashboard básico
4. Implementar frontend
5. Tests automatizados

## 🛠️ Troubleshooting

### Problemas Comunes

**Puerto ya en uso:**
```bash
# Cambiar puertos en docker-compose.yml o matar procesos
docker-compose down
sudo lsof -i :5432  # Para PostgreSQL
sudo kill -9 <PID>
```

**Problemas de permisos (Linux/macOS):**
```bash
chmod +x scripts/*.sh
sudo usermod -a -G docker $USER
# Cerrar sesión y volver a iniciar
```

**Base de datos no conecta:**
```bash
# Verificar que el servicio esté corriendo
docker-compose ps
docker-compose logs postgres

# Reiniciar servicios
docker-compose restart postgres
```

**Variables de entorno no se cargan:**
```bash
# Verificar que el archivo .env existe
ls -la backend/.env

# Verificar contenido
cat backend/.env
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Equipo

Desarrollado por el **Sales CRM Team**

---

**Nota**: Este es un proyecto en desarrollo activo. Las funcionalidades están siendo implementadas de acuerdo al roadmap establecido. El entorno de desarrollo está completamente configurado con Docker para facilitar el setup.