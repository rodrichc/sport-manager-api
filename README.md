# 🏟️ SportManager API (SaaS)

> **Deploy Activo:** [Ver Documentación Swagger UI](https://sport-manager-api-c9y9.onrender.com/api-docs) 

---

## 📖 Descripción

**SportManager** es una API REST diseñada con principios de **Clean Architecture** para la gestión operativa y comercial de complejos deportivos. 

Permite a los dueños administrar sus sucursales, canchas y cobros, mientras que ofrece a los usuarios un sistema fluido y seguro para consultar disponibilidad y gestionar reservas en tiempo real.

---

## 🌟 Funcionalidades Destacadas

- **Autenticación de Alta Seguridad:** JWT con soporte nativo para **Autenticación en Dos Pasos (2FA)** mediante TOTP.
- **Pasarela de Pagos (MercadoPago):** Integración completa para cobro de reservas con webhooks **Zero-Trust** (idempotencia y validación de firmas contra la API oficial).
- **Gestor de Reservas de Alto Rendimiento:** Algoritmo de detección de colisiones en tiempo real con **Lazy Expiration**, liberando turnos pendientes abandonados sin necesidad de procesos en segundo plano (cronjobs).
- **Gestión Multi-Tenant:** Administración jerárquica de complejos y sucursales aisladas por dueño.
- **Arquitectura Resiliente:** Soft delete global, validaciones estrictas y manejo centralizado de errores.

---

## 🛠️ Tech Stack

El proyecto fue construido bajo estándares modernos, asegurando tipado estricto, escalabilidad y facilidad de despliegue.

- **Core:** Node.js, TypeScript, Express.js
- **Base de Datos:** PostgreSQL, Prisma ORM
- **Infraestructura & Tests:** Docker, Jest (Pruebas de Integración con BD efímera)
- **Seguridad:** JWT, bcrypt, otplib (2FA)
- **Documentación:** Swagger / OpenAPI 3.0

---

## 🏗️ Arquitectura del Proyecto

El sistema está orquestado mediante **Vertical Slices** y N-Tier Architecture, garantizando la inyección de dependencias y el respeto por los principios SOLID:

```text
src/
├── config/           # Setup de DB y servicios externos
├── middleware/       # Autenticación, RBAC y global error handler
├── modules/          # Dominio aislado (auth, bookings, complexes, payments, courts)
│   └── [domain]/
│       ├── *.controller.ts  # Capa HTTP
│       ├── *.service.ts     # Lógica de Negocio
│       ├── *.repository.ts  # Capa de Acceso a Datos
│       └── *.routes.ts      # Enrutamiento
├── utils/            # Helpers, JWT generators
└── server.ts         # Bootstrap de Express
```

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/rodrichc/sport-manager-api.git
   cd sport-manager-api
   ```

2. **Instalar dependencias y levantar infraestructura local:**
   ```bash
   npm install
   # (Opcional) Levantar base de datos local vía Docker para desarrollo
   docker-compose up -d db
   ```

3. **Configurar variables de entorno:**
   Creá un archivo `.env` tomando como base el `.env.example`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://usuario:password@localhost:5432/sport_manager"
   JWT_SECRET="frase_secreta_super_segura"
   MERCADOPAGO_ACCESS_TOKEN="TEST-..."
   ```

4. **Sincronizar Prisma y arrancar:**
   ```bash
   npx prisma db push
   npm run dev:api
   ```

---

## 🧪 Testing y Documentación

- **Automated Tests:** La suite de integración completa (BD efímera + API) se corre mediante:
  ```bash
  npm test
  ```
- **Postman:** La colección completa está en `/postman/sport-manager.postman_collection.json`. El endpoint de Login inyecta el Bearer Token automáticamente en tu entorno.
- **Swagger:** Disponible levantando la API en `/api-docs`.

---

## 👤 Autor

**Rodrigo Chavez**  
Software Engineer (Node.js · TypeScript · Arquitectura de Software)  

- GitHub: [rodrichc](https://github.com/rodrichc)  
- LinkedIn: [Rodrigo Chavez](https://www.linkedin.com/in/rodrigo-chavez2/)
