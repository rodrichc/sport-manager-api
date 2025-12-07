import { Router } from "express"
import authRoutes from "./routes/authRoutes"
import complexRoutes from "./routes/complexRoutes"
import courtRoutes from "./modules/courts/court.routes"

const router = Router()

//Routing
router.use('/auth', authRoutes)
router.use('/complexes', complexRoutes)
router.use('/courts', complexRoutes)

export default router
