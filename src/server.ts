import express from "express"
import cors from 'cors'
import 'dotenv/config' //para que nodemon lea las variables de entorno
import router from "./router"
import { corsConfig } from "./config/cors"
const app = express()

// Cors
app.use(cors(corsConfig))

// Leer datos de formularios
app.use(express.json())


// Routing
app.use('/api/v1', router)


export default app