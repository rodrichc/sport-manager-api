import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { usersController } from "./users.dependencies"
import { validateUpdatePassword, validateUpdateProfile } from "./users.validator"

const router = Router()

router.use(authenticate)

router.get('/me', usersController.getProfile)

router.patch('/profile', validateUpdateProfile, usersController.updateProfile)

router.patch('/password', validateUpdatePassword, usersController.updatePassword)

export default router
