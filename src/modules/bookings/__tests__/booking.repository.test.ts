import { BookingStatus } from '@prisma/client'
import { BookingRepository } from '../booking.repository'
import { db } from '../../../config/db'

// ─────────────────────────────────────────────────────────────
//  Mock del módulo de Prisma Client
//  Reemplazamos `db` con un objeto jest.mock para que ningún
//  test toque la base de datos real.
// ─────────────────────────────────────────────────────────────
jest.mock('../../../config/db', () => ({
    db: {
        $transaction: jest.fn(),
        booking: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        court: {
            findMany: jest.fn(),
        },
    },
}))

// ─────────────────────────────────────────────────────────────
//  Helpers de tipado para los mocks
// ─────────────────────────────────────────────────────────────
const mockDb = db as jest.Mocked<typeof db>
const mockBooking = mockDb.booking as jest.Mocked<typeof mockDb.booking>

describe('BookingRepository – create()', () => {

    let repository: BookingRepository

    // Datos de prueba reutilizables
    const INPUT_DATA = {
        courtId: 1,
        userId: 10,
        startTime: new Date('2026-07-01T18:00:00Z'),
        endTime: new Date('2026-07-01T19:00:00Z'),
        totalPrice: 2000,
    }

    const FAKE_BOOKING = {
        id: 99,
        courtId: INPUT_DATA.courtId,
        userId: INPUT_DATA.userId,
        startTime: INPUT_DATA.startTime,
        endTime: INPUT_DATA.endTime,
        totalPrice: INPUT_DATA.totalPrice,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        repository = new BookingRepository()
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 1: Creación Exitosa (horario libre)
    // ═════════════════════════════════════════════════════════
    it('debe crear la reserva cuando el horario está libre (findFirst → null)', async () => {
        // Simulamos que $transaction ejecuta el callback con un "tx" mockeado
        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(null),       // ← horario libre
                create: jest.fn().mockResolvedValue(FAKE_BOOKING),  // ← crea ok
            },
        };

        (mockDb.$transaction as jest.Mock).mockImplementation(
            async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
                return callback(mockTx)
            }
        )

        const result = await repository.create(INPUT_DATA)

        // ── Verificaciones ──────────────────────────────────
        // 1. Se verificó la disponibilidad con los filtros correctos
        expect(mockTx.booking.findFirst).toHaveBeenCalledTimes(1)
        expect(mockTx.booking.findFirst).toHaveBeenCalledWith({
            where: {
                courtId: INPUT_DATA.courtId,
                status: { not: BookingStatus.CANCELLED },
                AND: [
                    { startTime: { lt: INPUT_DATA.endTime } },
                    { endTime: { gt: INPUT_DATA.startTime } },
                ],
            },
        })

        // 2. Se llamó a create con los datos correctos
        expect(mockTx.booking.create).toHaveBeenCalledTimes(1)
        expect(mockTx.booking.create).toHaveBeenCalledWith({
            data: {
                courtId: INPUT_DATA.courtId,
                userId: INPUT_DATA.userId,
                startTime: INPUT_DATA.startTime,
                endTime: INPUT_DATA.endTime,
                totalPrice: INPUT_DATA.totalPrice,
                status: BookingStatus.CONFIRMED,
            },
        })

        // 3. El resultado es la reserva creada
        expect(result).toEqual(FAKE_BOOKING)
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 2: Detección de Colisión (horario ocupado)
    // ═════════════════════════════════════════════════════════
    it('debe lanzar "COLLISION_DETECTED" y NO crear la reserva cuando el horario está ocupado', async () => {
        const existingBooking = {
            id: 50,
            courtId: INPUT_DATA.courtId,
            userId: 5,
            startTime: INPUT_DATA.startTime,
            endTime: INPUT_DATA.endTime,
            status: BookingStatus.CONFIRMED,
        }

        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(existingBooking),  // ← ocupado
                create: jest.fn(),
            },
        };

        (mockDb.$transaction as jest.Mock).mockImplementation(
            async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
                return callback(mockTx)
            }
        )

        // ── Verificaciones ──────────────────────────────────
        // 1. Debe lanzar el error con el mensaje exacto
        await expect(repository.create(INPUT_DATA))
            .rejects
            .toThrow('COLLISION_DETECTED')

        // 2. findFirst SÍ fue llamado (verificó disponibilidad)
        expect(mockTx.booking.findFirst).toHaveBeenCalledTimes(1)

        // 3. create NUNCA fue llamado (se abortó antes)
        expect(mockTx.booking.create).not.toHaveBeenCalled()
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 3: Colisión parcial (solapamiento parcial)
    // ═════════════════════════════════════════════════════════
    it('debe detectar colisión incluso con solapamiento parcial de horarios', async () => {
        // La reserva existente cubre de 18:30 a 19:30 → se solapa con 18:00-19:00
        const partialOverlap = {
            id: 77,
            courtId: INPUT_DATA.courtId,
            userId: 3,
            startTime: new Date('2026-07-01T18:30:00Z'),
            endTime: new Date('2026-07-01T19:30:00Z'),
            status: BookingStatus.CONFIRMED,
        }

        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(partialOverlap),
                create: jest.fn(),
            },
        };

        (mockDb.$transaction as jest.Mock).mockImplementation(
            async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
                return callback(mockTx)
            }
        )

        await expect(repository.create(INPUT_DATA))
            .rejects
            .toThrow('COLLISION_DETECTED')

        expect(mockTx.booking.create).not.toHaveBeenCalled()
    })


    // ═════════════════════════════════════════════════════════
    //  ESCENARIO 4: Reserva cancelada no genera colisión
    // ═════════════════════════════════════════════════════════
    it('no debe considerar reservas CANCELLED como colisión (findFirst filtra por status)', async () => {
        // findFirst retorna null porque la query excluye CANCELLED
        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(FAKE_BOOKING),
            },
        };

        (mockDb.$transaction as jest.Mock).mockImplementation(
            async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
                return callback(mockTx)
            }
        )

        await repository.create(INPUT_DATA)

        // Verificamos que el filtro excluye CANCELLED
        expect(mockTx.booking.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    status: { not: BookingStatus.CANCELLED },
                }),
            })
        )

        // Y que sí se creó la reserva
        expect(mockTx.booking.create).toHaveBeenCalledTimes(1)
    })
})


