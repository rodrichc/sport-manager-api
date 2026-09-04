import { CloudinaryStorageService } from "../../services/storage/CloudinaryStorageService"
import { ComplexController } from "./complex.controller"
import { ComplexRepository } from "./complex.repository"
import { ComplexService } from "./complex.service"

const complexRepository = new ComplexRepository()
const storageService = new CloudinaryStorageService()
const complexService = new ComplexService(complexRepository, storageService)
const complexController = new ComplexController(complexService)

export { complexController }