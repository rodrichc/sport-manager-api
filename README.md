# 🏟️ SportManager API (SaaS)

> **🚧 ESTADO DEL PROYECTO: EN DESARROLLO ACTIVO (MVP)**
> Código en construcción.
> * **Foco actual:** Implementación del módulo de Canchas (Filtros y Geolocalización).
> * **Próximos pasos:** Lógica de reservas y disponibilidad horaria.

---

## 📖 Descripción

**SportManager** es una plataforma SaaS (Software as a Service) diseñada para la gestión integral de complejos deportivos. Permite a los dueños administrar múltiples sucursales, canchas y servicios, y a los jugadores buscar y reservar turnos en tiempo real.

El proyecto está construido con un enfoque en **Arquitectura Limpia (Clean Architecture)**, escalabilidad y seguridad.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Lenguaje:** TypeScript
* **Framework:** Express.js
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Arquitectura:** Layered Pattern (Controller - Service - Repository)
* **Seguridad:** JWT (Auth), Bcrypt (Hashing), CORS
* **Validaciones:** Express-Validator

---

## 🏗️ Arquitectura del Proyecto

El sistema sigue una arquitectura modular en capas para asegurar la separación de responsabilidades:

```text
src/
├── config/           # Configuración de DB y entorno
├── middlewares/      # Auth, Error Handling, Validations
├── modules/          # Módulos de negocio
│   ├── auth/         # Lógica de registro y login
│   ├── complex/      # Gestión de complejos/sucursales
│   └── courts/       # Gestión de canchas y filtros
├── types/            # Definiciones de tipos globales
└── utils/            # Helpers y utilidades
```

---

### 🌟 Features Técnicas Destacadas
* **Clean Architecture:** Lógica de negocio aislada en Servicios y acceso a datos en Repositorios.
* **Soft Delete:** Implementación de borrado lógico para preservar integridad de datos.
* **Type Safety:** Uso de Interfaces y DTOs para evitar errores en tiempo de ejecución.
* **Advanced Filtering:** Endpoints con capacidad de filtrado dinámico (por deporte, techado/descubierto).

---

## 🧠 Modelo de Negocio

La lógica se basa en una jerarquía relacional:

1.  **OWNER (Dueño):** Crea y administra sus complejos.
2.  **COMPLEX (Sucursal):** Posee ubicación y servicios.
3.  **COURT (Cancha):** El recurso reservable con atributos específicos (Superficie, Precio).
4.  **BOOKING (Reserva):** La transacción final que bloquea disponibilidad.

---

## 🚀 Estado del Proyecto y Próximos Pasos

Actualmente el sistema cuenta con los módulos de **Autenticación (Auth)**, **Usuarios** y **Gestión de Complejos** (Sucursales) totalmente funcionales.

El desarrollo se encuentra **activo hoy mismo** en la finalización del **Módulo de Canchas**, trabajando específicamente en:
1.  Lógica de filtrado avanzado (por deporte, superficie, techado).
2.  Algoritmo de búsqueda por Geolocalización (Canchas cercanas).
3.  Próximamente: Implementación del motor de reservas (Bookings).

---

## 🚀 Instalación y Uso Local

1.  **Clonar el repositorio:**
    ```bash
      git clone https://github.com/rodrichc/sport-manager-api.git
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` basado en el siguiente ejemplo:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://usuario:password@host:port/db"
    JWT_SECRET="frase_secreta_super_segura"
    ```

4.  **Base de Datos:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Iniciar servidor:**
    ```bash
    npm run dev:api
    ```

---

## 🧪 Testing con Postman

En la carpeta `/postman` encontrarás la colección completa para importar.

> **💡 Tip:** El endpoint de Login guarda automáticamente el token en las variables de entorno de Postman. Logueate y probá los endpoints.
