import crypto from "crypto"
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib"

export function getTotp(email: string = 'user') {
    return new TOTP({
        issuer: 'SportManager',
        label: email,
        crypto: new NobleCryptoPlugin(),
        base32: new ScureBase32Plugin()
    });
}