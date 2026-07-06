import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { optionalAuthenticate } from "../../middleware/optionalAuth"
import { parsePagination } from "../../middleware/pagination"
import { validateCreateComplex, validateRestoreComplex, validateUpdateComplex, validateUpdateComplexStatus, validateUpdateSchedules } from "./complex.validator"
import { complexController } from "./complex.dependencies"
import reviewRoutes from "../reviews/review.routes"

const router = Router()

//Routing
router.post('/', 
    authenticate,
    validateCreateComplex,
    complexController.create
)
        
router.get('/', 
    optionalAuthenticate, 
    parsePagination,
    complexController.getAll
)

router.get('/my-complexes', 
    authenticate, 
    parsePagination,
    complexController.getMyActiveComplexes
)

router.get('/my-deleted',
    authenticate, 
    parsePagination,
    complexController.getMyDeletedComplexes
)

router.patch('/:id', 
    authenticate,
    validateUpdateComplex,
    complexController.update
)

router.delete('/:id',
    authenticate,
    complexController.delete
)

router.patch('/:id/restore',
    authenticate,
    validateRestoreComplex,
    complexController.restore
)

router.patch('/:id/status', 
    authenticate,
    validateUpdateComplexStatus,
    complexController.updateStatus
)

router.patch('/:id/schedules', 
    authenticate, 
    validateUpdateSchedules, 
    complexController.updateSchedules
)

router.get('/:id/courts',
    parsePagination,
    complexController.getCourts
)

router.use('/:id/reviews', reviewRoutes)
    
export default router
