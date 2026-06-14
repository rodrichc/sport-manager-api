import { AuthService } from '../auth.service'
import { AuthRepository } from '../auth.repository'
import { AppError } from '../../../utils/appError'

// ─────────────────────────────────────────────────────────────
//  Mocks de los módulos utilitarios
//  Mockeamos bcrypt (hashPassword/checkPassword), JWT y slugify
//  para aislar completamente el Service de dependencias externas.
// ─────────────────────────────────────────────────────────────
jest.mock('../../../utils/auth', () => ({
    hashPassword: jest.fn(),
    checkPassword: jest.fn(),
}))

jest.mock('../../../utils/jwt', () => ({
    generateJWT: jest.fn(),
}))

jest.mock('../../../utils/slugify', () => ({
    createUsername: jest.fn(),
}))

import { hashPassword, checkPassword } from '../../../utils/auth'
import { generateJWT } from '../../../utils/jwt'
import { createUsername } from '../../../utils/slugify'


// ─────────────────────────────────────────────────────────────
//  Mock del AuthRepository (inyectado vía constructor)
// ─────────────────────────────────────────────────────────────
const mockRepository: jest.Mocked<AuthRepository> = {
    findUserForEmail: jest.fn(),
    findUserForUsername: jest.fn(),
    createUser: jest.fn(),
    updateToOwner: jest.fn(),
} as unknown as jest.Mocked<AuthRepository>


