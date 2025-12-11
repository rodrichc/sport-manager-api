import { Router } from 'express'
import { CourtController } from './court.controller'
import { authenticate } from '../../middleware/authenticate'
import { optionalAuthenticate } from '../../middleware/optionalAuth'
import { validateCreateCourt } from './court.validator'

const router = Router()

router.post('/',
    authenticate, 
    validateCreateCourt, 
    CourtController.create)

router.get('/', 
    optionalAuthenticate, 
    CourtController.getCourts)

router.patch('/:id', authenticate, CourtController.updateCourt)

router.delete('/:id', authenticate, CourtController.deleteCourt)

router.get('/my-courts', authenticate, CourtController.getMyCourts)


export default router