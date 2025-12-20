import { Router } from "express"
import { authenticate } from "../../middleware/authenticate"
import { optionalAuthenticate } from "../../middleware/optionalAuth"
import { validateCreateComplex, validateRestoreComplex, validateUpdateComplex, validateUpdateComplexStatus } from "./complex.validator"
import { complexController } from "./complex.dependencies"

const router = Router()

//Routing
router.post('/', 
    authenticate,
    validateCreateComplex,
    complexController.create)
        
router.get('/', 
    optionalAuthenticate, 
    complexController.getAll)

router.patch('/:id', 
    authenticate,
    validateUpdateComplex,
    complexController.update)

router.delete('/:id',
    authenticate,
    complexController.delete)

router.get('/my-complexes', 
    authenticate, 
    complexController.getMyActiveComplexes)

router.get('/my-deleted',
    authenticate, 
    complexController.getMyDeletedComplexes)

router.patch('/:id/restore',
    authenticate,
    validateRestoreComplex,
    complexController.restore
)

router.patch('/:id/status', 
    authenticate,
    validateUpdateComplexStatus,
    complexController.updateStatus)
    

    
export default router
