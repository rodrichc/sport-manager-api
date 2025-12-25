import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validateCreateCourt } from './court.validator'
import { courtController } from './court.dependencies'
import { validateId } from '../../validators/common'

const router = Router()

router.post('/',
    authenticate, 
    validateCreateCourt, 
    courtController.create)
    
router.get('/', courtController.getAll)

router.get('/my-courts', authenticate, courtController.getUserCourts)
router.get('/deleted', authenticate, courtController.getDeletedUserCourts)

router.patch('/:id/restore', authenticate, validateId, courtController.restore)
router.delete('/:id/force', authenticate, validateId, courtController.hardDelete)

    
router.get('/:id', validateId, courtController.getById)
router.patch('/:id', authenticate, validateId, courtController.update)
router.delete('/:id', authenticate, validateId, courtController.delete)


export default router
