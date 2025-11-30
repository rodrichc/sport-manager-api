import { Router } from "express"
import { body } from "express-validator"
import { createAccount, login } from './handlers'
import { handleInputErrors } from "./middleware/validation"
import { authenticate } from "./middleware/authenticate"

const router = Router()

//Routing
router.post('/auth/register', 
    body('name')
        .notEmpty()
        .withMessage('El Nombre es obligatorio.'),
    body('email')
        .isEmail()
        .withMessage('Email no válido.'),
    body('username')
        .notEmpty()
        .withMessage('El Nombre de Usuario es obligatorio.'),
    body('password')
        .isLength({min: 8})
        .withMessage('La Contraseña debe ser de al menos de 8 caracteres.'),
    body('role')
        .optional()
        .isIn(['USER', 'OWNER'])
        .withMessage('Rol inválido'),
    handleInputErrors, 
    createAccount)


router.post('/auth/login', 
    body('email')
        .isEmail()
        .withMessage('Email no válido.'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    handleInputErrors, 
    login)


router.get('/user', authenticate, (req, res) => {
    res.json(req.user) 
})
    
export default router
