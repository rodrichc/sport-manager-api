import express from "express"
import cors from 'cors'
import 'dotenv/config'
import router from "./router"
import { corsConfig } from "./config/cors"
import { errorHandler } from "./middleware/errors"


const app = express()

app.use(cors(corsConfig))
app.use(express.json())

// Routing
app.use('/api/v1', router)

app.use(errorHandler)

export default app