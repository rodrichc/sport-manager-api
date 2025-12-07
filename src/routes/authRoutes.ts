import { Router } from "express"
import { becomeOwner, createAccount, getUser, login } from '../handlers/auth'
import { authenticate } from "../middleware/authenticate"
import { validateBecomeOwner, validateLogin, validateRegister } from "../validators/authValidators"

const router = Router()

//Routing
router.post('/register', 
    validateRegister,
    createAccount)

router.post('/login', 
    validateLogin,
    login)

router.get('/user', authenticate, getUser)

router.post('/become-owner', 
    authenticate,
    validateBecomeOwner,
    becomeOwner
)
    
export default router
