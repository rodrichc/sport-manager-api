import type { Request } from 'express'

export interface PaginationQuery {
    page: number
    pageSize: number
    skip: number
    take: number
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export interface PaginatedResult<T> {
    items: T[]
    total: number
}

/**
 * Extract pagination params from request.
 * Returns undefined if no pagination params were provided (backward compat).
 */
export function getPagination(req: Request): PaginationQuery | undefined {
    return (req as any).pagination as PaginationQuery | undefined
}
