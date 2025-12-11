import { Request, Response } from "express"
import { CourtService } from "./court.service"
import { CreateCourtDTO, userId } from "./court.types";

export const CourtController = {
    create: async (req: Request, res: Response) => {
        const userId: userId = req.user?.id;
        const courtData: CreateCourtDTO = req.body;

        try {

            const newCourt = await CourtService.createCourt(userId, courtData);
            
            res.status(201).json({ 
                message: 'Cancha creada con éxito', 
                data: newCourt 
            });

        } catch (error) {
            if (error.message === 'PERMISO_DENEGADO') {
                return res.status(403).json({ error: 'No tenés permiso para crear canchas en este complejo' });
            }
            console.error(error);
            res.status(500).json({ error: 'Error al crear la cancha' });
        }
    },

    getCourts: async (req: Request, res: Response) => {
        
    },

    updateCourt: async (req: Request, res: Response) => {
        
    },

    deleteCourt: async (req: Request, res: Response) => {
        
    },

    getMyCourts: async (req: Request, res: Response) => {
        
    },
}