import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { parsePagination } from "../../middleware/pagination"
import { validateCreateBooking, validateGetAvailability } from "./booking.validator"
import { bookingController } from "./booking.dependencies"

const router = Router()

router.post('/', 
    authenticate,
    validateCreateBooking, 
    bookingController.create
)

router.get('/my-bookings',
    authenticate,
    parsePagination,
    bookingController.getMyBookings
)

router.get('/availability',
    authenticate,
    validateGetAvailability,
    bookingController.getAvailability
)

export default router
