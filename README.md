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
* **Documentación:** Postman Collection

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
- [x] **Modelado DB:** Crear tablas `Complex` y `Court` en Prisma.
- [x] **CRUD Complejos:**
    - [x] Endpoint `POST /complexes` (Crear sucursal - Solo Owner).
    - [x] Endpoint `GET /complexes` (Listar complejos propios).
- [ ] **CRUD Canchas:**
    - [ ] Endpoint `POST /complexes/:id/courts` (Agregar cancha a un complejo).
    - [ ] Validaciones de deporte y precio.

### 📍 FASE 3: El Core (Turnos y Disponibilidad)
- [ ] **Modelado DB:** Crear tabla `Booking`.
- [ ] **Lógica de Disponibilidad:** Algoritmo para evitar solapamiento de horarios.
- [ ] **Endpoint Reservar:** `POST /bookings`.

---

## 🚀 Cómo levantar el proyecto

Seguí estos pasos para levantar el backend en tu máquina local:

### 1. Clonar e Instalar
```bash
git clone [https://github.com/TU_USUARIO/sport-manager-api.git](https://github.com/TU_USUARIO/sport-manager-api.git)
cd sport-manager-api
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

3.  **Base de Datos (Prisma):**
   Una vez configurado el .env, ejecutá las migraciones para crear las tablas en tu base de datos:
    ```bash
    npx prisma migrate dev
    ```

4.  **Correr en modo desarrollo:**
    ```bash
    npm run dev
    ```

## 🧪 Testing con Postman

Este repositorio incluye la colección de Postman lista para usar.

1.  Buscá la carpeta `/postman` en la raíz del proyecto.
2.  Importá el archivo `sport-manager.postman_collection.json` en tu Postman.
3.  Importá el archivo de entorno `sport-manager.postman_environment.json`.
4.  Seleccioná el entorno **"sport-manager"**.
5.  **¡Listo!** Ya podés hacer peticiones al servidor local.

> **Nota:** El endpoint de **Login** guarda automáticamente el Token en la variable de entorno, por lo que no hace falta copiarlo manualmente para usar los endpoints protegidos. ¡Solo logueate y seguí probando!
