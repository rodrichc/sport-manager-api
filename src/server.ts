import express from "express"
import cors from 'cors'
import 'dotenv/config'
import swaggerUi from 'swagger-ui-express'
import router from "./router"
import { corsConfig } from "./config/cors"
import { errorHandler } from "./middleware/errors"
import { swaggerSpec, swaggerUiOptions } from "./config/swagger"


const app = express()

app.use(cors(corsConfig))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))
app.use('/api/v1', router)

app.use(errorHandler)

export default app