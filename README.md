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

### ✅ Sprint 2 (Semana 2): Core CRM - **COMPLETADO**
- [x] Database schema implementation
- [x] Company and contact CRUD operations
- [x] Basic dashboard with metrics
- [x] API endpoints for CRM functionality

### ✅ Sprint 3 (Semana 3): MVP Quote System - **COMPLETADO**
- [x] Basic quote creation form
- [x] Simple PDF generation
- [x] Email template system
- [x] Quote management interface

### ✅ Sprint 4 (Semana 4): User Management - **COMPLETADO**
- [x] User profiles and settings
- [x] Team and role management
- [x] Basic reporting system
- [x] Admin interface

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

#### Companies (Nuevo en Sprint 2)

#### Quotes (Nuevo en Sprint 3)
```bash
POST   /api/v1/quotes              # Crear cotización
GET    /api/v1/quotes              # Listar todas las cotizaciones
GET    /api/v1/quotes/:id          # Obtener cotización por ID
PUT    /api/v1/quotes/:id          # Actualizar cotización
DELETE /api/v1/quotes/:id          # Eliminar cotización (soft delete)
GET    /api/v1/quotes/company/:companyId # Cotizaciones por empresa
GET    /api/v1/quotes/status/:status # Filtrar por estado
GET    /api/v1/quotes/search?q=query # Buscar cotizaciones
POST   /api/v1/quotes/:id/version   # Crear versión de cotización
POST   /api/v1/quotes/:id/send     # Enviar cotización
GET    /api/v1/quotes/:id/pdf       # Generar PDF de cotización
```

#### Quote Emails (Nuevo en Sprint 3)
```bash
POST   /api/v1/quote-emails/:quoteId/send    # Enviar email de cotización
POST   /api/v1/quote-emails/:quoteId/preview # Previsualizar email
```

#### Companies (Nuevo en Sprint 2)
```bash
POST   /api/v1/companies              # Crear empresa
GET    /api/v1/companies              # Listar todas las empresas
GET    /api/v1/companies/:id          # Obtener empresa por ID
PUT    /api/v1/companies/:id          # Actualizar empresa
DELETE /api/v1/companies/:id          # Eliminar empresa (soft delete)
GET    /api/v1/companies/status/:status # Filtrar por estado
GET    /api/v1/companies/search?q=query # Búsqueda de empresas
```

#### Contacts (Nuevo en Sprint 2)
```bash
POST   /api/v1/contacts               # Crear contacto
GET    /api/v1/contacts               # Listar todos los contactos
GET    /api/v1/contacts/:id           # Obtener contacto por ID
PUT    /api/v1/contacts/:id           # Actualizar contacto
DELETE /api/v1/contacts/:id           # Eliminar contacto (soft delete)
GET    /api/v1/contacts/company/:companyId # Contactos por empresa
GET    /api/v1/contacts/status/:status # Filtrar por estado
GET    /api/v1/contacts/search?q=query # Búsqueda de contactos
```

#### Dashboard (Nuevo en Sprint 2)
```bash
GET    /api/v1/dashboard/metrics        # Métricas del dashboard
GET    /api/v1/dashboard/recent-activities # Actividades recientes
```

#### Users (Nuevo en Sprint 4)
```bash
POST   /api/v1/users                    # Crear usuario
GET    /api/v1/users                    # Listar usuarios
GET    /api/v1/users/:id                # Obtener usuario
PUT    /api/v1/users/:id                # Actualizar usuario
DELETE /api/v1/users/:id                # Eliminar usuario
GET    /api/v1/users/email/:email        # Obtener usuario por email
GET    /api/v1/users/company/:companyId  # Usuarios por empresa
GET    /api/v1/users/role/:role          # Usuarios por rol
GET    /api/v1/users/search?q=query     # Buscar usuarios
PUT    /api/v1/users/:id/profile         # Actualizar perfil
PUT    /api/v1/users/:id/password        # Actualizar contraseña
GET    /api/v1/users/stats              # Estadísticas de usuarios
GET    /api/v1/users/:id/activity        # Actividad de usuario
```

#### Teams (Nuevo en Sprint 4)
```bash
POST   /api/v1/teams                    # Crear equipo
GET    /api/v1/teams                    # Listar equipos
GET    /api/v1/teams/:id                # Obtener equipo
PUT    /api/v1/teams/:id                # Actualizar equipo
DELETE /api/v1/teams/:id                # Eliminar equipo
POST   /api/v1/teams/:id/users           # Añadir usuario a equipo
DELETE /api/v1/teams/:id/users/:userId  # Eliminar usuario de equipo
GET    /api/v1/teams/user/:userId       # Equipos por usuario
GET    /api/v1/teams/stats              # Estadísticas de equipos
```

#### Reports (Nuevo en Sprint 4)
```bash
GET    /api/v1/reports/users            # Reporte de usuarios
GET    /api/v1/reports/companies        # Reporte de empresas
GET    /api/v1/reports/sales            # Reporte de ventas
GET    /api/v1/reports/system           # Reporte de sistema
POST   /api/v1/reports/custom          # Reporte personalizado
```

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

**Desarrollo en curso** - Sprint 4 (User Management) ✅ **100% COMPLETADO**

### ✅ Sprint 1 - Completado
- Sistema de autenticación JWT completo
- RBAC con 6 roles diferentes
- Social OAuth (Google + LinkedIn)
- Rate limiting y account lockout
- **Docker setup completo**
- **Prisma schema con 20+ entidades**

### ✅ Sprint 2 - Completado
- Implementación completa del esquema de base de datos
- Módulo Companies con CRUD completo y endpoints API
- Módulo Contacts con CRUD completo y endpoints API
- Dashboard básico con métricas y actividades recientes
- Pruebas automatizadas para servicios principales
- Integración completa con Swagger para documentación API

### ✅ Sprint 3 - Completado
- Sistema completo de gestión de cotizaciones (CRUD)
- Cálculo automático de totales (subtotal, impuestos, descuentos)
- Generación de números de cotización únicos (QTE-YYMM-XXXX)
- Sistema de versiones para historial de cotizaciones
- Generación de PDFs básica para cotizaciones
- Sistema de plantillas de email profesional (creación, recordatorio, seguimiento)
- 12 endpoints API para gestión completa de cotizaciones
- Integración completa con módulos Companies y Contacts
- Dashboard actualizado con métricas de cotizaciones
- Pruebas automatizadas completas para todos los servicios

### ✅ Sprint 4 - Completado
- Sistema completo de gestión de usuarios (CRUD)
- Gestión de perfiles de usuario y configuraciones
- Sistema de equipos con asignación de roles
- Sistema de reportes básicos (usuarios, empresas, ventas)
- Interfaz de administración completa
- 25+ endpoints API para gestión de usuarios y equipos
- Integración con módulos existentes (Auth, Companies, Dashboard)
- Pruebas automatizadas completas para todos los servicios
- Documentación completa de API con Swagger

### 🔄 Próximos Pasos
1. Iniciar Sprint 5 (Advanced Features)
2. Implementar sistema de auditoría completo
3. Desarrollar sistema de notificaciones
4. Crear sistema de facturación avanzado
5. Implementar integración con sistemas externos

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