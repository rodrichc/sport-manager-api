import { Request, Response } from "express"
import { db } from "../config/db"


export const createComplex = async (req: Request, res: Response) => {
    const { name, address, openTime, closeTime } = req.body

    try {
        if(req.user?.role !== "OWNER"){
            const error = new Error('Debe tener una cuenta del dipo Dueño para crear un Complejo')
            return res.status(403).json({error: error.message})
        }
        
        await db.complex.create({
            data: {
                name,
                address,
                openTime,
                closeTime,
                ownerId: req.user!.id
            }
        })

        res.status(201).json({msg: "Complejo cargado correctamente, espere por su verificación."})

    } catch (error) {
        res.status(500).json({error: 'Hubo un error al crear el complejo deportivo'})
    }
}


export const getComplexes = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = { 
            status: 'APPROVED',
            deletedAt: null
        }
        let includeOwner: any = undefined

        if (req.user?.role === 'ADMIN') {
            whereCondition = {} 

            //Includes owner information
            includeOwner = {
                owner: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            }
        }

        const complexes = await db.complex.findMany({
            where: whereCondition,
             include: includeOwner 
        })
        
        res.json(complexes)

    } catch (error) {
        res.status(500).json({error: 'Error al obtener los complejos.'})
    }
}


export const updateComplex = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const complex = await db.complex.findUnique({
            where: {
                id: Number(id) 
            }
        })

        if (!complex) {
            const error = new Error('Complejo no encontrado')
            return res.status(404).json({ error: error.message })
        }

        if (complex.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
            const error = new Error('Acción no válida. No eres el dueño de este complejo.')
            return res.status(403).json({ error: error.message })
        }


        const { name, description, address, lat, lng, logo, openTime, closeTime } = req.body


        const updatedComplex = await db.complex.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                description,
                address,
                lat,
                lng,
                logo,
                openTime,
                closeTime
            }
        })

        res.json({
            msg: 'Complejo actualizado correctamente.',
            complex: updatedComplex
        })

    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al actualizar el complejo' })
    }
}


export const deleteComplex = async (req: Request, res: Response) => {
     const { id } = req.params

    try {
        const complex = await db.complex.findUnique({
            where: {
                id: Number(id),
                deletedAt: null
            }
        })

        if (!complex) {
            const error = new Error('Complejo no encontrado')
            return res.status(404).json({ error: error.message })
        }

        if (complex.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
            const error = new Error('Acción no válida. No eres el dueño de este complejo.')
            return res.status(403).json({ error: error.message })
        }


        await db.complex.update({
            where: {
                id: Number(id)
            },
            data: {
                deletedAt: new Date()
            }
        })

        res.json({
            msg: 'Complejo eliminado correctamente.',
        })

    } catch (error) {
        res.status(500).json({error: 'Error al borrar el complejo.'})
    }
}


export const getMyComplexes = async (req: Request, res: Response) => {
    try {
        const myComplexes = await db.complex.findMany({
            where: {
                ownerId: req.user?.id,
                deletedAt: null
            }
        })
    
        res.json(myComplexes)
    } catch (error) {
        res.status(500).json({error: 'Error al obtener complejos'})
    }
}


export const getDeletedComplexes = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        const deleted = await db.complex.findMany({
            where: {
                ownerId: userId,
                deletedAt: { not: null } // <--- EL TRUCO: Solo traer los borrados
            }
        })

        res.json(deleted)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la papelera' })
    }
}


export const restoreComplex = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.user?.id
        
        const complex = await db.complex.findUnique({
            where: { id: Number(id) }
        })

        if (!complex) throw new Error('Complejo no encontrado')
        if (complex.ownerId !== userId && req.user?.role !== "ADMIN") throw new Error('No autorizado')
        if (!complex.deletedAt) throw new Error('El complejo no está eliminado')

        await db.complex.update({
            where: { id: Number(id) },
            data: { deletedAt: null }
        })
        
        res.json({ msg: 'Complejo restaurado', complex })
    } catch (error: any) {
        if (error.message === 'No autorizado') return res.status(403).json({ error: error.message })
        if (error.message === 'Complejo no encontrado') return res.status(404).json({ error: error.message })
        
        res.status(500).json({ error: 'Error al restaurar' })
    }
}
 

export const updateComplexStatus = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body

    try {
        if(req.user?.role !== 'ADMIN') {
            return res.status(403).json({error: 'Acción no autorizada. Solo Administradores.'})
        }

        const complex = await db.complex.update({
            where: { id: +id },
            data: { status }
        })

        res.json(complex)

    } catch (error) {
        res.status(500).json({error: 'Error al actualizar estado'})
    }
}