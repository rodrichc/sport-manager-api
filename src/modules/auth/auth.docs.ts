/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAccountDTO:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - username
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@email.com"
 *         username:
 *           type: string
 *           example: "juanperez"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [USER, OWNER]
 *           default: USER
 *           description: Si el rol es OWNER, phoneNumber es obligatorio
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: Obligatorio cuando role es OWNER
 *           example: "3511234567"
 *
 *     UserSafe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@email.com"
 *         username:
 *           type: string
 *           example: "juanperez"
 *         role:
 *           type: string
 *           enum: [USER, OWNER, ADMIN]
 *           example: "USER"
 *
 *     LoginDTO:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@email.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: field
 *               msg:
 *                 type: string
 *                 example: "El Nombre es obligatorio"
 *               path:
 *                 type: string
 *                 example: name
 *               location:
 *                 type: string
 *                 example: body
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crear una nueva cuenta de usuario
 *     description: >
 *       Registra un usuario con rol USER u OWNER.
 *       Si el rol es OWNER, el campo phoneNumber es obligatorio.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountDTO'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/UserSafe'
 *       400:
 *         description: Datos inválidos o faltantes (ej. OWNER sin phoneNumber)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: El email o username ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El email ya está en uso"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: >
 *       Autentica al usuario y retorna un token JWT como string plano.
 *       El token tiene una expiración de 180 días.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       200:
 *         description: Login exitoso — retorna token JWT como string
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       403:
 *         description: Contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña incorrecta"
 *       404:
 *         description: Usuario no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 */

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna los datos del usuario extraídos del token JWT (sin password).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil recuperado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSafe'
 *       401:
 *         description: No autorizado — token faltante o inválido
 */

/**
 * @swagger
 * /auth/become-owner:
 *   post:
 *     summary: Actualizar rol a OWNER (Propietario)
 *     description: >
 *       Convierte al usuario autenticado en dueño de complejos.
 *       Requiere un número de teléfono de contacto.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Teléfono de contacto obligatorio para ser dueño
 *                 example: "35111223344"
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Felicitaciones, ahora podes administrar tus complejos deportivos."
 *       400:
 *         description: Ya es dueño o falta phoneNumber
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ya sos dueño"
 *       401:
 *         description: No autorizado — token faltante o inválido
 */