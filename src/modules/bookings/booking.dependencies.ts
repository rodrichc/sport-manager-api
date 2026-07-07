import { BookingRepository } from "./booking.repository"
import { BookingService } from "./booking.service"
import { BookingController } from "./booking.controller"
import { paymentService } from "../payments/payment.dependencies"

const bookingRepository = new BookingRepository()
const bookingService = new BookingService(bookingRepository, paymentService)
const bookingController = new BookingController(bookingService)

export { bookingController }