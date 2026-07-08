import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 5, 
    statusCode: 429,
    message: { error: 'Código ingresado incorrectamente muchas veces, intenta más tarde.'},
})