// ═════════════════════════════════════════════════════════
//  findByUserId con paginación
// ═════════════════════════════════════════════════════════
describe('BookingRepository – findByUserId()', () => {

    let repository: BookingRepository

    const FAKE_BOOKING = {
        id: 99,
        courtId: 1,
        userId: 10,
        startTime: new Date('2026-07-01T18:00:00Z'),
        endTime: new Date('2026-07-01T19:00:00Z'),
        totalPrice: 2000,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        repository = new BookingRepository()
    })

    it('debe retornar reservas sin paginación', async () => {
        (mockBooking.findMany as jest.Mock).mockResolvedValue([FAKE_BOOKING])

        const result = await repository.findByUserId(10)

        expect(mockBooking.findMany).toHaveBeenCalledWith({
            where: { userId: 10 },
            include: {
                court: {
                    include: { complex: true },
                },
            },
            orderBy: { startTime: 'desc' },
        })
        expect(result).toEqual([FAKE_BOOKING])
    })

    it('debe retornar items paginados y total', async () => {
        (mockBooking.findMany as jest.Mock).mockResolvedValue([FAKE_BOOKING])
        ;(mockBooking.count as jest.Mock).mockResolvedValue(8)

        const result = await repository.findByUserId(10, { skip: 0, take: 10 })

        expect(mockBooking.findMany).toHaveBeenCalledWith({
            where: { userId: 10 },
            include: {
                court: {
                    include: { complex: true },
                },
            },
            orderBy: { startTime: 'desc' },
            skip: 0,
            take: 10,
        })
        expect(mockBooking.count).toHaveBeenCalledWith({
            where: { userId: 10 },
        })
        expect(result).toEqual({ items: [FAKE_BOOKING], total: 8 })
    })
})
