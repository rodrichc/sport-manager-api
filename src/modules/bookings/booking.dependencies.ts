import { BookingRepository } from "./booking.repository"
import { BookingService } from "./booking.service"
import { BookingController } from "./booking.controller"

const bookingRepository = new BookingRepository()
const bookingService = new BookingService(bookingRepository)
const bookingController = new BookingController(bookingService)

export { bookingController }