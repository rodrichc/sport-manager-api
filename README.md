# 🏟️ SportManager API (SaaS)

> MVP funcional en desarrollo activo — core features implementadas. * **Próximos pasos:** Testing y Swagger.

---

## 📖 Descripción

**SportManager** es una API REST para la gestión de complejos deportivos. Permite a los dueños administrar sucursales y canchas, y a los usuarios consultar disponibilidad y gestionar reservas de forma centralizada.

El objetivo del proyecto es resolver la organización operativa de complejos deportivos a través de una plataforma simple, escalable y segura.

---

## 🌟 Funcionalidades

- Registro y autenticación de usuarios (JWT)
- Gestión de complejos y sucursales por dueño
- CRUD de canchas con control de permisos
- Soft delete y restauración de recursos
- Validaciones y manejo centralizado de errores
- Filtros dinámicos por tipo de cancha y atributos 

---

## 🛠️ Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (Auth)
- Express-Validator
- Arquitectura en capas (Controller / Service / Repository)

---

## 🏗️ Arquitectura del Proyecto

El sistema sigue una arquitectura modular en capas para asegurar la separación de responsabilidades:

```text
src/
├── config/           # Configuración de entorno y DB
├── middlewares/      # Auth, validaciones y manejo de errores
├── modules/          # Módulos de negocio (auth, complex, courts)
├── types/            # Tipos y DTOs globales
└── utils/            # Helpers y utilidades
```

---

## 🚀 Estado del Proyecto y Próximos Pasos

1.  Lógica de filtrado avanzado (por deporte, superficie, techado).
2.  Búsqueda por Geolocalización (Canchas cercanas).
3.  Implementación del motor de reservas (Bookings).

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


---


## 👤 Autor

**Rodrigo Chavez**  
Backend Developer (Node.js · TypeScript · Express)  

- GitHub: https://github.com/rodrichc  
- LinkedIn: https://www.linkedin.com/in/rodrigo-chavez2/

