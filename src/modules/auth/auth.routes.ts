import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { 
    validateBecomeOwner, 
    validateLogin, 
    validateRegister, 
    validateEmail, 
    validateToken, 
    validateResetPassword, 
    validate2FACode 
} from "./auth.validator"
import { authController } from "./auth.dependencies"

const router = Router()

router.post('/register', validateRegister, authController.createAccount)
router.post('/login', validateLogin, authController.login)

router.post('/become-owner', authenticate, validateBecomeOwner, authController.becomeOwner)

router.post('/send-verification', validateEmail, authController.sendVerification)
router.post('/verify-email', validateToken, authController.verifyEmail)

router.post('/forgot-password', validateEmail, authController.forgotPassword)
router.post('/reset-password', validateResetPassword, authController.resetPassword)

router.get('/2fa/generate', authenticate, authController.generate2FA)
router.post('/2fa/enable', authenticate, validate2FACode, authController.enable2FA)
// Assumes tempToken is sent via Authorization header
router.post('/2fa/verify', authenticate, validate2FACode, authController.verify2FA)

export default router
