declare global {
    namespace Express {
        interface Request {
            pagination?: {
                page: number
                pageSize: number
                skip: number
                take: number
            }
        }
    }
}

export {}
