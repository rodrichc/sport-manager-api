import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { validateCreateBooking, validateGetAvailability } from "./booking.validator"
import { bookingController } from "./booking.dependencies"

const router = Router()

router.post('/', 
    authenticate,
    validateCreateBooking, 
    bookingController.create
)

router.get('/availability',
    authenticate,
    validateGetAvailability,
    bookingController.getAvailability
)

export default router