import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validateCreateCourt } from './court.validator'
import { courtController } from './courts.dependencies'

const router = Router()

router.post('/',
    authenticate, 
    validateCreateCourt, 
    courtController.create)

router.get('/', courtController.getCourts)

// router.patch('/:id', authenticate, courtController.updateCourt)

// router.delete('/:id', authenticate, courtController.deleteCourt)

// router.get('/my-courts', authenticate, courtController.getMyCourts)


export default router
