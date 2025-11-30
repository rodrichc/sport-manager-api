# 🏟️ SportManager API (SaaS)

Plataforma de gestión integral para complejos deportivos (Pádel, Fútbol, Tenis, etc.).
API RESTful construida con arquitectura escalable, tipado estático y seguridad industrial.

---

## 🛠️ Tech Stack (Las Herramientas)

* **Runtime:** Node.js
* **Framework:** Express.js
* **Lenguaje:** TypeScript
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Seguridad:** JWT (Auth) & Bcrypt (Hash)
* **Validaciones:** Express-Validator
* **Documentación:** Postman / Swagger (Próximamente)

---

## 🧠 Modelo de Negocio (Arquitectura)

El sistema se basa en una jerarquía de **SaaS (Software as a Service)** diseñada para escalar:

1.  **USER (Global):**
    * **Jugador (`USER`):** Busca canchas, reserva turnos y ve su historial.
    * **Dueño (`OWNER`):** Administra sus complejos, canchas y ganancias.

2.  **COMPLEX (La Sucursal):**
    * Pertenece a un Dueño (Owner).
    * Gestiona ubicación, horarios de apertura/cierre y servicios (WiFi, Bar, Estacionamiento).

3.  **COURT (El Recurso):**
    * Pertenece a un Complejo (Complex).
    * Define atributos específicos: Deporte (Pádel, Fútbol), Superficie, Techada/Descubierta y Precio.

4.  **BOOKING (La Transacción):**
    * Reserva atómica de un Usuario en una Cancha en un horario específico.

---

## 🚧 ROADMAP & PROGRESO

### 📍 FASE 1: Cimientos & Seguridad (Estado Actual)
- [x] Configuración inicial (TS, Express, CORS).
- [x] Conexión a Base de Datos (Prisma + Neon).
- [x] **Modelo User:** Definición con Roles (`USER`/`OWNER`).
- [x] **Registro:** Hash de password, validación de duplicados, Slug para username.
- [x] **Middleware Auth:** Validación del Bearer Token y protección de rutas.
- [x] **Login:** Generación de JWT y autenticación de usuarios.
- [x] **Get User:** Endpoint para obtener datos del perfil (Ruta Protegida).

### 📍 FASE 2: Estructura del Negocio (Próximos Pasos)
- [ ] **Modelado DB:** Crear tablas `Complex` y `Court` en Prisma.
- [ ] **CRUD Complejos:**
    - [ ] Endpoint `POST /complexes` (Crear sucursal - Solo Owner).
    - [ ] Endpoint `GET /complexes` (Listar complejos propios).
- [ ] **CRUD Canchas:**
    - [ ] Endpoint `POST /complexes/:id/courts` (Agregar cancha a un complejo).
    - [ ] Validaciones de deporte y precio.

### 📍 FASE 3: El Core (Turnos y Disponibilidad)
- [ ] **Modelado DB:** Crear tabla `Booking`.
- [ ] **Lógica de Disponibilidad:** Algoritmo para evitar solapamiento de horarios.
- [ ] **Endpoint Reservar:** `POST /bookings`.

---

## 🚀 Cómo levantar el proyecto

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno (`.env`):**
    Crea un archivo `.env` en la raíz y completa:
    ```env
    PORT=3000
    DATABASE_URL="tu_url_de_postgress_aqui"
    JWT_SECRET="tu_palabra_secreta"
    FRONTEND_URL="http://localhost:5173"
    ```

3.  **Correr en modo desarrollo:**
    ```bash
    npm run dev
    ```
