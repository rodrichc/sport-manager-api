import type { Request, Response, NextFunction } from 'express'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export const parsePagination = (req: Request, _res: Response, next: NextFunction) => {
    const rawPage = req.query.page
    const rawPageSize = req.query.pageSize

    // No pagination params = full dataset (backward compat)
    if (rawPage === undefined && rawPageSize === undefined) {
        return next()
    }

    const page = Math.max(1, parseInt(rawPage as string, 10) || 1)
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(rawPageSize as string, 10) || DEFAULT_PAGE_SIZE),
    )

    // Cast to any — pagination property is declared in express.d.ts but ts-node doesn't pick it up
    ;(req as any).pagination = {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize,
    }

    next()
}
