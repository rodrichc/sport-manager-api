import crypto from 'crypto'

export async function generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex')
}

export async function generateHashedToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateEncrypted(secret: string): {encryptedSecret: string, iv: string}{
    const keyString = process.env.ENCRYPTION_2FA_KEY;
    if (!keyString) {
        throw new Error('ENCRYPTION_2FA_KEY no está definida en las variables de entorno.');
    }

    const key = Buffer.from(keyString, 'utf-8'); 
    if (key.length !== 32) {
        throw new Error(`ERROR: La clave de encriptación debe tener exactamente 32 bytes. La tuya tiene: ${key.length} bytes.`);
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    let encrypted = cipher.update(secret, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
        encryptedSecret: encrypted,
        iv: iv.toString('hex')
    }
}

export function decryptData(encryptedData: string, iv: string): string {
    const keyString = process.env.ENCRYPTION_2FA_KEY;
    if (!keyString) {
        throw new Error('ENCRYPTION_2FA_KEY no está definida en las variables de entorno.');
    }

    const key = Buffer.from(keyString, 'utf-8'); 
    if (key.length !== 32) {
        throw new Error(`ERROR: La clave de encriptación debe tener exactamente 32 bytes. La tuya tiene: ${key.length} bytes.`);
    }

    const ivBuffer = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
