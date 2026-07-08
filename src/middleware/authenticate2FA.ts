import type { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import { db } from "../config/db"
import { UserId } from "../types"

declare global {
    namespace Express {
        interface Request {
            userId?: UserId
        }
    }
}

export const authenticate2FA= async(req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization

    if(!bearer){
        const error = new Error('No Autorizado')
        return res.status(401).json({error: error.message})
    }

    const [, token] = bearer.split(' ')

    if(!token){
        const error = new Error('No Autorizado')
        return res.status(401).json({error: error.message})
    }

    try {
        const result = jwt.verify(token, process.env.JWT_2FA_SECRET) as jwt.JwtPayload

        if(typeof result === 'object' && result.id){
            req.userId = result.id
            next()
        }
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({error: 'Token No Válido'})
        }
        console.error('[Auth Middleware Error]:', error)
        res.status(500).json({error: 'Error interno de autenticación'})
    }
}