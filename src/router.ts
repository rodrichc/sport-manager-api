import { Router } from "express"
import authRoutes from "./modules/auth/auth.routes"
import complexRoutes from "./modules/complexes/complex.routes"
import courtRoutes from "./modules/courts/court.routes"

const router = Router()

//Routing
router.use('/auth', authRoutes)
router.use('/complexes', complexRoutes)
router.use('/courts', courtRoutes)

export default router
