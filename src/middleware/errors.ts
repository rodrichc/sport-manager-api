import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { Prisma } from "@prisma/client";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }

    console.error('ERROR 💥:', err); 
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
};