import { Router } from "express"
import authRoutes from "./modules/auth/auth.routes"
import complexRoutes from "./modules/complexes/complex.routes"
import courtRoutes from "./modules/courts/court.routes"
import bookingRoutes from "./modules/bookings/booking.routes"
import usersRoutes from "./modules/users/users.routes"
import paymentRoutes from "./modules/payments/payment.routes"
import uploadRoutes from "./modules/upload/upload.routes"

const router = Router()

//Routing
router.use('/auth', authRoutes)
router.use('/complexes', complexRoutes)
router.use('/courts', courtRoutes)
router.use('/bookings', bookingRoutes)
router.use('/users', usersRoutes)
router.use('/payments', paymentRoutes)
router.use('/upload', uploadRoutes)

export default router
