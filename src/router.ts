import { Router } from "express"
import authRoutes from "./routes/authRoutes"
import complexRoutes from "./routes/complexRoutes"

const router = Router()

//Routing
router.use('/auth', authRoutes)
router.use('/complexes', complexRoutes)

export default router
