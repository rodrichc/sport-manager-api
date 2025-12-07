import { Router } from 'express'
import { CourtController } from './court.controller'
import { authenticate } from '../../middleware/authenticate'

const router = Router()

router.post('/', authenticate, CourtController.create)

export default router