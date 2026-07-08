import jwt, {JwtPayload, SignOptions} from 'jsonwebtoken'

export const generateJWT = (payload: JwtPayload, secretKey: string, expiresIn: SignOptions['expiresIn']) => {

    const token = jwt.sign(payload, secretKey, {
        expiresIn
    })

    return token
}