import { AuthRepository } from '../auth.repository'
import { db } from '../../../config/db'

// ─────────────────────────────────────────────────────────────
//  Mock del módulo de Prisma Client
// ─────────────────────────────────────────────────────────────
jest.mock('../../../config/db', () => ({
    db: {
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}))

const mockDb = db as jest.Mocked<typeof db>
const mockUser = mockDb.user as jest.Mocked<typeof mockDb.user>

describe('AuthRepository', () => {

    let repository: AuthRepository

    const FAKE_USER = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed_password',
        role: 'USER',
        confirmed: false,
        phoneNumber: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        repository = new AuthRepository()
    })


    // ═════════════════════════════════════════════════════════
    //  findUserForEmail
    // ═════════════════════════════════════════════════════════
    describe('findUserForEmail()', () => {

        it('debe retornar el usuario cuando existe el email', async () => {
            (mockUser.findFirst as jest.Mock).mockResolvedValue(FAKE_USER)

            const result = await repository.findUserForEmail('test@test.com')

            expect(mockUser.findFirst).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
            })
            expect(result).toEqual(FAKE_USER)
        })

        it('debe retornar null cuando no existe el email', async () => {
            (mockUser.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findUserForEmail('noexiste@test.com')

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  findUserForUsername
    // ═════════════════════════════════════════════════════════
    describe('findUserForUsername()', () => {

        it('debe retornar el usuario cuando existe el username', async () => {
            (mockUser.findFirst as jest.Mock).mockResolvedValue(FAKE_USER)

            const result = await repository.findUserForUsername('testuser')

            expect(mockUser.findFirst).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            })
            expect(result).toEqual(FAKE_USER)
        })

        it('debe retornar null cuando no existe el username', async () => {
            (mockUser.findFirst as jest.Mock).mockResolvedValue(null)

            const result = await repository.findUserForUsername('fantasma')

            expect(result).toBeNull()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  createUser
    // ═════════════════════════════════════════════════════════
    describe('createUser()', () => {

        it('debe llamar a db.user.create con los datos correctos y retornar el usuario', async () => {
            const createData = {
                name: 'Nuevo User',
                email: 'nuevo@test.com',
                password: 'hashed_123',
                username: 'nuevouser',
                role: 'USER',
                phoneNumber: null,
            };

            (mockUser.create as jest.Mock).mockResolvedValue({ id: 2, ...createData })

            const result = await repository.createUser(createData as any)

            expect(mockUser.create).toHaveBeenCalledWith({ data: createData })
            expect(result).toMatchObject({ id: 2, email: 'nuevo@test.com' })
        })
    })


    // ═════════════════════════════════════════════════════════
    //  updateToOwner
    // ═════════════════════════════════════════════════════════
    describe('updateToOwner()', () => {

        it('debe actualizar el rol a OWNER y asignar el phoneNumber', async () => {
            const updatedUser = { ...FAKE_USER, role: 'OWNER', phoneNumber: '1155667788' };
            (mockUser.update as jest.Mock).mockResolvedValue(updatedUser)

            const result = await repository.updateToOwner(1, '1155667788')

            expect(mockUser.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { role: 'OWNER', phoneNumber: '1155667788' },
            })
            expect(result.role).toBe('OWNER')
            expect(result.phoneNumber).toBe('1155667788')
        })
    })
})
