import { CorsOptions } from 'cors'
import { env } from './env'

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        const whiteList = [env.FRONTEND_URL, env.BACKEND_URL]

        if(process.argv[2] === '--api' || env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if(whiteList.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}