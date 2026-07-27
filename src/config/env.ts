var missingVars : string[] = []

const variablesName = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
]

variablesName.forEach(variableName => {
    if(!process.env[variableName]){
        missingVars.push(variableName)
    }
})

if(missingVars.length > 0) {
    console.error('Faltan variables de entorno: ', missingVars)

    process.exit(1)
}

export const env = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
}