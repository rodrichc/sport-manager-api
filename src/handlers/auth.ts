import { Request, Response } from "express"
import slug from 'slug'
import { db } from "../config/db"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"


export const createAccount = async (req: Request, res: Response) => {

    const { password, email, name, role, phoneNumber } = req.body

    try {
        const emailExist = await db.user.findUnique({
            where: { email }
        })

        if(emailExist) {
            const error = new Error('El Email ya está registrado')
            return res.status(409).json({error: error.message})
        }


        const username = slug(req.body.username, '')

        const usernameExist = await db.user.findUnique({
            where: { username }
        })

        if(usernameExist) {
            const error = new Error('El Nombre de Usuario ya está registrado')
            return res.status(409).json({error: error.message})
        }


        if (role === 'OWNER' && !phoneNumber) {
             const error = new Error('Los dueños deben registrar un teléfono de contacto')
             return res.status(400).json({error: error.message})
        }

        const hashedPassword = await hashPassword(password)

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                username,
                role,
                phoneNumber
            }
        })

        // Enviar mail de confirmación (proximamente)


        res.status(201).json('Cuenta creada correctamente')

    } catch (error) {
        res.status(500).json({error: 'Hubo un error al crear la cuenta'})
    }
}


export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    try {
        const user = await db.user.findUnique({
            where: { email }
        })

        if(!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({error: error.message})
        }

        // Revisar si está confirmado (Proximamente)
        /* if(!user.confirmed) {
            const error = new Error('Tu cuenta no ha sido confirmada')
            return res.status(403).json({error: error.message})
        }
        */

        const isPasswordCorrect = await checkPassword(password, user.password)

        if(!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            return res.status(403).json({error: error.message})
        }

        const token = generateJWT({ 
            id: user.id 
        })

        res.send(token)

    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}


export const getUser = async (req: Request, res: Response) => {
    res.json(req.user) 
}


export const becomeOwner = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body
    const { id } = req.user!

    try {

        if (req.user?.role === 'OWNER') {
             return res.status(400).json({error: 'Ya sos dueño.'})
        }

        const user = await db.user.update({
            where: { id },
            data: {
                role: 'OWNER',
                phoneNumber 
            }
        })

        res.json({ msg: '¡Felicitaciones! Ahora podes administrar tus complejos deportivos.' })

    } catch (error) {
        res.status(500).json({error: 'Hubo un error al actualizar el perfil'})
    }
}