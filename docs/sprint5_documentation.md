# 📋 Sprint 5 - Advanced Quote Builder (Backend)

## 📌 Overview

El Sprint 5 se enfoca en evolucionar el módulo de **Cotizaciones (Quotes)** hacia un “Advanced Quote Builder” centrado en:

- **Items dinámicos** (gestión robusta de `QuoteItem`: orden, totales por item, reemplazo/edición).
- **Cálculo de impuestos y descuentos** consistente con el modelo de datos (por item + consolidación en la cabecera).
- **Versionado confiable** de cotizaciones ante cambios relevantes.
- **Status tracking / pipeline** con transiciones válidas y endpoints dedicados.
- **Correcciones técnicas** detectadas en Sprint 4 (rutas, nested writes de Prisma, DTO validations).

Referencia de alcance base: Sprint 5 en roadmap de recomendaciones (Advanced Quote Builder).

## 🎯 Objetivos

1. **Persistencia correcta de QuoteItems**
   - Crear cotización con `items` mediante nested write (`create`).
   - Actualizar cotización con estrategia clara para items: replace total o upsert por `id`.

2. **Cálculo avanzado de montos**
   - Calcular por item:
     - `lineSubtotal = quantity * unitPrice`
     - aplicar `discount` del item (monto o porcentaje; ver decisión abajo)
     - aplicar `taxRate` del item (por defecto 0.18 si no se define)
     - `totalPrice` por item persistido en BD
   - Consolidar en cabecera:
     - `subtotal` = suma de subtotales (o netos antes de impuesto según decisión)
     - `taxAmount` = suma de impuestos por item
     - `discountAmount` = suma de descuentos por item (+ descuento global si se mantiene)
     - `totalAmount` = subtotal + taxAmount - discountAmount
   - Mantener consistencia con el schema Prisma (`QuoteItem.totalPrice`, `QuoteItem.order`).

3. **Versionado**
   - Crear una versión cuando:
     - Cambian `items` (cualquier cambio estructural o de precios/cantidades).
     - Cambia `status` (por ejemplo DRAFT → SENT o SENT → ACCEPTED).
   - Snapshot de `items` debe serializarse con los campos relevantes (incluyendo `totalPrice`, `taxRate`, `discount`, `order`).

4. **Status Tracking / Pipeline**
   - Exponer endpoints para cambios de estado con reglas de transición.
   - Registrar timestamps relevantes:
     - `sentAt`, `viewedAt`, `acceptedAt`, `rejectedAt`, `expiredAt`.
   - Validar transiciones permitidas y devolver error cuando no corresponda.

5. **Calidad y DX**
   - DTOs con `class-validator` y Swagger decorators (`@ApiProperty`) como estándar del proyecto.
   - Ajuste de rutas en controller para evitar colisiones con `:id`.
   - Pruebas unitarias actualizadas para las nuevas reglas.

## ✅ Decisiones de diseño (propuestas)

### Descuento por item
- Opción A (simple): `discount` es **monto** fijo por item.
- Opción B (más flexible): `discount` puede ser porcentaje o monto (requiere `discountType`).

**Sprint 5 (propuesta): Opción A** para evitar cambios en schema. (Si se requiere porcentaje, se agregará en un sprint posterior o como extensión con campo extra).

### Actualización de items
- Estrategia recomendada Sprint 5: **replace total** de items cuando `items` viene en UpdateQuoteDto.
  - Borrar items existentes y recrearlos (transaccional).
  - Mantener `order` como fuente de orden.
- Alternativa (futura): upsert por `QuoteItem.id`.

**Sprint 5 (propuesta): replace total** para simplicidad y consistencia.

## 🔧 Cambios esperados (Backend)

### 1) DTOs
- `CreateQuoteDto`:
  - Validaciones para:
    - `title`, `clientId`, `assignedToId`, `createdById`
    - `items[]` (ValidateNested)
    - `quantity > 0`, `unitPrice >= 0`, `taxRate` en rango
  - `items[]` debe soportar:
    - `order` (opcional, default incremental)
    - `unit` (default "unit")
    - `discount` (default 0)
    - `taxRate` (default 0.18)

- `UpdateQuoteDto`:
  - Permitir update parcial (PartialType) pero con validaciones correctas.
  - Si `items` viene, se aplica estrategia de replace.

### 2) QuotesService
- Crear helper interno: `calculateTotals(items, options?)` que retorne:
  - items normalizados con `totalPrice` y `order`
  - `subtotal`, `taxAmount`, `discountAmount`, `totalAmount`

- `create()`:
  - Usar nested write:
    - `items: { create: [...] }`
  - Persistir `totalPrice` en cada item.
  - Forzar `status = DRAFT` si no se especifica (o ignorar input de status en create si se decide).

- `update()`:
  - Si `items` viene:
    - reemplazar items en transacción
    - recalcular totales y persistir
    - crear `QuoteVersion`
  - Si solo cambia `status`:
    - validar transición
    - set timestamp
    - crear `QuoteVersion`

- `createVersion()`:
  - Normalizar snapshot `items` (usar el include de `items` y mapear).

### 3) QuotesController
- Reordenar rutas para evitar shadowing:
  - Definir primero rutas estáticas:
    - `GET /quotes/search`
    - `GET /quotes/company/:companyId`
    - `GET /quotes/status/:status`
  - Luego `GET /quotes/:id`
- Nuevo endpoint (propuesto):
  - `PATCH /quotes/:id/status` con body `{ status: QuoteStatus }`
- Opcional:
  - `POST /quotes/:id/mark-viewed`
  - `POST /quotes/:id/accept`
  - `POST /quotes/:id/reject`

### 4) Tests
- Tests para:
  - cálculo por item (taxRate/discount/order)
  - create con nested write correcto (payload que Prisma espera)
  - update con replace de items + versionado creado
  - status transitions válidas/ inválidas

## 🧾 Criterios de aceptación (Sprint 5)

1. **Crear cotización con items**
   - Dado un `CreateQuoteDto` con items,
   - cuando se crea la cotización,
   - entonces:
     - se persisten items en `quote_items`
     - cada item tiene `totalPrice` calculado
     - la cotización tiene `subtotal`, `taxAmount`, `discountAmount`, `totalAmount` consistentes

2. **Actualizar items (replace)**
   - Dado un `UpdateQuoteDto` con `items`,
   - cuando se actualiza,
   - entonces:
     - los items anteriores se reemplazan por los nuevos
     - se recalculan y persisten totales
     - se crea una nueva `QuoteVersion` con snapshot de items

3. **Cambiar estado con reglas**
   - Dado un cambio `PATCH /quotes/:id/status`,
   - cuando el status cambia,
   - entonces:
     - se valida transición (si no corresponde, 400/422)
     - se setea el timestamp apropiado
     - se crea una versión

4. **Rutas no colisionan**
   - `GET /quotes/search`, `GET /quotes/company/:companyId`, `GET /quotes/status/:status`
   - responden correctamente y no son capturadas por `GET /quotes/:id`.

5. **Validación de entrada**
   - Requests inválidos (items vacíos, quantity <= 0, ids faltantes) responden con error de validación.

## 📝 Notas / Próximos pasos

- Sprint 6 contempla facturación y pagos; Sprint 5 se concentra en “Advanced Quote Builder” (quotes) como base.
- En sprints futuros:
  - descuento por porcentaje (`discountType`)
  - upsert granular de items
  - cache/paginación avanzada