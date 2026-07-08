import crypto from 'crypto'


export async function generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex')
}