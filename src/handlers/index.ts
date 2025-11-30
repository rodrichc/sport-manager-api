import { Request, Response } from "express"
import slug from 'slug'
import { db } from "../config/db"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"


export const createAccount = async (req: Request, res: Response) => {
    const { password, email, name, role } = req.body

    try {
        // Corrobora si el usuario, email, ya esta registrado
        const emailExist = await db.user.findUnique({
            where: { email }
        })

        if(emailExist) {
            const error = new Error('El Email ya está registrado')
            return res.status(409).json({error: error.message})
        }

        //Formateo de nombre de usuario
        const username = slug(req.body.username, '')

        // Corrobora el username está registrado
        const usernameExist = await db.user.findUnique({
            where: { username }
        })

        if(usernameExist) {
            const error = new Error('El Nombre de Usuario ya está registrado')
            return res.status(409).json({error: error.message})
        }

        //Hasheo password
        const hashedPassword = await hashPassword(password)

        //Crear usuario en base de datos
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                username,
                role
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
        // Buscar al usuario
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

        // Comprobar password
        const isPasswordCorrect = await checkPassword(password, user.password)


        if(!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            return res.status(403).json({error: error.message})
        }

        
        // 4. Generar Token (JWT)
        const token = generateJWT({ 
            id: user.id 
        })

        // 5. Mandar el token al cliente
        res.send(token)

    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}