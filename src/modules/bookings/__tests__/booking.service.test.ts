import { BookingStatus } from '@prisma/client'
import { BookingService } from '../booking.service'
import { BookingRepository } from '../booking.repository'
import { AppError } from '../../../utils/appError'

// ─────────────────────────────────────────────────────────────
//  Mock del BookingRepository
//  El Service recibe el Repository por DI (constructor),
//  así que lo reemplazamos con un objeto mock completo.
// ─────────────────────────────────────────────────────────────
const mockRepository: jest.Mocked<BookingRepository> = {
    create: jest.fn(),
    getCourtPrice: jest.fn(),
    getComplexConfig: jest.fn(),
    getComplexSchedule: jest.fn(),
    findBookingsInRange: jest.fn(),
} as unknown as jest.Mocked<BookingRepository>

describe('BookingService – create()', () => {

    let service: BookingService
    const FAKE_USER_ID = 10

    // Fechas futuras para un lunes a las 18:00-19:00 (dentro de horario)
    const FUTURE_START = new Date('2027-07-05T21:00:00Z')  // Lun 18:00 AR
    const FUTURE_END = new Date('2027-07-05T22:00:00Z')    // Lun 19:00 AR

    const INPUT_DTO = {
        courtId: 1,
        startTime: FUTURE_START,
        endTime: FUTURE_END,
    }

    const FAKE_COURT = {
        price: 2000,
        complexId: 5,
        isActive: true,
    }

    const FAKE_COMPLEX_CONFIG = {
        minBookingDuration: 60,
        maxBookingDuration: 180,
    }

    const FAKE_SCHEDULE = {
        id: 1,
        complexId: 5,
        dayOfWeek: 1,
        startTime: '12:00',
        endTime: '23:00',
    }

    const FAKE_BOOKING = {
        id: 99,
        courtId: 1,
        userId: FAKE_USER_ID,
        startTime: FUTURE_START,
        endTime: FUTURE_END,
        totalPrice: 2000,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        service = new BookingService(mockRepository)

        // Setup por defecto: todo válido
        mockRepository.getCourtPrice.mockResolvedValue(FAKE_COURT as any)
        mockRepository.getComplexConfig.mockResolvedValue(FAKE_COMPLEX_CONFIG as any)
        mockRepository.getComplexSchedule.mockResolvedValue(FAKE_SCHEDULE as any)
        mockRepository.create.mockResolvedValue(FAKE_BOOKING as any)
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 1: Creación exitosa end-to-end del service
    // ═════════════════════════════════════════════════════════
    it('debe crear la reserva cuando todos los datos son válidos', async () => {
        const result = await service.create(FAKE_USER_ID, INPUT_DTO)

        // Verificar que consultó la cancha
        expect(mockRepository.getCourtPrice).toHaveBeenCalledWith(INPUT_DTO.courtId)

        // Verificar que consultó la config del complejo
        expect(mockRepository.getComplexConfig).toHaveBeenCalledWith(FAKE_COURT.complexId)

        // Verificar que consultó el schedule
        expect(mockRepository.getComplexSchedule).toHaveBeenCalledWith(FAKE_COURT.complexId, 1)

        // Verificar que llamó a create con los datos correctos
        expect(mockRepository.create).toHaveBeenCalledTimes(1)
        expect(mockRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                courtId: INPUT_DTO.courtId,
                userId: FAKE_USER_ID,
            })
        )

        // Verificar que devuelve la reserva
        expect(result).toEqual(FAKE_BOOKING)
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 2: COLLISION_DETECTED → AppError 409
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 409 cuando el repository detecta colisión', async () => {
        mockRepository.create.mockRejectedValue(new Error('COLLISION_DETECTED'))

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toThrow(AppError)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toMatchObject({
                message: 'La cancha ya fue reservada por otro usuario dentro de ese horario',
                statusCode: 409,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 3: Cancha no encontrada → AppError 404
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 404 si la cancha no existe', async () => {
        mockRepository.getCourtPrice.mockResolvedValue(null)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toThrow(AppError)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toMatchObject({
                message: 'Cancha no encontrada',
                statusCode: 404,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 4: Cancha inactiva → AppError 400
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 400 si la cancha no está activa', async () => {
        mockRepository.getCourtPrice.mockResolvedValue({
            ...FAKE_COURT,
            isActive: false,
        } as any)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toMatchObject({
                message: 'Esta cancha no está recibiendo reservas',
                statusCode: 400,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 5: Fecha de inicio en el pasado → AppError 400
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 400 si la fecha de inicio está en el pasado', async () => {
        const pastDTO = {
            courtId: 1,
            startTime: new Date('2020-01-01T18:00:00Z'),
            endTime: new Date('2020-01-01T19:00:00Z'),
        }

        await expect(service.create(FAKE_USER_ID, pastDTO))
            .rejects
            .toMatchObject({
                message: 'No podés reservar en el pasado',
                statusCode: 400,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 6: Duración inválida (45 min) → AppError 400
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 400 si la duración no es múltiplo de 30 min', async () => {
        const badDTO = {
            courtId: 1,
            startTime: FUTURE_START,
            endTime: new Date(FUTURE_START.getTime() + 45 * 60 * 1000),  // 45 min
        }

        await expect(service.create(FAKE_USER_ID, badDTO))
            .rejects
            .toMatchObject({
                statusCode: 400,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 7: Complejo cerrado ese día → AppError 400
    // ═════════════════════════════════════════════════════════
    it('debe lanzar AppError 400 si el complejo está cerrado ese día', async () => {
        mockRepository.getComplexSchedule.mockResolvedValue(null)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toMatchObject({
                message: 'El complejo está cerrado ese día',
                statusCode: 400,
            })
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 8: Re-throw de errores no esperados
    // ═════════════════════════════════════════════════════════
    it('debe re-lanzar errores inesperados del repository sin transformarlos', async () => {
        const unexpectedError = new Error('DATABASE_CONNECTION_LOST')
        mockRepository.create.mockRejectedValue(unexpectedError)

        await expect(service.create(FAKE_USER_ID, INPUT_DTO))
            .rejects
            .toThrow('DATABASE_CONNECTION_LOST')
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 9: Cálculo correcto del precio
    // ═════════════════════════════════════════════════════════
    it('debe calcular el precio total correctamente (proporcional a la duración)', async () => {
        await service.create(FAKE_USER_ID, INPUT_DTO)

        // Precio de la cancha: 2000/hora → 60 min de turno → totalPrice = 2000
        expect(mockRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                totalPrice: Math.round((2000 / 60) * 60),  // = 2000
            })
        )
    })
})
