import { CourtRepository } from "./court.repository"
import { CourtService } from "./court.service"
import { CourtController } from "./court.controller"

const courtRepository = new CourtRepository()
const courtService = new CourtService(courtRepository)
const courtController = new CourtController(courtService)

export { courtController }
