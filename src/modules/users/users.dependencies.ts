import { CloudinaryStorageService } from "../../services/storage/CloudinaryStorageService"
import { UsersController } from "./users.controller"
import { UsersRepository } from "./users.repository"
import { UsersService } from "./users.service"

const usersRepository = new UsersRepository()
const storageService = new CloudinaryStorageService();
const usersService = new UsersService(usersRepository, storageService)
export const usersController = new UsersController(usersService)
