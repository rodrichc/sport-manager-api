import { AuthController } from "./auth.controller"
import { AuthRepository } from "./auth.repository"
import { AuthService } from "./auth.service"

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const authController = new AuthController(authService)

export { authController }