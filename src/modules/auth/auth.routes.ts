import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { validateBecomeOwner, validateLogin, validateRegister } from "./auth.validator"
import { authController } from "./auth.dependencies"


const router = Router()


router.post('/register', 
    validateRegister,
    authController.createAccount)

router.post('/login', 
    validateLogin,
    authController.login)

router.get('/user', authenticate, authController.getUser)

router.post('/become-owner', 
    authenticate,
    validateBecomeOwner,
    authController.becomeOwner
)
    
export default router
