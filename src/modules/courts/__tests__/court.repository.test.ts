import { CourtRepository } from '../court.repository'
import { db } from '../../../config/db'

// ─────────────────────────────────────────────────────────────
//  Mock de Prisma Client
// ─────────────────────────────────────────────────────────────
jest.mock('../../../config/db', () => ({
    db: {
        complex: {
            findFirst: jest.fn(),
        },
        court: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}))

const mockDb = db as jest.Mocked<typeof db>
const mockComplex = mockDb.complex as jest.Mocked<typeof mockDb.complex>
const mockCourt = mockDb.court as jest.Mocked<typeof mockDb.court>

describe('CourtRepository', () => {

    let repository: CourtRepository

    const FAKE_COMPLEX = {
        id: 5,
        name: 'Club Padel Pro',
        ownerId: 10,
    }

    const FAKE_COURT = {
        id: 1,
        name: 'Cancha 1',
        sport: 'PADEL',
        type: null,
        price: 2000,
        duration: 60,
        isIndoor: false,
        isActive: true,
        complexId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        repository = new CourtRepository()
    })


    // ═════════════════════════════════════════════════════════
    //  findComplexByOwner
    // ═════════════════════════════════════════════════════════
    describe('findComplexByOwner()', () => {

        it('debe buscar un complejo por id y ownerId', async () => {
            (mockComplex.findFirst as jest.Mock).mockResolvedValue(FAKE_COMPLEX)

            const result = await repository.findComplexByOwner(5, 10)

            expect(mockComplex.findFirst).toHaveBeenCalledWith({
                where: { id: 5, ownerId: 10 },
            })
            expect(result).toEqual(FAKE_COMPLEX)
        })

        it('debe retornar null si el owner no es dueño del complejo', async () => {
            (mockComplex.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findComplexByOwner(5, 999)

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  create
    // ═════════════════════════════════════════════════════════
    describe('create()', () => {

        it('debe crear una cancha con los datos provistos', async () => {
            const courtData = {
                name: 'Cancha 1',
                sport: 'PADEL',
                type: null,
                price: 2000,
                duration: 60,
                isIndoor: false,
                isActive: true,
                complexId: 5,
            };
            (mockCourt.create as jest.Mock).mockResolvedValue({ id: 1, ...courtData })

            const result = await repository.create(courtData as any)

            expect(mockCourt.create).toHaveBeenCalledWith({ data: courtData })
            expect(result.id).toBe(1)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findActiveCourt
    // ═════════════════════════════════════════════════════════
    describe('findActiveCourt()', () => {

        it('debe buscar una cancha activa con include de complex', async () => {
            (mockCourt.findFirst as jest.Mock).mockResolvedValue(FAKE_COURT)

            const result = await repository.findActiveCourt(1)

            expect(mockCourt.findFirst).toHaveBeenCalledWith({
                where: { id: 1, isActive: true },
                include: { complex: true },
            })
            expect(result).toEqual(FAKE_COURT)
        })

        it('debe retornar null si la cancha no está activa', async () => {
            (mockCourt.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findActiveCourt(999)

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findCourt
    // ═════════════════════════════════════════════════════════
    describe('findCourt()', () => {

        it('debe buscar una cancha no eliminada (deletedAt: null) con include', async () => {
            (mockCourt.findFirst as jest.Mock).mockResolvedValue(FAKE_COURT)

            const result = await repository.findCourt(1)

            expect(mockCourt.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null },
                include: { complex: true },
            })
            expect(result).toEqual(FAKE_COURT)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  update
    // ═════════════════════════════════════════════════════════
    describe('update()', () => {

        it('debe actualizar la cancha con los datos provistos', async () => {
            const updateData = { name: 'Cancha Renovada', price: 3000 }
            const updated = { ...FAKE_COURT, ...updateData };
            (mockCourt.update as jest.Mock).mockResolvedValue(updated)

            const result = await repository.update(1, updateData as any)

            expect(mockCourt.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
            expect(result.name).toBe('Cancha Renovada')
        })
    })


    // ═════════════════════════════════════════════════════════
    //  softDelete
    // ═════════════════════════════════════════════════════════
    describe('softDelete()', () => {

        it('debe hacer soft delete seteando deletedAt e isActive: false', async () => {
            const deleteDate = new Date()
            const deleteData = { deletedAt: deleteDate, isActive: false }
            const deleted = { ...FAKE_COURT, ...deleteData };
            (mockCourt.update as jest.Mock).mockResolvedValue(deleted)

            const result = await repository.softDelete(1, deleteData as any)

            expect(mockCourt.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: deleteData,
            })
            expect(result.deletedAt).toEqual(deleteDate)
            expect(result.isActive).toBe(false)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findCourtsByUserId
    // ═════════════════════════════════════════════════════════
    describe('findCourtsByUserId()', () => {

        it('debe buscar canchas activas del owner con filtro en complex.ownerId', async () => {
            (mockCourt.findMany as jest.Mock).mockResolvedValue([FAKE_COURT])

            const result = await repository.findCourtsByUserId(10)

            expect(mockCourt.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: null,
                    complex: { ownerId: 10 },
                },
                include: { complex: true },
            })
            expect(result).toHaveLength(1)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findDeletedCourtsByUserId
    // ═════════════════════════════════════════════════════════
    describe('findDeletedCourtsByUserId()', () => {

        it('debe buscar canchas eliminadas del owner (deletedAt not null)', async () => {
            const deletedCourt = { ...FAKE_COURT, deletedAt: new Date() };
            (mockCourt.findMany as jest.Mock).mockResolvedValue([deletedCourt])

            const result = await repository.findDeletedCourtsByUserId(10)

            expect(mockCourt.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: { not: null },
                    complex: { ownerId: 10 },
                },
                include: { complex: true },
            })
            expect(result[0].deletedAt).toBeTruthy()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findAllCourts
    // ═════════════════════════════════════════════════════════
    describe('findAllCourts()', () => {

        it('debe buscar canchas activas y no eliminadas', async () => {
            (mockCourt.findMany as jest.Mock).mockResolvedValue([FAKE_COURT])

            const result = await repository.findAllCourts()

            expect(mockCourt.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null, isActive: true },
            })
            expect(result).toHaveLength(1)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findDeletedCourt
    // ═════════════════════════════════════════════════════════
    describe('findDeletedCourt()', () => {

        it('debe buscar una cancha eliminada por id (deletedAt not null)', async () => {
            const deletedCourt = { ...FAKE_COURT, deletedAt: new Date() };
            (mockCourt.findFirst as jest.Mock).mockResolvedValue(deletedCourt)

            const result = await repository.findDeletedCourt(1)

            expect(mockCourt.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: { not: null } },
                include: { complex: true },
            })
            expect(result.deletedAt).toBeTruthy()
        })

        it('debe retornar null si la cancha no está en la papelera', async () => {
            (mockCourt.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findDeletedCourt(1)

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  restore
    // ═════════════════════════════════════════════════════════
    describe('restore()', () => {

        it('debe restaurar la cancha seteando deletedAt: null e isActive: false', async () => {
            const restored = { ...FAKE_COURT, deletedAt: null, isActive: false };
            (mockCourt.update as jest.Mock).mockResolvedValue(restored)

            const result = await repository.restore(1)

            expect(mockCourt.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { deletedAt: null, isActive: false },
            })
            expect(result.deletedAt).toBeNull()
            expect(result.isActive).toBe(false)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  hardDelete
    // ═════════════════════════════════════════════════════════
    describe('hardDelete()', () => {

        it('debe eliminar permanentemente la cancha', async () => {
            (mockCourt.delete as jest.Mock).mockResolvedValue(FAKE_COURT)

            const result = await repository.hardDelete(1)

            expect(mockCourt.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })
            expect(result).toEqual(FAKE_COURT)
        })
    })
})
