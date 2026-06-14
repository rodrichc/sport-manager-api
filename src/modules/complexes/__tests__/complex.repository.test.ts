import { ComplexRepository } from '../complex.repository'
import { db } from '../../../config/db'

// ─────────────────────────────────────────────────────────────
//  Mock de Prisma Client
// ─────────────────────────────────────────────────────────────
jest.mock('../../../config/db', () => ({
    db: {
        $transaction: jest.fn(),
        complex: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        complexSchedule: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
            findMany: jest.fn(),
        },
        court: {
            findMany: jest.fn(),
        },
    },
}))

const mockDb = db as jest.Mocked<typeof db>
const mockComplex = mockDb.complex as jest.Mocked<typeof mockDb.complex>
const mockCourt = mockDb.court as jest.Mocked<typeof mockDb.court>

describe('ComplexRepository', () => {

    let repository: ComplexRepository

    const FAKE_COMPLEX = {
        id: 1,
        name: 'Club Padel Pro',
        description: null,
        address: 'Av. Siempreviva 742',
        lat: null,
        lng: null,
        logo: null,
        status: 'PENDING',
        ownerId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        minBookingDuration: 60,
        maxBookingDuration: 180,
    }

    const FAKE_SCHEDULES = [
        { id: 1, complexId: 1, dayOfWeek: 1, startTime: '09:00', endTime: '22:00' },
        { id: 2, complexId: 1, dayOfWeek: 2, startTime: '09:00', endTime: '22:00' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        repository = new ComplexRepository()
    })


    // ═════════════════════════════════════════════════════════
    //  create
    // ═════════════════════════════════════════════════════════
    describe('create()', () => {

        it('debe crear un complejo con schedules anidados y retornarlo con include', async () => {
            const createDTO = {
                name: 'Club Padel Pro',
                address: 'Av. Siempreviva 742',
                schedules: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '22:00' },
                ],
            }

            const expected = { ...FAKE_COMPLEX, schedules: FAKE_SCHEDULES };
            (mockComplex.create as jest.Mock).mockResolvedValue(expected)

            const result = await repository.create(createDTO, 10)

            expect(mockComplex.create).toHaveBeenCalledWith({
                data: {
                    name: createDTO.name,
                    address: createDTO.address,
                    ownerId: 10,
                    schedules: {
                        create: createDTO.schedules,
                    },
                },
                include: { schedules: true },
            })
            expect(result).toEqual(expected)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findAllActive
    // ═════════════════════════════════════════════════════════
    describe('findAllActive()', () => {

        it('debe buscar complejos con status APPROVED y sin deletedAt', async () => {
            const activeComplexes = [FAKE_COMPLEX];
            (mockComplex.findMany as jest.Mock).mockResolvedValue(activeComplexes)

            const result = await repository.findAllActive()

            expect(mockComplex.findMany).toHaveBeenCalledWith({
                where: { status: 'APPROVED', deletedAt: null },
            })
            expect(result).toEqual(activeComplexes)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findById / findActiveById
    // ═════════════════════════════════════════════════════════
    describe('findById()', () => {

        it('debe buscar por id con includes de schedules y courts', async () => {
            (mockComplex.findUnique as jest.Mock).mockResolvedValue(FAKE_COMPLEX)

            const result = await repository.findById(1)

            expect(mockComplex.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { schedules: true, courts: true },
            })
            expect(result).toEqual(FAKE_COMPLEX)
        })
    })

    describe('findActiveById()', () => {

        it('debe buscar por id filtrando los no eliminados (deletedAt: null)', async () => {
            (mockComplex.findFirst as jest.Mock).mockResolvedValue(FAKE_COMPLEX)

            const result = await repository.findActiveById(1)

            expect(mockComplex.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null },
                include: { schedules: true, courts: true },
            })
            expect(result).toEqual(FAKE_COMPLEX)
        })

        it('debe retornar null si el complejo no existe o está eliminado', async () => {
            (mockComplex.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findActiveById(999)

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  update
    // ═════════════════════════════════════════════════════════
    describe('update()', () => {

        it('debe actualizar el complejo con los datos parciales provistos', async () => {
            const updateData = { name: 'Club Renovado' }
            const updatedComplex = { ...FAKE_COMPLEX, ...updateData };
            (mockComplex.update as jest.Mock).mockResolvedValue(updatedComplex)

            const result = await repository.update(1, updateData)

            expect(mockComplex.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
            expect(result.name).toBe('Club Renovado')
        })
    })


    // ═════════════════════════════════════════════════════════
    //  softDelete
    // ═════════════════════════════════════════════════════════
    describe('softDelete()', () => {

        it('debe hacer soft delete seteando deletedAt', async () => {
            const deleteDate = new Date();
            const deletedComplex = { ...FAKE_COMPLEX, deletedAt: deleteDate };
            (mockComplex.update as jest.Mock).mockResolvedValue(deletedComplex)

            const result = await repository.softDelete(1, { deletedAt: deleteDate })

            expect(mockComplex.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { deletedAt: deleteDate },
            })
            expect(result.deletedAt).toEqual(deleteDate)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findActiveByOwner / findDeletedByOwner
    // ═════════════════════════════════════════════════════════
    describe('findActiveByOwner()', () => {

        it('debe buscar complejos activos del owner con schedules incluidos', async () => {
            (mockComplex.findMany as jest.Mock).mockResolvedValue([FAKE_COMPLEX])

            const result = await repository.findActiveByOwner(10)

            expect(mockComplex.findMany).toHaveBeenCalledWith({
                where: { ownerId: 10, deletedAt: null },
                include: { schedules: true },
            })
            expect(result).toHaveLength(1)
        })
    })

    describe('findDeletedByOwner()', () => {

        it('debe buscar complejos eliminados del owner (deletedAt not null)', async () => {
            const deletedComplex = { ...FAKE_COMPLEX, deletedAt: new Date() };
            (mockComplex.findMany as jest.Mock).mockResolvedValue([deletedComplex])

            const result = await repository.findDeletedByOwner(10)

            expect(mockComplex.findMany).toHaveBeenCalledWith({
                where: { ownerId: 10, deletedAt: { not: null } },
            })
            expect(result[0].deletedAt).toBeTruthy()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  restore
    // ═════════════════════════════════════════════════════════
    describe('restore()', () => {

        it('debe restaurar el complejo seteando deletedAt a null', async () => {
            const restoredComplex = { ...FAKE_COMPLEX, deletedAt: null };
            (mockComplex.update as jest.Mock).mockResolvedValue(restoredComplex)

            const result = await repository.restore(1)

            expect(mockComplex.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { deletedAt: null },
            })
            expect(result.deletedAt).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  hardDelete
    // ═════════════════════════════════════════════════════════
    describe('hardDelete()', () => {

        it('debe eliminar permanentemente el complejo de la base', async () => {
            (mockComplex.delete as jest.Mock).mockResolvedValue(FAKE_COMPLEX)

            const result = await repository.hardDelete(1)

            expect(mockComplex.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })
            expect(result).toEqual(FAKE_COMPLEX)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  updateSchedules ($transaction)
    // ═════════════════════════════════════════════════════════
    describe('updateSchedules()', () => {

        it('debe borrar schedules existentes, crear los nuevos y retornarlos dentro de $transaction', async () => {
            const newSchedules = [
                { dayOfWeek: 1, startTime: '10:00', endTime: '23:00' },
                { dayOfWeek: 5, startTime: '14:00', endTime: '22:00' },
            ]

            const createdSchedules = newSchedules.map((s, i) => ({
                id: i + 10,
                complexId: 1,
                ...s,
            }))

            const mockTx = {
                complexSchedule: {
                    deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
                    createMany: jest.fn().mockResolvedValue({ count: 2 }),
                    findMany: jest.fn().mockResolvedValue(createdSchedules),
                },
            };

            (mockDb.$transaction as jest.Mock).mockImplementation(
                async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
                    return callback(mockTx)
                }
            )

            const result = await repository.updateSchedules(1, newSchedules)

            // 1. Borró los schedules anteriores
            expect(mockTx.complexSchedule.deleteMany).toHaveBeenCalledWith({
                where: { complexId: 1 },
            })

            // 2. Creó los nuevos con el complexId inyectado
            expect(mockTx.complexSchedule.createMany).toHaveBeenCalledWith({
                data: [
                    { dayOfWeek: 1, startTime: '10:00', endTime: '23:00', complexId: 1 },
                    { dayOfWeek: 5, startTime: '14:00', endTime: '22:00', complexId: 1 },
                ],
            })

            // 3. Consultó los schedules finales
            expect(mockTx.complexSchedule.findMany).toHaveBeenCalledWith({
                where: { complexId: 1 },
            })

            // 4. Retornó los schedules creados
            expect(result).toEqual(createdSchedules)
            expect(result).toHaveLength(2)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findCourtsById
    // ═════════════════════════════════════════════════════════
    describe('findCourtsById()', () => {

        it('debe buscar canchas activas y no eliminadas del complejo', async () => {
            const fakeCourts = [
                { id: 1, name: 'Cancha 1', complexId: 1, isActive: true, deletedAt: null },
            ];
            (mockCourt.findMany as jest.Mock).mockResolvedValue(fakeCourts)

            const result = await repository.findCourtsById(1)

            expect(mockCourt.findMany).toHaveBeenCalledWith({
                where: { complexId: 1, isActive: true, deletedAt: null },
            })
            expect(result).toEqual(fakeCourts)
        })
    })
})
