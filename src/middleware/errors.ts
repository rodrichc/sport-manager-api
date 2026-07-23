import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { Prisma } from "@prisma/client";
import multer from "multer";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {

    // 1. Errores operacionales controlados (AppError)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // 2. Errores de Multer (tamaño, límites, etc.)
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'El archivo es demasiado grande. El límite es 5MB.'
            });
        }
        return res.status(400).json({
            status: 'error',
            message: `Error al subir el archivo: ${err.message}`
        });
    }

    // 3. Errores personalizados tirados desde fileFilter (Error común con mensaje amigable)
    if (err instanceof Error && err.message.includes('Invalid file type')) {
        return res.status(400).json({
            status: 'error',
            message: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WEBP).'
        });
    }

    // 4. Errores de Prisma mapeados por código
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[])?.join(', ') || 'campo';
            return res.status(409).json({
                status: 'error',
                message: `Ya existe un registro con ese ${target}.`
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'El registro solicitado no fue encontrado.'
            });
        }
        return res.status(400).json({
            status: 'error',
            message: 'Error en la solicitud de base de datos.'
        });
    }

    // 5. Errores no controlados o del sistema (500)
    console.error('ERROR 💥:', err); 
    return res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error interno en el servidor.'
    });
};