import type { PaginatedResponse } from '../types/pagination'

export const paginateResponse = <T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
): PaginatedResponse<T> => ({
    data: items,
    pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    },
})
