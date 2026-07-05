import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { parsePagination } from '../../middleware/pagination'
import { validateCreateCourt } from './court.validator'
import { courtController } from './court.dependencies'
import { validateId } from '../../validators/common'

const router = Router()

router.post('/',
    authenticate, 
    validateCreateCourt, 
    courtController.create)
    
router.get('/', parsePagination, courtController.getAll)

router.get('/my-courts', authenticate, parsePagination, courtController.getUserCourts)
router.get('/my-deleted', authenticate, parsePagination, courtController.getDeletedUserCourts)

router.patch('/:id/restore', authenticate, validateId, courtController.restore)
router.delete('/:id/force', authenticate, validateId, courtController.hardDelete)

    
router.get('/:id', validateId, courtController.getById)
router.patch('/:id', authenticate, validateId, courtController.update)
router.delete('/:id', authenticate, validateId, courtController.delete)


export default router
