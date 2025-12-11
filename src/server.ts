import express from "express"
import cors from 'cors'
import 'dotenv/config'
import router from "./router"
import { corsConfig } from "./config/cors"


const app = express()

app.use(cors(corsConfig))
app.use(express.json())

// Routing
app.use('/api/v1', router)


export default app