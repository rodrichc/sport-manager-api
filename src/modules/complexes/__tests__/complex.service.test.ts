import { ComplexService } from '../complex.service'
import { ComplexRepository } from '../complex.repository'
import { AppError } from '../../../utils/appError'
import { UserSafe } from '../../../types'

// ─────────────────────────────────────────────────────────────
//  Mock del ComplexRepository (inyectado vía constructor)
// ─────────────────────────────────────────────────────────────
const mockRepository: jest.Mocked<ComplexRepository> = {
    create: jest.fn(),
    findAllActive: jest.fn(),
    findActiveById: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findActiveByOwner: jest.fn(),
    findDeletedByOwner: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
    updateSchedules: jest.fn(),
    findCourtsById: jest.fn(),
} as unknown as jest.Mocked<ComplexRepository>


describe('ComplexService', () => {

    let service: ComplexService

    // ── Usuarios de prueba ────────────────────────────────
    const OWNER_USER: UserSafe = {
        id: 10,
        name: 'Owner Test',
        email: 'owner@test.com',
        username: 'ownertest',
        role: 'OWNER',
        isTwoFactorEnabled: false,
    }

    const REGULAR_USER: UserSafe = {
        id: 20,
        name: 'User Test',
        email: 'user@test.com',
        username: 'usertest',
        role: 'USER',
        isTwoFactorEnabled: false,
    }

    const ADMIN_USER: UserSafe = {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        username: 'admin',
        role: 'ADMIN',
        isTwoFactorEnabled: false,
    }

    const OTHER_OWNER: UserSafe = {
        id: 30,
        name: 'Otro Owner',
        email: 'otro@test.com',
        username: 'otroowner',
        role: 'OWNER',
        isTwoFactorEnabled: false,
    }

    // ── Complejo de prueba ────────────────────────────────
    const FAKE_COMPLEX = {
        id: 1,
        name: 'Club Padel Pro',
        description: null,
        address: 'Av. Siempreviva 742',
        lat: null,
        lng: null,
        logo: null,
        status: 'PENDING',
        ownerId: OWNER_USER.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        minBookingDuration: 60,
        maxBookingDuration: 180,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        service = new ComplexService(mockRepository)
    })


    // ═════════════════════════════════════════════════════════
    //  create()
    // ═════════════════════════════════════════════════════════
    describe('create()', () => {

        const CREATE_DTO = {
            name: 'Club Padel Pro',
            address: 'Av. Siempreviva 742',
            schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '22:00' }],
        }

        it('debe crear un complejo cuando el usuario es OWNER', async () => {
            mockRepository.create.mockResolvedValue(FAKE_COMPLEX as any)

            const result = await service.create(CREATE_DTO, OWNER_USER)

            expect(mockRepository.create).toHaveBeenCalledWith(CREATE_DTO, OWNER_USER.id)
            expect(result).toEqual(FAKE_COMPLEX)
        })

        it('debe lanzar AppError 403 si el usuario NO es OWNER', async () => {
            await expect(service.create(CREATE_DTO, REGULAR_USER))
                .rejects
                .toThrow(AppError)

            await expect(service.create(CREATE_DTO, REGULAR_USER))
                .rejects
                .toMatchObject({
                    message: 'Debe tener una cuenta de tipo Dueño para crear un Complejo',
                    statusCode: 403,
                })

            expect(mockRepository.create).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  getAllActive()
    // ═════════════════════════════════════════════════════════
    describe('getAllActive()', () => {

        it('debe delegar al repository y retornar la lista', async () => {
            mockRepository.findAllActive.mockResolvedValue([FAKE_COMPLEX] as any)

            const result = await service.getAllActive()

            expect(mockRepository.findAllActive).toHaveBeenCalledTimes(1)
            expect(result).toHaveLength(1)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  update()
    // ═════════════════════════════════════════════════════════
    describe('update()', () => {

        const UPDATE_DATA = { name: 'Club Renovado' }

        it('debe actualizar cuando el owner es el dueño del complejo', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.update.mockResolvedValue({ ...FAKE_COMPLEX, ...UPDATE_DATA } as any)

            const result = await service.update(UPDATE_DATA, OWNER_USER, 1)

            expect(mockRepository.findActiveById).toHaveBeenCalledWith(1)
            expect(mockRepository.update).toHaveBeenCalledWith(1, UPDATE_DATA)
            expect(result.name).toBe('Club Renovado')
        })

        it('debe lanzar AppError 404 si el complejo no existe', async () => {
            mockRepository.findActiveById.mockResolvedValue(null)

            await expect(service.update(UPDATE_DATA, OWNER_USER, 999))
                .rejects
                .toMatchObject({
                    message: 'Complejo no encontrado',
                    statusCode: 404,
                })

            expect(mockRepository.update).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si el usuario no es el dueño del complejo', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)

            await expect(service.update(UPDATE_DATA, OTHER_OWNER, 1))
                .rejects
                .toMatchObject({
                    message: 'Acción no válida. No eres dueño de este complejo.',
                    statusCode: 403,
                })

            expect(mockRepository.update).not.toHaveBeenCalled()
        })

        it('debe permitir que un ADMIN actualice cualquier complejo', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.update.mockResolvedValue({ ...FAKE_COMPLEX, ...UPDATE_DATA } as any)

            const result = await service.update(UPDATE_DATA, ADMIN_USER, 1)

            expect(mockRepository.update).toHaveBeenCalledTimes(1)
            expect(result.name).toBe('Club Renovado')
        })
    })


    // ═════════════════════════════════════════════════════════
    //  delete() (soft delete)
    // ═════════════════════════════════════════════════════════
    describe('delete()', () => {

        it('debe hacer soft delete cuando el owner es el dueño', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.softDelete.mockResolvedValue({ ...FAKE_COMPLEX, deletedAt: new Date() } as any)

            const result = await service.delete(OWNER_USER, 1)

            expect(mockRepository.findActiveById).toHaveBeenCalledWith(1)
            expect(mockRepository.softDelete).toHaveBeenCalledWith(1, { deletedAt: expect.any(Date) })
            expect(result.deletedAt).toBeTruthy()
        })

        it('debe lanzar AppError 404 si el complejo no existe', async () => {
            mockRepository.findActiveById.mockResolvedValue(null)

            await expect(service.delete(OWNER_USER, 999))
                .rejects
                .toMatchObject({ statusCode: 404 })

            expect(mockRepository.softDelete).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es el dueño ni admin', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)

            await expect(service.delete(OTHER_OWNER, 1))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.softDelete).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findByOwnerActive() / findByOwnerDeleted()
    // ═════════════════════════════════════════════════════════
    describe('findByOwnerActive()', () => {

        it('debe delegar al repository con el userId del owner', async () => {
            mockRepository.findActiveByOwner.mockResolvedValue([FAKE_COMPLEX] as any)

            const result = await service.findByOwnerActive(OWNER_USER)

            expect(mockRepository.findActiveByOwner).toHaveBeenCalledWith(OWNER_USER.id)
            expect(result).toHaveLength(1)
        })
    })

    describe('findByOwnerDeleted()', () => {

        it('debe delegar al repository con el userId del owner', async () => {
            const deletedComplex = { ...FAKE_COMPLEX, deletedAt: new Date() }
            mockRepository.findDeletedByOwner.mockResolvedValue([deletedComplex] as any)

            const result = await service.findByOwnerDeleted(OWNER_USER)

            expect(mockRepository.findDeletedByOwner).toHaveBeenCalledWith(OWNER_USER.id)
            expect(result).toHaveLength(1)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  restore()
    // ═════════════════════════════════════════════════════════
    describe('restore()', () => {

        const DELETED_COMPLEX = { ...FAKE_COMPLEX, deletedAt: new Date() }

        it('debe restaurar un complejo eliminado correctamente', async () => {
            mockRepository.findById.mockResolvedValue(DELETED_COMPLEX as any)
            mockRepository.restore.mockResolvedValue({ ...FAKE_COMPLEX, deletedAt: null } as any)

            const result = await service.restore(OWNER_USER, 1)

            expect(mockRepository.findById).toHaveBeenCalledWith(1)
            expect(mockRepository.restore).toHaveBeenCalledWith(1)
            expect(result.deletedAt).toBeNull()
        })

        it('debe lanzar AppError 404 si el complejo no existe', async () => {
            mockRepository.findById.mockResolvedValue(null)

            await expect(service.restore(OWNER_USER, 999))
                .rejects
                .toMatchObject({ statusCode: 404 })

            expect(mockRepository.restore).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 400 si el complejo NO está eliminado', async () => {
            // deletedAt es null → no está eliminado
            mockRepository.findById.mockResolvedValue(FAKE_COMPLEX as any)

            await expect(service.restore(OWNER_USER, 1))
                .rejects
                .toMatchObject({
                    message: 'El complejo no está eliminado',
                    statusCode: 400,
                })

            expect(mockRepository.restore).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es el dueño', async () => {
            mockRepository.findById.mockResolvedValue(DELETED_COMPLEX as any)

            await expect(service.restore(OTHER_OWNER, 1))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.restore).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  hardDelete()
    // ═════════════════════════════════════════════════════════
    describe('hardDelete()', () => {

        const DELETED_COMPLEX = { ...FAKE_COMPLEX, deletedAt: new Date() }

        it('debe eliminar permanentemente un complejo que ya fue soft-deleted', async () => {
            mockRepository.findById.mockResolvedValue(DELETED_COMPLEX as any)
            mockRepository.hardDelete.mockResolvedValue(DELETED_COMPLEX as any)

            const result = await service.hardDelete(OWNER_USER, 1)

            expect(mockRepository.hardDelete).toHaveBeenCalledWith(1)
            expect(result).toBeTruthy()
        })

        it('debe lanzar AppError 400 si el complejo NO está eliminado previamente', async () => {
            mockRepository.findById.mockResolvedValue(FAKE_COMPLEX as any)

            await expect(service.hardDelete(OWNER_USER, 1))
                .rejects
                .toMatchObject({
                    message: 'El complejo no está eliminado',
                    statusCode: 400,
                })

            expect(mockRepository.hardDelete).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 404 si el complejo no existe', async () => {
            mockRepository.findById.mockResolvedValue(null)

            await expect(service.hardDelete(OWNER_USER, 999))
                .rejects
                .toMatchObject({ statusCode: 404 })
        })

        it('debe lanzar AppError 403 si no es el dueño ni admin', async () => {
            mockRepository.findById.mockResolvedValue(DELETED_COMPLEX as any)

            await expect(service.hardDelete(OTHER_OWNER, 1))
                .rejects
                .toMatchObject({ statusCode: 403 })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  updateStatus()
    // ═════════════════════════════════════════════════════════
    describe('updateStatus()', () => {

        it('debe permitir a un ADMIN cambiar el status del complejo', async () => {
            mockRepository.update.mockResolvedValue({ ...FAKE_COMPLEX, status: 'APPROVED' } as any)

            const result = await service.updateStatus(ADMIN_USER, 1, 'APPROVED')

            expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'APPROVED' })
            expect(result.status).toBe('APPROVED')
        })

        it('debe lanzar AppError 403 si el usuario NO es ADMIN', async () => {
            await expect(service.updateStatus(OWNER_USER, 1, 'APPROVED'))
                .rejects
                .toMatchObject({
                    message: 'Acción no autorizada. Solo Administradores',
                    statusCode: 403,
                })

            expect(mockRepository.update).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  updateSchedules()
    // ═════════════════════════════════════════════════════════
    describe('updateSchedules()', () => {

        const NEW_SCHEDULES = [
            { dayOfWeek: 1, startTime: '10:00', endTime: '23:00' },
            { dayOfWeek: 5, startTime: '14:00', endTime: '22:00' },
        ]

        it('debe actualizar los schedules cuando el owner es válido', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.updateSchedules.mockResolvedValue(NEW_SCHEDULES as any)

            const result = await service.updateSchedules(1, OWNER_USER, NEW_SCHEDULES)

            expect(mockRepository.findActiveById).toHaveBeenCalledWith(1)
            expect(mockRepository.updateSchedules).toHaveBeenCalledWith(FAKE_COMPLEX.id, NEW_SCHEDULES)
            expect(result).toEqual(NEW_SCHEDULES)
        })

        it('debe lanzar AppError 404 si el complejo no existe', async () => {
            mockRepository.findActiveById.mockResolvedValue(null)

            await expect(service.updateSchedules(999, OWNER_USER, NEW_SCHEDULES))
                .rejects
                .toMatchObject({ statusCode: 404 })

            expect(mockRepository.updateSchedules).not.toHaveBeenCalled()
        })

        it('debe lanzar AppError 403 si no es el dueño', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)

            await expect(service.updateSchedules(1, OTHER_OWNER, NEW_SCHEDULES))
                .rejects
                .toMatchObject({ statusCode: 403 })

            expect(mockRepository.updateSchedules).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findByComplex()
    // ═════════════════════════════════════════════════════════
    describe('findByComplex()', () => {

        it('debe delegar al repository para buscar canchas por complexId', async () => {
            const fakeCourts = [{ id: 1, name: 'Cancha 1' }]
            mockRepository.findCourtsById.mockResolvedValue(fakeCourts as any)

            const result = await service.findByComplex(1)

            expect(mockRepository.findCourtsById).toHaveBeenCalledWith(1)
            expect(result).toEqual(fakeCourts)
        })
    })


    // ═════════════════════════════════════════════════════════
    //  getComplexOrThrow() — probado indirectamente
    // ═════════════════════════════════════════════════════════
    describe('getComplexOrThrow() (método privado, test indirecto)', () => {

        it('debe validar ownership correctamente — ADMIN puede operar sobre cualquier complejo', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)
            mockRepository.update.mockResolvedValue(FAKE_COMPLEX as any)

            // ADMIN no es ownerId=10, pero tiene role ADMIN → no debe lanzar error
            await expect(service.update({}, ADMIN_USER, 1)).resolves.toBeTruthy()
        })

        it('debe rechazar a un OWNER que no sea dueño de ese complejo', async () => {
            mockRepository.findActiveById.mockResolvedValue(FAKE_COMPLEX as any)

            // OTHER_OWNER (id=30) no es el dueño (ownerId=10)
            await expect(service.update({}, OTHER_OWNER, 1))
                .rejects
                .toMatchObject({
                    message: 'Acción no válida. No eres dueño de este complejo.',
                    statusCode: 403,
                })
        })
    })
})