describe('AuthService', () => {

    let service: AuthService

    beforeEach(() => {
        jest.clearAllMocks()
        service = new AuthService(mockRepository)

        // Re-configurar los mocks de utilidades (resetMocks: true los limpia)
        ;(hashPassword as jest.Mock).mockResolvedValue('hashed_password_123')
        ;(generateJWT as jest.Mock).mockReturnValue('fake.jwt.token')
        ;(createUsername as jest.Mock).mockImplementation(
            (text: string) => text.toLowerCase().replace(/\s/g, '')
        )
    })


    // ═════════════════════════════════════════════════════════
    //  createAccount()
    // ═════════════════════════════════════════════════════════
    describe('createAccount()', () => {

        const VALID_DTO = {
            name: 'Rodrigo Chavez',
            email: 'rodrigo@test.com',
            password: 'SecurePass123',
            username: 'rodrichc',
            role: 'USER',
            phoneNumber: null,
        }

        const CREATED_USER = {
            id: 1,
            name: VALID_DTO.name,
            email: VALID_DTO.email,
            username: 'rodrichc',
            role: 'USER',
            password: 'hashed_password_123',
            confirmed: false,
            phoneNumber: null,
        }


        it('debe crear una cuenta exitosamente y retornar el usuario sin la contraseña', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(null)
            mockRepository.findUserForUsername.mockResolvedValue(null)
            mockRepository.createUser.mockResolvedValue(CREATED_USER as any)

            const result = await service.createAccount(VALID_DTO as any)

            // Verificar que se hasheó la contraseña
            expect(hashPassword).toHaveBeenCalledWith(VALID_DTO.password)

            // Verificar que se procesó el username con slugify
            expect(createUsername).toHaveBeenCalledWith(VALID_DTO.username)

            // Verificar que se creó el usuario con el password hasheado
            expect(mockRepository.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: VALID_DTO.name,
                    email: VALID_DTO.email,
                    password: 'hashed_password_123',
                    username: 'rodrichc',
                    role: 'USER',
                })
            )

            // Verificar que retorna el UserSafe (sin password)
            expect(result).toEqual({
                id: 1,
                name: VALID_DTO.name,
                email: VALID_DTO.email,
                username: 'rodrichc',
                role: 'USER',
            })

            // Verificar que NO incluye la contraseña en el retorno
            expect(result).not.toHaveProperty('password')
        })


        it('debe lanzar AppError 409 si el email ya está en uso', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(CREATED_USER as any)

            await expect(service.createAccount(VALID_DTO as any))
                .rejects
                .toThrow(AppError)

            await expect(service.createAccount(VALID_DTO as any))
                .rejects
                .toMatchObject({
                    message: 'El email ya está en uso',
                    statusCode: 409,
                })

            // No debe intentar crear el usuario
            expect(mockRepository.createUser).not.toHaveBeenCalled()
        })


        it('debe lanzar AppError 409 si el username ya está registrado', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(null)
            mockRepository.findUserForUsername.mockResolvedValue(CREATED_USER as any)

            await expect(service.createAccount(VALID_DTO as any))
                .rejects
                .toMatchObject({
                    message: 'El nombre de usuario ya está registrado',
                    statusCode: 409,
                })

            expect(mockRepository.createUser).not.toHaveBeenCalled()
        })


        it('debe lanzar AppError 400 si el rol es OWNER y no tiene phoneNumber', async () => {
            const ownerWithoutPhone = {
                ...VALID_DTO,
                role: 'OWNER',
                phoneNumber: null,
            }

            mockRepository.findUserForEmail.mockResolvedValue(null)
            mockRepository.findUserForUsername.mockResolvedValue(null)

            await expect(service.createAccount(ownerWithoutPhone as any))
                .rejects
                .toMatchObject({
                    message: 'Los dueños deben registrar un teléfono de contacto',
                    statusCode: 400,
                })

            expect(mockRepository.createUser).not.toHaveBeenCalled()
        })


        it('debe permitir crear un OWNER cuando SÍ tiene phoneNumber', async () => {
            const ownerWithPhone = {
                ...VALID_DTO,
                role: 'OWNER',
                phoneNumber: '1155667788',
            }

            const createdOwner = {
                ...CREATED_USER,
                role: 'OWNER',
                phoneNumber: '1155667788',
            }

            mockRepository.findUserForEmail.mockResolvedValue(null)
            mockRepository.findUserForUsername.mockResolvedValue(null)
            mockRepository.createUser.mockResolvedValue(createdOwner as any)

            const result = await service.createAccount(ownerWithPhone as any)

            expect(result.role).toBe('OWNER')
            expect(mockRepository.createUser).toHaveBeenCalledTimes(1)
        })


        it('debe verificar el email ANTES que el username (orden de validaciones)', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(CREATED_USER as any)

            await expect(service.createAccount(VALID_DTO as any)).rejects.toThrow()

            // findUserForEmail se llamó, pero findUserForUsername NO
            // porque el flujo se cortó antes
            expect(mockRepository.findUserForEmail).toHaveBeenCalledTimes(1)
            expect(mockRepository.findUserForUsername).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  login()
    // ═════════════════════════════════════════════════════════
    describe('login()', () => {

        const LOGIN_DTO = {
            email: 'rodrigo@test.com',
            password: 'SecurePass123',
        }

        const EXISTING_USER = {
            id: 1,
            name: 'Rodrigo Chavez',
            email: 'rodrigo@test.com',
            username: 'rodrichc',
            password: 'hashed_stored_password',
            role: 'USER',
            confirmed: false,
            phoneNumber: null,
        }


        it('debe retornar un JWT válido cuando las credenciales son correctas', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(EXISTING_USER as any);
            (checkPassword as jest.Mock).mockResolvedValue(true)

            const result = await service.login(LOGIN_DTO)

            // Verificar que buscó al usuario por email
            expect(mockRepository.findUserForEmail).toHaveBeenCalledWith(LOGIN_DTO.email)

            // Verificar que comparó la contraseña ingresada con el hash guardado
            expect(checkPassword).toHaveBeenCalledWith(
                LOGIN_DTO.password,
                EXISTING_USER.password
            )

            // Verificar que generó el JWT con el id del usuario
            expect(generateJWT).toHaveBeenCalledWith({ id: EXISTING_USER.id })

            // Verificar que retorna el token
            expect(result).toBe('fake.jwt.token')
        })


        it('debe lanzar AppError 404 si el usuario no existe', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(null)

            await expect(service.login(LOGIN_DTO))
                .rejects
                .toThrow(AppError)

            await expect(service.login(LOGIN_DTO))
                .rejects
                .toMatchObject({
                    message: 'El usuario no existe',
                    statusCode: 404,
                })

            // No debe intentar verificar la contraseña
            expect(checkPassword).not.toHaveBeenCalled()
        })


        it('debe lanzar AppError 403 si la contraseña es incorrecta', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(EXISTING_USER as any);
            (checkPassword as jest.Mock).mockResolvedValue(false)

            await expect(service.login(LOGIN_DTO))
                .rejects
                .toThrow(AppError)

            await expect(service.login(LOGIN_DTO))
                .rejects
                .toMatchObject({
                    message: 'Contraseña incorrecta',
                    statusCode: 403,
                })

            // No debe generar el JWT
            expect(generateJWT).not.toHaveBeenCalled()
        })


        it('no debe generar JWT si el usuario no existe (flujo cortocircuito)', async () => {
            mockRepository.findUserForEmail.mockResolvedValue(null)

            await expect(service.login(LOGIN_DTO)).rejects.toThrow()

            expect(checkPassword).not.toHaveBeenCalled()
            expect(generateJWT).not.toHaveBeenCalled()
        })
    })


    // ═════════════════════════════════════════════════════════
    //  becomeOwner()
    // ═════════════════════════════════════════════════════════
    describe('becomeOwner()', () => {

        const USER_SAFE = {
            id: 1,
            name: 'Rodrigo Chavez',
            email: 'rodrigo@test.com',
            username: 'rodrichc',
            role: 'USER',
        }

        const PHONE_NUMBER = '1155667788'


        it('debe actualizar a OWNER exitosamente cuando el usuario es USER', async () => {
            const updatedUser = { ...USER_SAFE, role: 'OWNER', phoneNumber: PHONE_NUMBER }
            mockRepository.updateToOwner.mockResolvedValue(updatedUser as any)

            const result = await service.becomeOwner(USER_SAFE as any, PHONE_NUMBER)

            expect(mockRepository.updateToOwner).toHaveBeenCalledWith(
                USER_SAFE.id,
                PHONE_NUMBER
            )
            expect(result).toMatchObject({ role: 'OWNER' })
        })


        it('debe lanzar AppError 400 si el usuario ya es OWNER', async () => {
            const ownerUser = { ...USER_SAFE, role: 'OWNER' }

            await expect(service.becomeOwner(ownerUser as any, PHONE_NUMBER))
                .rejects
                .toThrow(AppError)

            await expect(service.becomeOwner(ownerUser as any, PHONE_NUMBER))
                .rejects
                .toMatchObject({
                    message: 'Ya sos dueño',
                    statusCode: 400,
                })

            // No debe intentar actualizar
            expect(mockRepository.updateToOwner).not.toHaveBeenCalled()
        })
    })
})
