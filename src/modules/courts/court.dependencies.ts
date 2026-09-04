import { CourtRepository } from "./court.repository"
import { CourtService } from "./court.service"
import { CourtController } from "./court.controller"
import { CloudinaryStorageService } from "../../services/storage/CloudinaryStorageService"

const courtRepository = new CourtRepository()
const storageService = new CloudinaryStorageService()
const courtService = new CourtService(courtRepository, storageService)
const courtController = new CourtController(courtService)

export { courtController }
