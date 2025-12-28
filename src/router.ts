import { Router } from "express"
import authRoutes from "./modules/auth/auth.routes"
import complexRoutes from "./modules/complexes/complex.routes"
import courtRoutes from "./modules/courts/court.routes"
import bookingRoutes from "./modules/bookings/booking.routes"

const router = Router()

//Routing
router.use('/auth', authRoutes)
router.use('/complexes', complexRoutes)
router.use('/courts', courtRoutes)
router.use('/bookings', bookingRoutes)

export default router
