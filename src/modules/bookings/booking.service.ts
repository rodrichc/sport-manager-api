import { differenceInMinutes, startOfMinute, isValid, addDays, isBefore, addMinutes, parse } from "date-fns" 
import { toZonedTime, format as formatTz, fromZonedTime } from 'date-fns-tz';
import { AppError } from "../../utils/appError"
import { BookingRepository } from "./booking.repository"
import { CreateBookingDTO } from "./booking.types"
import { UserId } from "../../types"

export class BookingService {
    
    constructor(private readonly bookingRepository: BookingRepository) {}

    async create(userId: UserId, data: CreateBookingDTO) {
        const COMPLEX_TIMEZONE = 'America/Argentina/Buenos_Aires'

        const start = startOfMinute(new Date(data.startTime))
        const end = startOfMinute(new Date(data.endTime))
        const now = new Date(); 

        // ---------------------------------------------------------
        //           BASIC VALIDATIONS
        // ---------------------------------------------------------
        if (!isValid(start) || !isValid(end)) {
            throw new AppError("Formato de fecha inválido", 400)
        }

        if (start < now) {
            throw new AppError("No podés reservar en el pasado", 400)
        }

        if (start >= end) {
            throw new AppError("La hora de fin debe ser mayor a la de inicio", 400)
        }

        // ---------------------------------------------------------
        //              VALIDATE DB DATA
        // ---------------------------------------------------------
        const court = await this.bookingRepository.getCourtPrice(data.courtId)
        if (!court) throw new AppError("Cancha no encontrada", 404)
        if (!court.isActive) throw new AppError("Esta cancha no está recibiendo reservas", 400)

        const complexConfig = await this.bookingRepository.getComplexConfig(court.complexId)
        if (!complexConfig) throw new AppError("Error de configuración del complejo", 500)


        const startInComplexTime = toZonedTime(start, COMPLEX_TIMEZONE)
        const endInComplexTime   = toZonedTime(end, COMPLEX_TIMEZONE)
        const dayOfWeek = startInComplexTime.getDay()


        const schedule = await this.bookingRepository.getComplexSchedule(court.complexId, dayOfWeek)
        if (!schedule) {
            throw new AppError("El complejo está cerrado ese día", 400)
        }

        // ---------------------------------------------------------
        //              SCHEDULES VALIDATION
        // ---------------------------------------------------------
        
        const bookingStartStr = formatTz(startInComplexTime, 'HH:mm')
        const bookingEndStr   = formatTz(endInComplexTime, 'HH:mm')

        const isOpen = (bookStart: string, bookEnd: string, open: string, close: string) => {
            if (open < close) {
                return bookStart >= open && bookEnd <= close;
            }
            
            return (bookStart >= open) || (bookEnd <= close && bookEnd !== "00:00")
        }

        if (!isOpen(bookingStartStr, bookingEndStr, schedule.startTime, schedule.endTime)) {
            throw new AppError(`El complejo abre de ${schedule.startTime} a ${schedule.endTime}`, 400)
        }

        // ---------------------------------------------------------
        //              DURATION VALIDATION
        // ---------------------------------------------------------
        const duration = differenceInMinutes(end, start);

        if (duration % 30 !== 0) {
            throw new AppError(`La duración (${duration} min) debe ser múltiplo de 30 minutos`, 400)
        }

        if (duration < complexConfig.minBookingDuration) {
            throw new AppError(`El turno mínimo es de ${complexConfig.minBookingDuration} minutos`, 400)
        }
        
        if (duration > complexConfig.maxBookingDuration) {
            throw new AppError(`El turno máximo es de ${complexConfig.maxBookingDuration} minutos`, 400)
        }

        // ---------------------------------------------------------
        //                  PRICE AND CREATE
        // ---------------------------------------------------------
        
        const totalPrice = Math.round((Number(court.price) / 60) * duration)

        try {
            const newBooking = await this.bookingRepository.create({
                courtId: data.courtId,
                userId,
                startTime: start, 
                endTime: end,
                totalPrice
            })
            
            return newBooking;

        } catch (error: any) {
            if (error.message === "COLLISION_DETECTED") {
                throw new AppError("La cancha ya fue reservada por otro usuario dentro de ese horario", 409)
            }
            throw error
        }
    }



    async getAvailability(courtId: number, dateStr: string) {
        const COMPLEX_TIMEZONE = 'America/Argentina/Buenos_Aires'

        const court = await this.bookingRepository.getCourtPrice(courtId)

        const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())

        if (!isValid(parsedDate)) {
            throw new AppError("Fecha inválida", 400); 
        }

        const dateLocal = fromZonedTime(parsedDate, COMPLEX_TIMEZONE)
        const dayOfWeek = dateLocal.getDay()

        const schedule = await this.bookingRepository.getComplexSchedule(court.complexId, dayOfWeek)
        
        if (!schedule) return []


        const parseTime = (timeStr: string, baseDate: Date) => {
            const [hours, minutes] = timeStr.split(':').map(Number)
            const result = new Date(baseDate)
            result.setHours(hours, minutes, 0, 0)
            return result
        }

        let openTime = parseTime(schedule.startTime, dateLocal)
        let closeTime = parseTime(schedule.endTime, dateLocal)

        if (closeTime < openTime) {
            closeTime = addDays(closeTime, 1)
        }

        const duration = 60
        
        const slots = []
        let currentTime = openTime

        while (isBefore(currentTime, closeTime)) { 
            const slotStartUTC = fromZonedTime(currentTime, COMPLEX_TIMEZONE)
            const slotEndUTC = fromZonedTime(addMinutes(currentTime, duration), COMPLEX_TIMEZONE)
            
            const closeTimeUTC = fromZonedTime(closeTime, COMPLEX_TIMEZONE)
            
            if (slotEndUTC <= closeTimeUTC) {
                slots.push({
                    start: slotStartUTC,
                    end: slotEndUTC,
                    available: true 
                })
            }
            
            currentTime = addMinutes(currentTime, duration)
        }

        const bookings = await this.bookingRepository.findBookingsInRange(
            courtId, 
            fromZonedTime(openTime, COMPLEX_TIMEZONE), 
            fromZonedTime(closeTime, COMPLEX_TIMEZONE)
        );

        
        const finalSlots = slots.map(slot => {
            const isOccupied = bookings.some(booking => {
                return (slot.start < booking.endTime) && (slot.end > booking.startTime)
            })

            return {
                ...slot,
                available: !isOccupied,
                status: isOccupied ? 'BOOKED' : 'AVAILABLE'
            }
        })

        return finalSlots
    }
}