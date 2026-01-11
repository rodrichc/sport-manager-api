import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { validateBecomeOwner, validateLogin, validateRegister } from "./auth.validator"
import { authController } from "./auth.dependencies"


const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crea una nueva cuenta de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "test"
 *               email:
 *                 type: string
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               username:
 *                 type: string
 *                 example: "testuser"
 *               phoneNumber:
 *                 type: string
 *                 example: "3511234567"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos inválidos o faltantes
 *       409:
 *         description: El email o username ya está registrado
 */
router.post('/register', 
    validateRegister,
    authController.createAccount)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: test@test.com
 *               password:
 *                 type: string
 *                 default: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */

router.post('/login', 
    validateLogin,
    authController.login)

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil recuperado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                   example: "USER"
 *       401:
 *         description: No autorizado (Falta token o es inválido)
 */
router.get('/user', authenticate, authController.getUser)

/**
 * @swagger
 * /auth/become-owner:
 *   post:
 *     summary: Actualizar rol a PROPIETARIO (Owner)
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
 *                 description: Teléfono obligatorio para ser dueño
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
 *                 user:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "OWNER"
 *       400:
 *         description: Falta el número de teléfono o ya es dueño
 */
router.post('/become-owner', 
    authenticate,
    validateBecomeOwner,
    authController.becomeOwner
)
    
export default router
