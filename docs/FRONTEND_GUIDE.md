# 🏟️ Sport Manager — Frontend Blueprint

> **Versión del documento:** 1.0  
> **Generado desde:** análisis completo de `schema.prisma`, rutas, controladores, servicios, repositorios, validators y middleware.  
> **Base URL de la API:** `/api/v1`  
> **Timezone del complejo:** `America/Argentina/Buenos_Aires` (hardcodeada en el backend)

---

## Tabla de Contenidos

1. [Mapeo de Modelos de Datos (Interfaces TypeScript)](#1-mapeo-de-modelos-de-datos-interfaces-typescript)
2. [Catálogo de Endpoints](#2-catálogo-de-endpoints)
   - [Auth](#21-auth)
   - [Complexes](#22-complexes)
   - [Courts](#23-courts)
   - [Bookings](#24-bookings)
3. [Guía de Flujos e Interceptores](#3-guía-de-flujos-e-interceptores)
4. [Diccionario de Errores para la UI](#4-diccionario-de-errores-para-la-ui)
5. [Supuestos y Convenciones](#5-supuestos-y-convenciones)
6. [Observaciones de Arquitectura](#6-observaciones-de-arquitectura)

---

## 1. Mapeo de Modelos de Datos (Interfaces TypeScript)

Generadas **directamente** desde `prisma/schema.prisma`. No se inventan campos.

```typescript
// ============================================================
//  Enums
// ============================================================

export type UserRole = 'USER' | 'OWNER';
// Nota: 'ADMIN' se usa en lógica de negocio (complex.service.ts)
// pero NO está definido como opción en el validator de registro.
// Ver Observaciones de Arquitectura §6.

export type ComplexStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export enum BookingStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}


// ============================================================
//  Models
// ============================================================

export interface User {
  id:          number;
  name:        string;
  email:       string;
  username:    string;
  password:    string;       // Nunca se devuelve al frontend
  role:        string;       // 'USER' | 'OWNER' (string en schema)
  confirmed:   boolean;
  phoneNumber: string | null;
}

/** Subconjunto seguro que devuelve el middleware authenticate */
export interface UserSafe {
  id:       number;
  name:     string;
  email:    string;
  username: string;
  role:     string;
}

export interface Complex {
  id:                 number;
  name:               string;
  description:        string | null;
  address:            string;
  lat:                number | null;
  lng:                number | null;
  logo:               string | null;
  status:             string;         // 'PENDING' | 'APPROVED' | 'REJECTED'
  ownerId:            number;
  minBookingDuration: number;         // default: 60
  maxBookingDuration: number;         // default: 180
  createdAt:          string;         // ISO 8601
  updatedAt:          string;         // ISO 8601
  deletedAt:          string | null;  // ISO 8601 | null
}

export interface ComplexSchedule {
  id:        number;
  dayOfWeek: number;    // 0 = Domingo … 6 = Sábado
  startTime: string;    // "HH:MM"
  endTime:   string;    // "HH:MM"
  complexId: number;
}

export interface Court {
  id:        number;
  name:      string;
  sport:     string;
  type:      string | null;
  price:     string;        // Decimal → llega como string en JSON
  duration:  number;        // default: 60 (minutos)
  isIndoor:  boolean;
  isActive:  boolean;
  complexId: number;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  deletedAt: string | null;
}

export interface Booking {
  id:         number;
  courtId:    number;
  userId:     number;
  startTime:  string;       // ISO 8601 UTC
  endTime:    string;       // ISO 8601 UTC
  totalPrice: string;       // Decimal → string en JSON
  status:     BookingStatus;
  createdAt:  string;       // ISO 8601
  updatedAt:  string;       // ISO 8601
}


// ============================================================
//  DTOs (payloads que el frontend debe enviar)
// ============================================================

export interface RegisterDTO {
  name:         string;
  email:        string;
  username:     string;
  password:     string;       // min 8 caracteres
  role?:        'USER' | 'OWNER';
  phoneNumber?: string;       // solo dígitos, 10-15 chars
}

export interface LoginDTO {
  email:    string;
  password: string;
}

export interface BecomeOwnerDTO {
  phoneNumber: string;        // solo dígitos, 10-15 chars
}

export interface CreateComplexDTO {
  name:      string;
  address:   string;
  schedules: ScheduleInput[];
}

export interface ScheduleInput {
  dayOfWeek: number;  // 0-6
  startTime: string;  // "HH:MM"
  endTime:   string;  // "HH:MM"
}

export interface UpdateComplexDTO {
  name?:        string;
  description?: string;       // max 150 chars
  address?:     string;
  lat?:         number;       // -90 a 90
  lng?:         number;       // -180 a 180
  logo?:        string;
  openTime?:    string;       // "HH:MM"  ← Ver Observación §6.2
  closeTime?:   string;       // "HH:MM"  ← Ver Observación §6.2
}

export interface UpdateComplexStatusDTO {
  status: 'APPROVED' | 'REJECTED';
}

export interface CreateCourtDTO {
  name:       string;
  sport:      string;
  complexId:  number;
  price:      number;         // float, ≥ 0
  type?:      string;
  duration?:  number;         // int, minutos
  isIndoor?:  boolean;
  isActive?:  boolean;
}

export interface CreateBookingDTO {
  courtId:   number;
  startTime: string;  // ISO 8601 UTC obligatorio: "2026-01-05T21:00:00Z"
  endTime:   string;  // ISO 8601 UTC obligatorio: "2026-01-05T22:00:00Z"
}


// ============================================================
//  Responses específicas
// ============================================================

export interface AvailabilitySlot {
  start:     string;                 // ISO 8601 UTC
  end:       string;                 // ISO 8601 UTC
  available: boolean;
  status:    'AVAILABLE' | 'BOOKED';
}

/** Respuesta estándar de error (AppError) */
export interface ApiError {
  status:  'error';
  message: string;
}

/** Respuesta de validación (express-validator) */
export interface ValidationError {
  errors: Array<{
    type:     string;
    value:    any;
    msg:      string;
    path:     string;
    location: string;
  }>;
}
```

---

## 2. Catálogo de Endpoints

> **Prefijo global:** `/api/v1`  
> Todos los endpoints protegidos requieren header `Authorization: Bearer <token>`.

---

### 2.1 Auth

#### `POST /api/v1/auth/register`

| Aspecto | Detalle |
|---|---|
| **Auth** | ❌ Pública |
| **Descripción** | Registra un nuevo usuario. El `username` se slugifica internamente (lowercase, sin espacios ni caracteres especiales). |
| **Validaciones** | `name` (requerido), `email` (email válido), `username` (requerido), `password` (min 8 chars), `role` (opcional: `USER` \| `OWNER`), `phoneNumber` (opcional, solo dígitos, 10-15 chars). Si `role === 'OWNER'`, `phoneNumber` es obligatorio (validado en servicio, no en validator). |

**Request Body:**
```json
{
  "name": "Rodrigo Cabrera",
  "email": "rodrigo@email.com",
  "username": "rodricabrera",
  "password": "miPassword123",
  "role": "OWNER",
  "phoneNumber": "3515551234"
}
```

**Response `201`:**
```json
{
  "message": "Usuario creado correctamente",
  "data": {
    "id": 1,
    "name": "Rodrigo Cabrera",
    "email": "rodrigo@email.com",
    "username": "rodricabrera",
    "role": "OWNER"
  }
}
```

| Código | Causa |
|---|---|
| `400` | Validación de campos (express-validator) / OWNER sin `phoneNumber` |
| `409` | Email ya en uso / Username ya registrado |

---

#### `POST /api/v1/auth/login`

| Aspecto | Detalle |
|---|---|
| **Auth** | ❌ Pública |
| **Descripción** | Autentica al usuario y devuelve un JWT. |
| **Validaciones** | `email` (email válido), `password` (requerido). |

**Request Body:**
```json
{
  "email": "rodrigo@email.com",
  "password": "miPassword123"
}
```

**Response `200`:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **El login devuelve el token como texto plano (`res.send(token)`), NO como JSON.** El `Content-Type` será `text/html` por defecto de Express. El frontend debe leer `response.text()` en lugar de `response.json()`.

| Código | Causa |
|---|---|
| `400` | Validación de campos |
| `403` | Contraseña incorrecta |
| `404` | Usuario no existe |

---

#### `GET /api/v1/auth/user`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Devuelve los datos del usuario autenticado (perfil). |

**Response `200`:**
```json
{
  "id": 1,
  "name": "Rodrigo Cabrera",
  "username": "rodricabrera",
  "email": "rodrigo@email.com",
  "role": "OWNER"
}
```

> Nota: devuelve directamente el objeto `UserSafe`, sin wrapper `{ data: ... }`.

| Código | Causa |
|---|---|
| `401` | Token ausente o malformado |
| `404` | Usuario del token no encontrado en DB |
| `500` | Token inválido / expirado |

---

#### `POST /api/v1/auth/become-owner`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Actualiza el rol del usuario a OWNER. Requiere teléfono de contacto. |
| **Validaciones** | `phoneNumber` (requerido, solo dígitos, 10-15 chars) |

**Request Body:**
```json
{
  "phoneNumber": "3515551234"
}
```

**Response `200`:**
```json
{
  "message": "Felicitaciones, ahora podes administrar tus complejos deportivos."
}
```

| Código | Causa |
|---|---|
| `400` | Ya es OWNER / Validación de campos |
| `401` | No autenticado |

---

### 2.2 Complexes

#### `POST /api/v1/complexes`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Rol requerido** | `OWNER` |
| **Descripción** | Crea un nuevo complejo deportivo con sus horarios de atención. |

**Request Body:**
```json
{
  "name": "Complejo El Trébol",
  "address": "Av. Colón 1234, Córdoba",
  "schedules": [
    { "dayOfWeek": 1, "startTime": "08:00", "endTime": "23:00" },
    { "dayOfWeek": 2, "startTime": "08:00", "endTime": "23:00" },
    { "dayOfWeek": 3, "startTime": "08:00", "endTime": "23:00" },
    { "dayOfWeek": 4, "startTime": "08:00", "endTime": "23:00" },
    { "dayOfWeek": 5, "startTime": "08:00", "endTime": "00:00" },
    { "dayOfWeek": 6, "startTime": "09:00", "endTime": "00:00" }
  ]
}
```

**Response `201`:**
```json
{
  "message": "Complejo creado correctamente.",
  "newComplex": {
    "id": 1,
    "name": "Complejo El Trébol",
    "description": null,
    "address": "Av. Colón 1234, Córdoba",
    "lat": null,
    "lng": null,
    "logo": null,
    "status": "PENDING",
    "ownerId": 1,
    "minBookingDuration": 60,
    "maxBookingDuration": 180,
    "createdAt": "2026-06-14T19:00:00.000Z",
    "updatedAt": "2026-06-14T19:00:00.000Z",
    "deletedAt": null,
    "schedules": [
      { "id": 1, "dayOfWeek": 1, "startTime": "08:00", "endTime": "23:00", "complexId": 1 },
      { "id": 2, "dayOfWeek": 2, "startTime": "08:00", "endTime": "23:00", "complexId": 1 }
    ]
  }
}
```

> ⚠️ **Nota:** la key de respuesta es `newComplex` (no `data`).

| Código | Causa |
|---|---|
| `400` | Validación de campos / schedules vacíos |
| `401` | No autenticado |
| `403` | No es OWNER |

---

#### `GET /api/v1/complexes`

| Aspecto | Detalle |
|---|---|
| **Auth** | 🟡 Opcional (optionalAuthenticate) |
| **Descripción** | Lista todos los complejos activos (status `APPROVED` y `deletedAt === null`). |

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Complejo El Trébol",
    "description": "El mejor complejo de Córdoba",
    "address": "Av. Colón 1234, Córdoba",
    "lat": -31.4201,
    "lng": -64.1888,
    "logo": null,
    "status": "APPROVED",
    "ownerId": 1,
    "minBookingDuration": 60,
    "maxBookingDuration": 180,
    "createdAt": "2026-06-14T19:00:00.000Z",
    "updatedAt": "2026-06-14T19:00:00.000Z",
    "deletedAt": null
  }
]
```

> Devuelve directamente el array, sin wrapper.

---

#### `GET /api/v1/complexes/my-complexes`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Lista los complejos activos del owner autenticado. Incluye `schedules`. |

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Complejo El Trébol",
    "description": "El mejor complejo de Córdoba",
    "address": "Av. Colón 1234, Córdoba",
    "lat": -31.4201,
    "lng": -64.1888,
    "logo": null,
    "status": "APPROVED",
    "ownerId": 1,
    "minBookingDuration": 60,
    "maxBookingDuration": 180,
    "createdAt": "2026-06-14T19:00:00.000Z",
    "updatedAt": "2026-06-14T19:00:00.000Z",
    "deletedAt": null,
    "schedules": [
      { "id": 1, "dayOfWeek": 1, "startTime": "08:00", "endTime": "23:00", "complexId": 1 }
    ]
  }
]
```

---

#### `GET /api/v1/complexes/my-deleted`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Lista los complejos soft-deleted del owner autenticado. **No incluye** `schedules`. |

**Response `200`:** Array de `Complex` (sin relaciones).

---

#### `PATCH /api/v1/complexes/:id`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Rol** | Owner del complejo o ADMIN |
| **Descripción** | Actualiza parcialmente un complejo activo. |
| **Param** | `id` — int (validado por `validateId`) |

**Request Body (todos opcionales):**
```json
{
  "name": "Nuevo Nombre",
  "description": "Descripción corta",
  "address": "Nueva dirección 456",
  "lat": -31.4201,
  "lng": -64.1888,
  "logo": "https://example.com/logo.png"
}
```

**Response `200`:** Objeto `Complex` actualizado (sin relaciones incluidas).

| Código | Causa |
|---|---|
| `400` | Validación de campos |
| `401` | No autenticado |
| `403` | No es owner del complejo ni ADMIN |
| `404` | Complejo no encontrado |

---

#### `DELETE /api/v1/complexes/:id`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Soft-delete: setea `deletedAt` al timestamp actual. |
| **Param** | `id` — int |

**Response `200`:**
```json
{
  "message": "Complejo eliminado correctamente."
}
```

| Código | Causa |
|---|---|
| `403` | No es owner ni ADMIN |
| `404` | Complejo no encontrado |

---

#### `PATCH /api/v1/complexes/:id/restore`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Restaura un complejo soft-deleted (setea `deletedAt = null`). |
| **Param** | `id` — int (validado por `validateId`) |

**Response `200`:**
```json
{
  "message": "Complejo restaurado correctamente",
  "complex": { /* Complex completo */ }
}
```

| Código | Causa |
|---|---|
| `400` | El complejo no está eliminado |
| `403` | No es owner ni ADMIN |
| `404` | Complejo no encontrado |

---

#### `PATCH /api/v1/complexes/:id/status`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Rol requerido** | `ADMIN` |
| **Descripción** | Aprueba o rechaza un complejo (moderación). |
| **Param** | `id` — int (validado por `validateId`) |

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Response `200`:**
```json
{
  "message": "Estado actualizado correctamente.",
  "complex": { /* Complex actualizado */ }
}
```

| Código | Causa |
|---|---|
| `400` | Status inválido (debe ser `APPROVED` o `REJECTED`) |
| `403` | No es ADMIN |

---

#### `PATCH /api/v1/complexes/:id/schedules`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Reemplaza **todos** los horarios del complejo (delete + create en transacción). |
| **Param** | `id` — int |

**Request Body:**
```json
{
  "schedules": [
    { "dayOfWeek": 0, "startTime": "10:00", "endTime": "22:00" },
    { "dayOfWeek": 1, "startTime": "08:00", "endTime": "23:00" }
  ]
}
```

**Response `200`:**
```json
{
  "message": "Horarios actualizados correctamente.",
  "complex": [
    { "id": 10, "dayOfWeek": 0, "startTime": "10:00", "endTime": "22:00", "complexId": 1 },
    { "id": 11, "dayOfWeek": 1, "startTime": "08:00", "endTime": "23:00", "complexId": 1 }
  ]
}
```

> ⚠️ **Nota:** la key `complex` contiene el array de schedules (no el complejo), confuso pero fiel al código.

| Código | Causa |
|---|---|
| `400` | Validación de horarios |
| `403` | No es owner ni ADMIN |
| `404` | Complejo no encontrado |

---

#### `GET /api/v1/complexes/:id/courts`

| Aspecto | Detalle |
|---|---|
| **Auth** | ❌ Pública |
| **Descripción** | Lista las canchas activas (`isActive: true`, `deletedAt: null`) de un complejo. |
| **Param** | `id` — int (del complejo) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Cancha 1",
      "sport": "fútbol 5",
      "type": "sintético",
      "price": "15000.00",
      "duration": 60,
      "isIndoor": false,
      "isActive": true,
      "complexId": 1,
      "createdAt": "2026-06-14T19:00:00.000Z",
      "updatedAt": "2026-06-14T19:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### 2.3 Courts

#### `POST /api/v1/courts`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Rol** | Owner del complejo asociado |
| **Descripción** | Crea una nueva cancha dentro de un complejo propio. |

**Request Body:**
```json
{
  "name": "Cancha 1",
  "sport": "fútbol 5",
  "complexId": 1,
  "price": 15000,
  "type": "sintético",
  "duration": 60,
  "isIndoor": false,
  "isActive": true
}
```

**Response `201`:**
```json
{
  "message": "Cancha creada con éxito",
  "data": {
    "id": 1,
    "name": "Cancha 1",
    "sport": "fútbol 5",
    "type": "sintético",
    "price": "15000",
    "duration": 60,
    "isIndoor": false,
    "isActive": true,
    "complexId": 1,
    "createdAt": "2026-06-14T19:00:00.000Z",
    "updatedAt": "2026-06-14T19:00:00.000Z",
    "deletedAt": null
  }
}
```

| Código | Causa |
|---|---|
| `400` | Validación de campos |
| `401` | No autenticado |
| `403` | No es owner del complejo |

---

#### `GET /api/v1/courts`

| Aspecto | Detalle |
|---|---|
| **Auth** | ❌ Pública |
| **Descripción** | Lista todas las canchas activas (sin eliminar). |

**Response `200`:**
```json
{
  "data": [ /* Array de Court */ ]
}
```

| Código | Causa |
|---|---|
| `404` | No se encontraron canchas activas |

---

#### `GET /api/v1/courts/my-courts`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Lista las canchas activas del owner autenticado. Incluye `complex` anidado. |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Cancha 1",
      "sport": "fútbol 5",
      "type": "sintético",
      "price": "15000.00",
      "duration": 60,
      "isIndoor": false,
      "isActive": true,
      "complexId": 1,
      "createdAt": "2026-06-14T19:00:00.000Z",
      "updatedAt": "2026-06-14T19:00:00.000Z",
      "deletedAt": null,
      "complex": {
        "id": 1,
        "name": "Complejo El Trébol",
        "address": "Av. Colón 1234"
      }
    }
  ]
}
```

| Código | Causa |
|---|---|
| `404` | No se encontraron canchas activas |

---

#### `GET /api/v1/courts/my-deleted`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Lista las canchas eliminadas (soft-delete) del owner. Incluye `complex`. |

| Código | Causa |
|---|---|
| `404` | No se encontraron canchas en papelera |

---

#### `GET /api/v1/courts/:id`

| Aspecto | Detalle |
|---|---|
| **Auth** | ❌ Pública |
| **Descripción** | Devuelve una cancha activa por ID. Incluye `complex` anidado. |
| **Param** | `id` — int |

**Response `200`:** Objeto `Court` con `complex` incluido (sin wrapper `data`).

| Código | Causa |
|---|---|
| `404` | Cancha no encontrada |

---

#### `PATCH /api/v1/courts/:id`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Actualiza una cancha existente. |
| **Param** | `id` — int |

**Request Body:** Campos parciales de `CourtDTO` (name, sport, complexId, price, type, duration, isIndoor, isActive).

**Response `200`:** Objeto `Court` actualizado.

| Código | Causa |
|---|---|
| `403` | No es owner del complejo |
| `404` | Cancha no encontrada |

---

#### `DELETE /api/v1/courts/:id`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Soft-delete: setea `deletedAt = now()` e `isActive = false`. |
| **Param** | `id` — int |

**Response `200`:**
```json
{
  "message": "Cancha eliminada correctamente."
}
```

---

#### `PATCH /api/v1/courts/:id/restore`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Restaura una cancha eliminada. Setea `deletedAt = null`, pero `isActive = false`. |
| **Param** | `id` — int |

**Response `200`:**
```json
{
  "message": "Cancha restaurada correctamente",
  "court": { /* Court restaurada */ }
}
```

> ⚠️ **Importante:** al restaurar, `isActive` queda en `false`. El owner debe activarla manualmente via `PATCH`.

| Código | Causa |
|---|---|
| `403` | No es owner del complejo |
| `404` | Cancha no encontrada en papelera |

---

#### `DELETE /api/v1/courts/:id/force`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Elimina permanentemente una cancha (solo si ya está en papelera). |
| **Param** | `id` — int |

**Response `200`:**
```json
{
  "message": "Cancha eliminada correctamente"
}
```

| Código | Causa |
|---|---|
| `403` | No es owner del complejo |
| `404` | Cancha no encontrada en papelera |

---

### 2.4 Bookings

#### `POST /api/v1/bookings`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Crea una nueva reserva. El backend calcula el precio automáticamente. |

**Request Body:**
```json
{
  "courtId": 1,
  "startTime": "2026-06-20T18:00:00Z",
  "endTime": "2026-06-20T19:00:00Z"
}
```

> ⚠️ Las fechas **DEBEN** ser ISO 8601 en UTC con sufijo `Z`. No se aceptan offsets.  
> La regex de validación es: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/`

**Response `201`:**
```json
{
  "message": "Reserva creada con éxito",
  "data": {
    "id": 1,
    "courtId": 1,
    "userId": 1,
    "startTime": "2026-06-20T18:00:00.000Z",
    "endTime": "2026-06-20T19:00:00.000Z",
    "totalPrice": "15000",
    "status": "CONFIRMED",
    "createdAt": "2026-06-14T19:30:00.000Z",
    "updatedAt": "2026-06-14T19:30:00.000Z"
  }
}
```

**Fórmula de precio:**
```
totalPrice = Math.round((court.price / 60) * durationMinutes)
```

| Código | Causa |
|---|---|
| `400` | Fecha inválida / En el pasado / End ≤ Start / Cancha inactiva / Complejo cerrado ese día / Fuera de horario / Duración no es múltiplo de 30 / Duración < mínimo o > máximo |
| `401` | No autenticado |
| `404` | Cancha no encontrada |
| `409` | **COLLISION_DETECTED** — La cancha ya fue reservada en ese horario |
| `500` | Error de configuración del complejo |

---

#### `GET /api/v1/bookings/availability`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Consulta la disponibilidad de una cancha para una fecha local del complejo. Devuelve slots de 60 min. |

**Query Parameters:**

| Param | Tipo | Requerido | Formato | Descripción |
|---|---|---|---|---|
| `courtId` | int | ✅ | — | ID de la cancha |
| `date` | string | ✅ | `YYYY-MM-DD` | Fecha en timezone del complejo |

**Ejemplo:**
```
GET /api/v1/bookings/availability?courtId=1&date=2026-06-20
```

**Response `200`:**
```json
[
  {
    "start": "2026-06-20T11:00:00.000Z",
    "end": "2026-06-20T12:00:00.000Z",
    "available": true,
    "status": "AVAILABLE"
  },
  {
    "start": "2026-06-20T12:00:00.000Z",
    "end": "2026-06-20T13:00:00.000Z",
    "available": false,
    "status": "BOOKED"
  }
]
```

> Devuelve directamente el array, sin wrapper. Si el complejo está cerrado ese día, devuelve `[]`.

| Código | Causa |
|---|---|
| `400` | Fecha inválida / Formato incorrecto |
| `401` | No autenticado |

---

#### `GET /api/v1/bookings/my-bookings`

| Aspecto | Detalle |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Descripción** | Lista el historial de reservas del usuario autenticado, ordenadas por fecha de inicio descendente (las más recientes primero). Incluye detalles de la cancha y el complejo. |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "courtId": 1,
      "userId": 1,
      "startTime": "2026-06-20T18:00:00.000Z",
      "endTime": "2026-06-20T19:00:00.000Z",
      "totalPrice": "15000",
      "status": "CONFIRMED",
      "createdAt": "2026-06-14T19:30:00.000Z",
      "updatedAt": "2026-06-14T19:30:00.000Z",
      "court": {
        "id": 1,
        "name": "Cancha 1",
        "sport": "fútbol 5",
        "type": "sintético",
        "price": "15000",
        "duration": 60,
        "isIndoor": false,
        "isActive": true,
        "complexId": 1,
        "createdAt": "2026-06-14T19:00:00.000Z",
        "updatedAt": "2026-06-14T19:00:00.000Z",
        "deletedAt": null,
        "complex": {
          "id": 1,
          "name": "Complejo El Trébol",
          "description": "El mejor complejo de Córdoba",
          "address": "Av. Colón 1234, Córdoba",
          "lat": -31.4201,
          "lng": -64.1888,
          "logo": null,
          "status": "APPROVED",
          "ownerId": 1,
          "minBookingDuration": 60,
          "maxBookingDuration": 180,
          "createdAt": "2026-06-14T19:00:00.000Z",
          "updatedAt": "2026-06-14T19:00:00.000Z",
          "deletedAt": null
        }
      }
    }
  ]
}
```

> Devuelve un objeto con la key `data` que contiene un array de reservas. Si el usuario no tiene reservas, devuelve `{ "data": [] }`.

| Código | Causa |
|---|---|
| `401` | No autenticado |

---

## 3. Guía de Flujos e Interceptores

### 3.1 Almacenamiento del JWT

```typescript
// auth.service.ts (Angular)
login(credentials: LoginDTO): Observable<string> {
  return this.http.post('/api/v1/auth/login', credentials, {
    responseType: 'text'  // ← IMPORTANTE: la respuesta es texto plano
  });
}

onLoginSuccess(token: string): void {
  localStorage.setItem('auth_token', token);
}

getToken(): string | null {
  return localStorage.getItem('auth_token');
}

logout(): void {
  localStorage.removeItem('auth_token');
}
```

### 3.2 Interceptor HTTP (adjuntar Bearer Token)

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
```

**Registrarlo en `app.config.ts`:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### 3.3 Manejo de Expiración del Token

- **Expiración del JWT:** `180 días` (configurado en `utils/jwt.ts` como `expiresIn: '180d'`).
- **Refresh Token:** No definido en el backend actual. No existe endpoint ni mecanismo de refresh.
- **Estrategia recomendada para el frontend:**

```typescript
// error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 500) {
        // El backend devuelve 500 con { error: 'Token No Válido' } 
        // cuando jwt.verify() falla (incluye expiración)
        if (error.error?.error === 'Token No Válido' || error.status === 401) {
          localStorage.removeItem('auth_token');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
```

> ⚠️ **El backend devuelve `500` (no `401`) cuando `jwt.verify()` lanza error de token expirado o corrupto.** El frontend debe interceptar ambos casos.

### 3.4 Flujo Lógico de la Grilla de Turnos

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: CONSULTA DE DISPONIBILIDAD                        │
│                                                             │
│  El usuario selecciona:                                     │
│    • Un complejo → GET /complexes/:id/courts                │
│    • Una cancha   (del listado anterior)                    │
│    • Una fecha    (datepicker, formato YYYY-MM-DD)          │
│                                                             │
│  → GET /bookings/availability?courtId={id}&date={YYYY-MM-DD}│
│  ← Array de AvailabilitySlot[]                              │
│                                                             │
│  Renderizar grilla con slots de 60 min:                     │
│    🟢 AVAILABLE → seleccionable                             │
│    🔴 BOOKED    → deshabilitado, indicar "Ocupado"          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: SELECCIÓN DE SLOT(S)                              │
│                                                             │
│  El usuario clickea uno o más slots contiguos.              │
│  El frontend debe calcular localmente:                      │
│    • startTime = slot[0].start                              │
│    • endTime   = slot[last].end                             │
│    • duration  = diferencia en minutos                      │
│                                                             │
│  Validaciones locales previas al envío:                     │
│    ✓ Duración es múltiplo de 30 min                         │
│    ✓ Duración ≥ complex.minBookingDuration (default: 60)    │
│    ✓ Duración ≤ complex.maxBookingDuration (default: 180)   │
│    ✓ No incluye slots BOOKED                                │
│    ✓ Los slots son contiguos                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: CONFIRMACIÓN                                       │
│                                                             │
│  Mostrar modal de confirmación con:                         │
│    • Cancha, fecha, horario (start → end)                   │
│    • Precio estimado (calcular en front con la misma        │
│      fórmula: Math.round((price/60) * duration))            │
│                                                             │
│  Al confirmar:                                              │
│  → POST /bookings                                           │
│    Body: { courtId, startTime, endTime }                    │
│    (fechas en UTC con sufijo Z)                             │
└─────────────────────────────────────────────────────────────┘
                          │
                     ┌────┴────┐
                     │         │
                  201 OK    409 COLLISION
                     │         │
                     ▼         ▼
              Toast éxito   Modal de error:
              + redirect    "La cancha ya fue
                            reservada por otro
                            usuario"
                            + botón "Reintentar"
                            que recarga availability
```

**Manejo de colisiones (race condition):**

Incluso si el frontend muestra un slot como `AVAILABLE`, otro usuario puede haberlo reservado entre la consulta de disponibilidad y el `POST /bookings`. El backend detecta esto dentro de una **transacción de Prisma** y devuelve `409` con el mensaje:

```json
{
  "status": "error",
  "message": "La cancha ya fue reservada por otro usuario dentro de ese horario"
}
```

**Acción recomendada:** mostrar un modal de conflicto, volver a consultar la disponibilidad y re-renderizar la grilla.

---

## 4. Diccionario de Errores para la UI

### 4.1 Errores de Negocio (AppError)

| HTTP | Mensaje del backend | Código interno sugerido | Significado | Acción recomendada en UI |
|------|---------------------|------------------------|-------------|--------------------------|
| `400` | `El Nombre es obligatorio` | `VALIDATION_ERROR` | Campo requerido faltante | Inline error en el campo del form |
| `400` | `Los dueños deben registrar un teléfono de contacto` | `OWNER_PHONE_REQUIRED` | Role OWNER sin phoneNumber | Mostrar inline error en campo phone |
| `400` | `Ya sos dueño` | `ALREADY_OWNER` | Intento de become-owner duplicado | Toast informativo |
| `400` | `Formato de fecha inválido` | `INVALID_DATE_FORMAT` | Fechas de booking mal formateadas | Toast error |
| `400` | `No podés reservar en el pasado` | `BOOKING_IN_PAST` | startTime < now | Toast warning |
| `400` | `La hora de fin debe ser mayor a la de inicio` | `END_BEFORE_START` | endTime ≤ startTime | Toast error |
| `400` | `Esta cancha no está recibiendo reservas` | `COURT_INACTIVE` | La cancha fue desactivada | Modal informativo + redirect |
| `400` | `El complejo está cerrado ese día` | `COMPLEX_CLOSED` | No hay schedule para ese dayOfWeek | Toast info + deshabilitar fecha |
| `400` | `El complejo abre de HH:MM a HH:MM` | `OUT_OF_SCHEDULE` | Horario fuera del rango del complejo | Toast warning con horario correcto |
| `400` | `La duración (X min) debe ser múltiplo de 30 minutos` | `INVALID_DURATION_STEP` | Duración no múltiplo de 30 | Toast error |
| `400` | `El turno mínimo es de X minutos` | `DURATION_TOO_SHORT` | Duración < minBookingDuration | Toast warning |
| `400` | `El turno máximo es de X minutos` | `DURATION_TOO_LONG` | Duración > maxBookingDuration | Toast warning |
| `400` | `El complejo no está eliminado` | `NOT_DELETED` | Intentar restaurar un complejo activo | Toast info |
| `400` | `Fecha inválida` | `INVALID_DATE` | Formato de date query inválido | Toast error |
| `401` | `No Autorizado` | `UNAUTHORIZED` | Sin header Authorization | Redirect a /login |
| `403` | `Contraseña incorrecta` | `WRONG_PASSWORD` | Credenciales de login inválidas | Inline error en campo password |
| `403` | `Debe tener una cuenta de tipo Dueño...` | `NOT_OWNER` | USER intenta crear complejo | Modal "Convertirse en Owner" |
| `403` | `Acción no válida. No eres dueño de este complejo.` | `NOT_COMPLEX_OWNER` | Intentar editar complejo ajeno | Toast error + redirect |
| `403` | `No tenés permiso sobre este complejo` | `NO_COMPLEX_PERMISSION` | Court: no es owner del complejo asociado | Toast error |
| `403` | `Acción no autorizada. Solo Administradores` | `ADMIN_ONLY` | Acción restringida a ADMIN | Toast error |
| `404` | `El usuario no existe` | `USER_NOT_FOUND` | Email de login no registrado | Inline error "Email no registrado" |
| `404` | `Complejo no encontrado` | `COMPLEX_NOT_FOUND` | ID de complejo inválido | Redirect a listado |
| `404` | `No existe un cancha con este ID` | `COURT_NOT_FOUND` | Cancha inexistente o inactiva | Redirect a listado |
| `404` | `Cancha inexistente.` | `COURT_NOT_FOUND` | Cancha no encontrada (no eliminada) | Toast error |
| `404` | `No se encontraron canchas activas` | `NO_COURTS` | Listado vacío | Mostrar empty state |
| `404` | `No se encontraron canchas en papelera` | `NO_DELETED_COURTS` | Papelera vacía | Mostrar empty state |
| `404` | `Cancha no encontrada` | `COURT_NOT_FOUND` | Cancha no encontrada para booking | Toast error |
| `404` | `No se encontró la cancha en la papelera` | `DELETED_COURT_NOT_FOUND` | Court para restore/hardDelete no existe | Toast error |
| `409` | `El email ya está en uso` | `EMAIL_IN_USE` | Registro con email duplicado | Inline error en campo email |
| `409` | `El nombre de usuario ya está registrado` | `USERNAME_IN_USE` | Registro con username duplicado | Inline error en campo username |
| `409` | `La cancha ya fue reservada por otro usuario...` | `COLLISION_DETECTED` | Colisión de horario en booking | Modal de conflicto + recargar grilla |
| `500` | `Token No Válido` | `INVALID_TOKEN` | JWT corrupto o expirado | Limpiar storage + redirect a /login |
| `500` | `Error de configuración del complejo` | `COMPLEX_CONFIG_ERROR` | Config del complejo faltante en DB | Toast error genérico |
| `500` | `Internal Server Error` | `INTERNAL_ERROR` | Error no controlado | Toast genérico "Ocurrió un error" |

### 4.2 Errores de Validación (express-validator)

Cuando express-validator detecta errores, el middleware `handleInputErrors` devuelve:

```json
// HTTP 400
{
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "El Nombre es obligatorio",
      "path": "name",
      "location": "body"
    },
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Email no válido.",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Estrategia de parseo para el frontend:**

```typescript
// Distinguir entre error de validación y error de negocio
if (error.error?.errors && Array.isArray(error.error.errors)) {
  // express-validator: mapear cada error al campo correspondiente
  error.error.errors.forEach(err => {
    form.get(err.path)?.setErrors({ serverError: err.msg });
  });
} else if (error.error?.message) {
  // AppError: mostrar toast con el mensaje
  this.toastService.error(error.error.message);
} else if (error.error?.error) {
  // Middleware authenticate: { error: "No Autorizado" }
  this.toastService.error(error.error.error);
}
```

---

## 5. Supuestos y Convenciones

### 5.1 Formato de Fechas

| Contexto | Formato | Ejemplo |
|---|---|---|
| Timestamps de modelos (`createdAt`, `updatedAt`, `deletedAt`) | ISO 8601 UTC (Prisma default) | `2026-06-14T19:00:00.000Z` |
| `startTime` / `endTime` en Booking (body del POST) | ISO 8601 UTC con `Z` obligatorio | `2026-06-20T18:00:00Z` |
| `date` en Availability (query param) | `YYYY-MM-DD` (fecha local del complejo) | `2026-06-20` |
| `startTime` / `endTime` en ComplexSchedule | `HH:MM` (hora local) | `08:00`, `23:00` |

### 5.2 Paginación

**No definida en el backend actual.** Todos los endpoints de listado devuelven todos los registros sin limit/offset/cursor.

### 5.3 Filtros / Búsqueda

**No definidos en el backend actual.** Existe un `CourtFilters` interface en `court.types.ts` (con `sport`, `isIndoor`, `latitude`, `longitude`, `radius`) pero no está implementado en ningún endpoint.

### 5.4 Naming del response body

No hay un contrato uniforme. Patrones encontrados:

| Patrón | Ejemplo de endpoint |
|---|---|
| `{ message, data }` | `POST /auth/register`, `POST /bookings`, `POST /courts` |
| `{ message, newComplex }` | `POST /complexes` |
| `{ message, complex }` | `PATCH /complexes/:id/restore`, `PATCH /complexes/:id/status` |
| `{ message, court }` | `PATCH /courts/:id/restore` |
| `{ data: [...] }` | `GET /courts`, `GET /courts/my-courts`, `GET /complexes/:id/courts` |
| Array directo | `GET /complexes`, `GET /bookings/availability` |
| Objeto directo | `GET /auth/user`, `PATCH /complexes/:id` |
| String plano | `POST /auth/login` |

### 5.5 Soft Delete

Patrón consistente: campo `deletedAt` (nullable DateTime). Un registro está "activo" cuando `deletedAt === null`.

Para Courts, el soft-delete adicionalmente setea `isActive = false`.

### 5.6 Roles del Sistema

| Rol | Capacidades |
|---|---|
| `USER` | Registrarse, hacer reservas, ver complejos públicos |
| `OWNER` | Todo lo de USER + crear/administrar complejos y canchas propias |
| `ADMIN` | Aprobar/rechazar complejos + editar complejos de otros owners |

> El rol `ADMIN` no se puede asignar via API. No existe endpoint para crear admins.

### 5.7 Timezone

La timezone del complejo (`America/Argentina/Buenos_Aires`) está **hardcodeada** en `booking.service.ts`. No es configurable por complejo.

### 5.8 Duración de Slots de Availability

Los slots del endpoint `GET /bookings/availability` son siempre de **60 minutos** fijos (hardcodeado como `const duration = 60` en el servicio). No depende de `court.duration`.

### 5.9 Username

El `username` enviado en el registro es procesado por `slugify` (lowercase, sin caracteres especiales, sin espacios). El frontend debería mostrar un preview del username procesado.

### 5.10 Precio

`price` en `Court` y `totalPrice` en `Booking` son `Decimal(10,2)` en PostgreSQL. Prisma los serializa como **string** en JSON (ej: `"15000.00"`). El frontend debe parsearlos con `parseFloat()` o una pipe de formato numérico.

---

## 6. Observaciones de Arquitectura

Las siguientes son inconsistencias y discrepancias detectadas entre `schema.prisma`, rutas, controladores, servicios, repositorios y validadores.

### 6.1 — `hardDelete` definido en controller pero sin ruta (Complexes)

El método `hardDelete` existe en `ComplexController` y `ComplexService`, pero **no tiene ninguna ruta asignada** en `complex.routes.ts`. Es código muerto/inaccesible.

> **Archivos:** `complex.controller.ts` L85-94, `complex.service.ts` L59-69  
> **Impacto:** El frontend no puede invocar hard-delete de complejos.

---

### 6.2 — Campos `openTime`/`closeTime` validados pero no existen en el schema

El validador `validateUpdateComplex` valida campos `openTime` y `closeTime`, pero **estos campos no existen en el modelo `Complex`** de `schema.prisma`. El modelo usa `ComplexSchedule` (relación separada) para los horarios.

> **Archivos:** `complex.validator.ts` L74-85 vs `schema.prisma` L24-48  
> **Impacto:** Si el frontend envía `openTime`/`closeTime` en un update, Prisma los ignorará silenciosamente.

---

### 6.3 — El `status` del complejo es `String` libre, no un enum

En `schema.prisma`, `Complex.status` es `String @default("PENDING")`, no un enum de Prisma. Los valores `PENDING`, `APPROVED`, `REJECTED` solo se validan en `validateUpdateComplexStatus` (body validator) y el filtro `findAllActive` busca `status: 'APPROVED'` como string literal.

> **Impacto:** No hay protección a nivel de base de datos contra valores inválidos.

---

### 6.4 — El `role` del usuario es `String` libre, no un enum

Similar al punto anterior: `User.role` es `String @default("USER")`. Los valores `USER`, `OWNER`, `ADMIN` se validan parcialmente (el register validator permite `USER` | `OWNER`, pero `ADMIN` se verifica en el servicio de complejos sin haber sido creado via API).

> **Impacto:** Posible inconsistencia si se manipula la DB directamente.

---

### 6.5 — Login devuelve texto plano, no JSON

`auth.controller.ts` L28: `res.send(token)` devuelve el JWT como string plano, mientras que todos los demás endpoints devuelven JSON. Esto requiere un tratamiento especial en el frontend (`responseType: 'text'`).

---

### 6.6 — Token expirado devuelve HTTP 500 en lugar de 401

En `middleware/authenticate.ts` L55-57, cuando `jwt.verify()` lanza (por token expirado, corrupto, etc.), el catch devuelve `500` con `{ error: 'Token No Válido' }`. Semánticamente debería ser `401 Unauthorized`.

> **Impacto:** El frontend debe tratar `500 + 'Token No Válido'` como un caso de sesión expirada.

---

### 6.7 — `validateId` no ejecuta `handleInputErrors` en algunos endpoints

El middleware `validateId` (en `validators/common.ts`) solo llama a `param('id').isInt()` sin encadenar `handleInputErrors`. En las rutas de courts como `PATCH /:id/restore`, `DELETE /:id/force`, etc., `validateId` se pasa como middleware pero los errores de validación del param no se manejan explícitamente (el error llegaría al error handler global).

En `validateRestoreComplex`, se usa `validateId` sin `handleInputErrors` tampoco.

> **Impacto bajo:** Prisma probablemente lance su propio error si recibe un ID no numérico.

---

### 6.8 — Court restore setea `isActive: false`

En `court.repository.ts` L97-105, al restaurar una cancha, se setea `deletedAt: null` pero `isActive: false`. Esto es intencional (la cancha restaurada queda desactivada para que el owner la revise), pero puede confundir si no se documenta en la UI.

> **Impacto:** Mostrar un aviso al owner de que la cancha restaurada necesita activación manual.

---

### 6.9 — Inconsistencia en formatos de respuesta

No hay un envelope/wrapper estándar. Algunos endpoints devuelven `{ data: ... }`, otros `{ message, data }`, otros `{ message, newComplex }`, otros el array/objeto directamente. Ver §5.4 para el mapeo completo.

> **Impacto:** El frontend necesita manejar múltiples formatos de respuesta según el endpoint.

---

### 6.10 — `confirmed` existe en el modelo User pero no se usa

El campo `User.confirmed` (`Boolean @default(false)`) existe en `schema.prisma` pero no se verifica en ningún flujo (login, acceso, etc.). No hay endpoint de confirmación de cuenta.

> **Impacto:** Campo sin efecto funcional en el backend actual.

---

### 6.11 — Availability endpoint requiere autenticación

`GET /bookings/availability` requiere `authenticate`, lo cual impide que usuarios no logueados vean la disponibilidad de canchas. Esto puede ser una decisión de negocio deliberada o un oversight.

---

### 6.12 — `CourtFilters` no implementado

La interface `CourtFilters` define propiedades de filtrado (`sport`, `isIndoor`, `latitude`, `longitude`, `radius`) pero ningún endpoint las utiliza.

> **Archivos:** `court.types.ts` L8-15  
> **Impacto:** No definido en el backend actual.

---

### 6.13 — `CreateBookingDTO` usa `startTime: DateTime` pero el frontend envía strings

El DTO en `booking.types.ts` es `Pick<Booking, "courtId" | "startTime" | "endTime">`, donde `startTime`/`endTime` son `DateTime` de Prisma. Pero el validator espera strings ISO 8601 y el servicio hace `new Date(data.startTime)`. No hay conflicto funcional, pero el tipado es engañoso.

---

> **Última actualización:** 2026-06-14  
> **Generado automáticamente** analizando el código fuente del proyecto `sport-manager`.
