import { CourtService } from '../court.service'
import { CourtRepository } from '../court.repository'
import { AppError } from '../../../utils/appError'

// ─────────────────────────────────────────────────────────────
//  Mock del CourtRepository (inyectado vía constructor)
// ─────────────────────────────────────────────────────────────
const mockRepository: jest.Mocked<CourtRepository> = {
    findComplexByOwner: jest.fn(),
    create: jest.fn(),
    findActiveCourt: jest.fn(),
    findCourt: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findCourtsByUserId: jest.fn(),
    findDeletedCourtsByUserId: jest.fn(),
    findAllCourts: jest.fn(),
    findDeletedCourt: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
} as unknown as jest.Mocked<CourtRepository>


describe('CourtService', () => {

    let service: CourtService

    const USER_ID = 10

    const FAKE_COMPLEX = {
        id: 5,
        name: 'Club Padel Pro',
        ownerId: USER_ID,
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

    const COURT_DTO = {
        name: 'Cancha 1',
        sport: 'PADEL',
        type: null,
        price: 2000,
        duration: 60,
        isIndoor: false,
        isActive: true,
        complexId: 5,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        service = new CourtService(mockRepository)
    })


    // ═════════════════════════════════════════════════════════
    //  create()
    // ═════════════════════════════════════════════════════════
    describe('create()', () => {

        it('debe crear una cancha cuando el usuario es dueño del complejo', async () => {
            mockRepository.findComplexByOwner.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.create.mockResolvedValue(FAKE_COURT as any)

            const result = await service.create(USER_ID, COURT_DTO as any)

            expect(mockRepository.findComplexByOwner).toHaveBeenCalledWith(COURT_DTO.complexId, USER_ID)
            expect(mockRepository.create).toHaveBeenCalledWith(COURT_DTO)
            expect(result).toEqual(FAKE_COURT)
        })

        it('debe lanzar AppError 403 si el usuario no es dueño del complejo', async () => {
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.create(999, COURT_DTO as any))
                .rejects
                .toMatchObject({
                    message: 'No tenés permiso sobre este complejo',
                    statusCode: 403,
                })

            expect(mockRepository.create).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findActive()
    // ═════════════════════════════════════════════════════════
    describe('findActive()', () => {

        it('debe retornar la cancha cuando existe y está activa', async () => {
            mockRepository.findActiveCourt.mockResolvedValue(FAKE_COURT as any)

            const result = await service.findActive(1)

            expect(mockRepository.findActiveCourt).toHaveBeenCalledWith(1)
            expect(result).toEqual(FAKE_COURT)
        })

        it('debe lanzar AppError 404 si la cancha no existe', async () => {
            mockRepository.findActiveCourt.mockResolvedValue(null)

            await expect(service.findActive(999))
                .rejects
                .toMatchObject({
                    message: 'No existe un cancha con este ID',
                    statusCode: 404,
                })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  update()
    // ═════════════════════════════════════════════════════════
    describe('update()', () => {

        const UPDATE_DATA = { name: 'Cancha Renovada', price: 3000 }

        it('debe actualizar cuando la cancha existe y el usuario es dueño', async () => {
            mockRepository.findCourt.mockResolvedValue(FAKE_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.update.mockResolvedValue({ ...FAKE_COURT, ...UPDATE_DATA } as any)

            const result = await service.update(1, USER_ID, UPDATE_DATA as any)

            expect(mockRepository.findCourt).toHaveBeenCalledWith(1)
            expect(mockRepository.findComplexByOwner).toHaveBeenCalledWith(FAKE_COURT.complexId, USER_ID)
            expect(mockRepository.update).toHaveBeenCalledWith(1, UPDATE_DATA)
            expect(result.name).toBe('Cancha Renovada')
        })

        it('debe lanzar AppError 404 si la cancha no existe', async () => {
            mockRepository.findCourt.mockResolvedValue(null)

            await expect(service.update(999, USER_ID, UPDATE_DATA as any))
                .rejects
                .toMatchObject({
                    message: 'Cancha inexistente.',
                    statusCode: 404,
                })

            expect(mockRepository.update).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si el usuario no es dueño del complejo', async () => {
            mockRepository.findCourt.mockResolvedValue(FAKE_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.update(1, 999, UPDATE_DATA as any))
                .rejects
                .toMatchObject({
                    message: 'No tenés permiso sobre este complejo',
                    statusCode: 403,
                })

            expect(mockRepository.update).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  delete() (soft delete)
    // ═════════════════════════════════════════════════════════
    describe('delete()', () => {

        it('debe hacer soft delete cuando la cancha existe y el usuario es dueño', async () => {
            mockRepository.findCourt.mockResolvedValue(FAKE_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.softDelete.mockResolvedValue({
                ...FAKE_COURT, deletedAt: new Date(), isActive: false,
            } as any)

            const result = await service.delete(1, USER_ID)

            expect(mockRepository.findCourt).toHaveBeenCalledWith(1)
            expect(mockRepository.findComplexByOwner).toHaveBeenCalledWith(FAKE_COURT.complexId, USER_ID)
            expect(mockRepository.softDelete).toHaveBeenCalledWith(1, {
                deletedAt: expect.any(Date),
                isActive: false,
            })
            expect(result.deletedAt).toBeTruthy()
            expect(result.isActive).toBe(false)
        })

        it('debe lanzar AppError 404 si la cancha no existe', async () => {
            mockRepository.findCourt.mockResolvedValue(null)

            await expect(service.delete(999, USER_ID))
                .rejects
                .toMatchObject({ statusCode: 404 })

            expect(mockRepository.softDelete).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es dueño del complejo', async () => {
            mockRepository.findCourt.mockResolvedValue(FAKE_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.delete(1, 999))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.softDelete).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findAll()
    // ═════════════════════════════════════════════════════════
    describe('findAll()', () => {

        it('debe retornar las canchas cuando existen', async () => {
            mockRepository.findAllCourts.mockResolvedValue([FAKE_COURT] as any)

            const result = await service.findAll()

            expect(mockRepository.findAllCourts).toHaveBeenCalledTimes(1)
            expect(result).toHaveLength(1)
        })

        it('debe lanzar AppError 404 si no hay canchas activas', async () => {
            mockRepository.findAllCourts.mockResolvedValue([])

            await expect(service.findAll())
                .rejects
                .toMatchObject({
                    message: 'No se encontraron canchas activas',
                    statusCode: 404,
                })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findCourtsUser()
    // ═════════════════════════════════════════════════════════
    describe('findCourtsUser()', () => {

        it('debe retornar las canchas del owner', async () => {
            mockRepository.findCourtsByUserId.mockResolvedValue([FAKE_COURT] as any)

            const result = await service.findCourtsUser(USER_ID)

            expect(mockRepository.findCourtsByUserId).toHaveBeenCalledWith(USER_ID)
            expect(result).toHaveLength(1)
        })

        it('debe lanzar AppError 404 si el owner no tiene canchas', async () => {
            mockRepository.findCourtsByUserId.mockResolvedValue([])

            await expect(service.findCourtsUser(USER_ID))
                .rejects
                .toMatchObject({
                    message: 'No se encontraron canchas activas',
                    statusCode: 404,
                })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findDeletedCourtsUser()
    // ═════════════════════════════════════════════════════════
    describe('findDeletedCourtsUser()', () => {

        it('debe retornar las canchas eliminadas del owner', async () => {
            const deletedCourt = { ...FAKE_COURT, deletedAt: new Date() }
            mockRepository.findDeletedCourtsByUserId.mockResolvedValue([deletedCourt] as any)

            const result = await service.findDeletedCourtsUser(USER_ID)

            expect(mockRepository.findDeletedCourtsByUserId).toHaveBeenCalledWith(USER_ID)
            expect(result).toHaveLength(1)
        })

        it('debe lanzar AppError 404 si no hay canchas en la papelera', async () => {
            mockRepository.findDeletedCourtsByUserId.mockResolvedValue([])

            await expect(service.findDeletedCourtsUser(USER_ID))
                .rejects
                .toMatchObject({
                    message: 'No se encontraron canchas en papelera',
                    statusCode: 404,
                })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  restore()
    // ═════════════════════════════════════════════════════════
    describe('restore()', () => {

        const DELETED_COURT = { ...FAKE_COURT, deletedAt: new Date(), isActive: false }

        it('debe restaurar una cancha eliminada cuando el usuario es dueño', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(DELETED_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.restore.mockResolvedValue({ ...FAKE_COURT, deletedAt: null, isActive: false } as any)

            const result = await service.restore(1, USER_ID)

            expect(mockRepository.findDeletedCourt).toHaveBeenCalledWith(1)
            expect(mockRepository.findComplexByOwner).toHaveBeenCalledWith(DELETED_COURT.complexId, USER_ID)
            expect(mockRepository.restore).toHaveBeenCalledWith(1)
            expect(result.deletedAt).toBeNull()
        })

        it('debe lanzar AppError 404 si la cancha no está en la papelera', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(null)

            await expect(service.restore(999, USER_ID))
                .rejects
                .toMatchObject({
                    message: 'No se encontró la cancha en la papelera',
                    statusCode: 404,
                })

            expect(mockRepository.restore).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es dueño del complejo', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(DELETED_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.restore(1, 999))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.restore).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  hardDelete()
    // ═════════════════════════════════════════════════════════
    describe('hardDelete()', () => {

        const DELETED_COURT = { ...FAKE_COURT, deletedAt: new Date(), isActive: false }

        it('debe eliminar permanentemente una cancha de la papelera', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(DELETED_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.hardDelete.mockResolvedValue(DELETED_COURT as any)

            const result = await service.hardDelete(1, USER_ID)

            expect(mockRepository.findDeletedCourt).toHaveBeenCalledWith(1)
            expect(mockRepository.findComplexByOwner).toHaveBeenCalledWith(DELETED_COURT.complexId, USER_ID)
            expect(mockRepository.hardDelete).toHaveBeenCalledWith(1)
            expect(result).toBeTruthy()
        })

        it('debe lanzar AppError 404 si la cancha no está en la papelera', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(null)

            await expect(service.hardDelete(999, USER_ID))
                .rejects
                .toMatchObject({
                    message: 'No se encontró la cancha en la papelera',
                    statusCode: 404,
                })

            expect(mockRepository.hardDelete).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es dueño del complejo', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(DELETED_COURT as any)
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.hardDelete(1, 999))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.hardDelete).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  Métodos privados (test indirecto)
    // ═════════════════════════════════════════════════════════
    describe('getComplexOrThrow() — test indirecto vía create()', () => {

        it('la verificación de ownership se ejecuta ANTES de la creación', async () => {
            mockRepository.findComplexByOwner.mockResolvedValue(null)

            await expect(service.create(999, COURT_DTO as any)).rejects.toThrow(AppError)

            // findComplexByOwner se llamó pero create NO
            expect(mockRepository.findComplexByOwner).toHaveBeenCalledTimes(1)
            expect(mockRepository.create).not.toHaveBeenCalled()
        })
    })

    describe('getCourtOrThrow() — test indirecto vía update()', () => {

        it('la verificación de existencia se ejecuta ANTES del ownership', async () => {
            mockRepository.findCourt.mockResolvedValue(null)

            await expect(service.update(999, USER_ID, COURT_DTO as any)).rejects.toThrow(AppError)

            // findCourt se llamó pero findComplexByOwner NO
            expect(mockRepository.findCourt).toHaveBeenCalledTimes(1)
            expect(mockRepository.findComplexByOwner).not.toHaveBeenCalled()
        })
    })

    describe('getCourtDeletedOrThrow() — test indirecto vía restore()', () => {

        it('la verificación de papelera se ejecuta ANTES del ownership', async () => {
            mockRepository.findDeletedCourt.mockResolvedValue(null)

            await expect(service.restore(999, USER_ID)).rejects.toThrow(AppError)

            expect(mockRepository.findDeletedCourt).toHaveBeenCalledTimes(1)
            expect(mockRepository.findComplexByOwner).not.toHaveBeenCalled()
        })
    })
})
