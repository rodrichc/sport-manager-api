import { paginateResponse } from '../paginate'

describe('paginateResponse()', () => {

    it('debe crear una respuesta paginada con los datos provistos', () => {
        const items = [{ id: 1 }, { id: 2 }]
        const result = paginateResponse(items, 20, 1, 10)

        expect(result).toEqual({
            data: items,
            pagination: {
                page: 1,
                pageSize: 10,
                total: 20,
                totalPages: 2,
            },
        })
    })

    it('debe calcular totalPages correctamente cuando es exacto', () => {
        const result = paginateResponse([], 20, 2, 10)

        expect(result.pagination.totalPages).toBe(2)
    })

    it('debe calcular totalPages redondeando hacia arriba', () => {
        const result = paginateResponse([], 21, 1, 10)

        expect(result.pagination.totalPages).toBe(3)
    })

    it('debe manejar página vacía correctamente', () => {
        const result = paginateResponse([], 0, 1, 10)

        expect(result).toEqual({
            data: [],
            pagination: {
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
            },
        })
    })

    it('debe funcionar con diferentes valores de page y pageSize', () => {
        const items = [{ id: 3 }, { id: 4 }, { id: 5 }]
        const result = paginateResponse(items, 13, 3, 5)

        expect(result).toEqual({
            data: items,
            pagination: {
                page: 3,
                pageSize: 5,
                total: 13,
                totalPages: 3,
            },
        })
    })
})
