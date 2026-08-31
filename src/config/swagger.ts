import swaggerJSDoc from 'swagger-jsdoc'
import { SwaggerUiOptions } from 'swagger-ui-express'
import { env } from './env'

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sport Manager API',
            version: '1.0.0',
            description: 'API RESTful para gestión de reservas y canchas',
        },
        servers: [
            {
                url: `${env.BACKEND_URL}/api/v1`,
                description: 'Servidor Local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/**/*.docs.ts'], 
}

export const swaggerSpec = swaggerJSDoc(options)

export const swaggerUiOptions: SwaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Documentación Turnero"
}