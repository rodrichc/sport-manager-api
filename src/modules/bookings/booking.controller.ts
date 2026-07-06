import { Request, Response } from "express"
import { BookingService } from "./booking.service"
import { catchAsync } from "../../utils/catchAsync"
import { getPagination } from "../../types/pagination"
import { CreateBookingDTO } from "./booking.types"
import { UserId } from "../../types"

export class BookingController {

    constructor(private readonly bookingService: BookingService) { }

    create = catchAsync(async (req: Request, res: Response) => {
        const userId: UserId = req.user.id
        const bookingData: CreateBookingDTO = req.body

        const newBooking = await this.bookingService.create(userId, bookingData)

        res.status(201).json({
            message: 'Reserva creada con éxito',
            data: newBooking
        })
    })

    getAvailability = catchAsync(async (req: Request, res: Response) => {
        const { courtId, date } = req.query;

        const availability = await this.bookingService.getAvailability(
            Number(courtId),
            String(date)
        );

        return res.status(200).json(availability);
    })

    getMyBookings = catchAsync(async (req: Request, res: Response) => {
        const userId: UserId = req.user.id
        const pagination = getPagination(req)

        const result = pagination
            ? await this.bookingService.getMyBookings(userId, pagination)
            : { data: await this.bookingService.getMyBookings(userId) }

        res.status(200).json(result)
    })
}
