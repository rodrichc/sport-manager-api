import type { Request, Response, NextFunction } from 'express'

// ─────────────────────────────────────────────────────────────
//  Mocks — se colocan antes del import del middleware para
//  que Jest los hoistee antes de que se resuelvan los imports.
// ─────────────────────────────────────────────────────────────
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    JsonWebTokenError: class JsonWebTokenError extends Error {
        constructor(msg: string) {
            super(msg)
            this.name = 'JsonWebTokenError'
        }
    },
}))

jest.mock('../../config/db', () => ({
    db: {
        user: {
            findUnique: jest.fn(),
        },
    },
}))

import jwt from 'jsonwebtoken'
import { db } from '../../config/db'
import { authenticate } from '../authenticate'

const mockDb = db as jest.Mocked<typeof db>
const mockUser = mockDb.user as jest.Mocked<typeof mockDb.user>

describe('authenticate middleware — 2FA status field', () => {

    let mockReq: Partial<Request>
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        jest.clearAllMocks()
        mockReq = {
            headers: { authorization: 'Bearer valid-test-token' },
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json:   jest.fn(),
        }
        mockNext = jest.fn()
    })

    // ─────────────────────────────────────────────────────────
    //  Task 1.1 — RED: isTwoFactorEnabled debe estar en select
    // ─────────────────────────────────────────────────────────
    it('debe incluir isTwoFactorEnabled en la consulta a la base de datos', async () => {
        ;(jwt.verify as jest.Mock).mockReturnValue({ id: 1, isTemp: false })
        ;(mockUser.findUnique as jest.Mock).mockResolvedValue({
            id:                 1,
            name:               'Test User',
            username:           'testuser',
            email:              'test@test.com',
            role:               'USER',
            isTwoFactorEnabled: false,
        })

        await authenticate(mockReq as Request, mockRes as Response, mockNext)

        // RED: esta aserción FALLARÁ porque el middleware no incluye
        // isTwoFactorEnabled en el select de Prisma.
        expect(mockUser.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                select: expect.objectContaining({
                    isTwoFactorEnabled: true,
                }),
            })
        )
    })
})
