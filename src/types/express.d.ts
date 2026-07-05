import { PaginationQuery } from './pagination'

declare global {
    namespace Express {
        interface Request {
            pagination?: PaginationQuery
        }
    }
}

export {}
