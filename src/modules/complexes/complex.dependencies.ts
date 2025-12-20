import { ComplexController } from "./complex.controller"
import { ComplexRepository } from "./complex.repository"
import { ComplexService } from "./complex.service"

const complexRepository = new ComplexRepository()
const complexService = new ComplexService(complexRepository)
const complexController = new ComplexController(complexService)

export { complexController }