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
