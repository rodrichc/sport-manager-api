import type { Request, Response, NextFunction } from 'express'
import { parsePagination } from '../pagination'

describe('parsePagination', () => {

    let mockReq: Partial<Request>
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        mockReq = { query: {} }
        mockRes = {}
        mockNext = jest.fn()
    })

    it('debe llamar next() sin paginación si no hay query params', () => {
        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination).toBeUndefined()
        expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debe parsear page y pageSize correctamente', () => {
        mockReq.query = { page: '2', pageSize: '20' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination).toEqual({
            page: 2,
            pageSize: 20,
            skip: 20,
            take: 20,
        })
        expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debe usar default page=1 si solo se envía pageSize', () => {
        mockReq.query = { pageSize: '15' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination).toEqual({
            page: 1,
            pageSize: 15,
            skip: 0,
            take: 15,
        })
    })

    it('debe usar default pageSize=9 si solo se envía page', () => {
        mockReq.query = { page: '3' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination).toEqual({
            page: 3,
            pageSize: 9,
            skip: 18,
            take: 9,
        })
    })

    it('debe limitar pageSize a max 45', () => {
        mockReq.query = { pageSize: '100' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination?.pageSize).toBe(45)
        expect(mockReq.pagination?.take).toBe(45)
    })

    it('debe usar mínimo 1 para page', () => {
        mockReq.query = { page: '0', pageSize: '10' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination?.page).toBe(1)
        expect(mockReq.pagination?.skip).toBe(0)
    })

    it('debe usar mínimo 1 para pageSize', () => {
        mockReq.query = { pageSize: '-5' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination?.pageSize).toBe(1)
        expect(mockReq.pagination?.take).toBe(1)
    })

    it('debe manejar valores no numéricos con fallback a defaults (page=1, pageSize=9)', () => {
        mockReq.query = { page: 'abc', pageSize: 'xyz' }

        parsePagination(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.pagination).toEqual({
            page: 1,
            pageSize: 9,
            skip: 0,
            take: 9,
        })
    })
})