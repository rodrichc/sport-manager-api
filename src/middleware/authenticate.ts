import type { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import { db } from "../config/db"
import { UserSafe } from "../types"
import { env } from "../config/env"

declare global {
    namespace Express {
        interface Request {
            user?: UserSafe
        }
    }
}

export const authenticate = async(req: Request, res: Response, next: NextFunction) => {
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
        const result = jwt.verify(token, env.JWT_SECRET_KEY) as jwt.JwtPayload

        if(typeof result === 'object' && result.id){
            const user = await db.user.findUnique({
                where: { 
                    id: result.id 
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    isTwoFactorEnabled: true
                }
            })

            if(!user) {
                const error = new Error('Usuario No Encontrado')
                return res.status(404).json({error: error.message})
            }

            req.user = user

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