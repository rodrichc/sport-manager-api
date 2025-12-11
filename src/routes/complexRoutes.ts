import { Router } from "express"
import { authenticate } from "../middleware/authenticate"
import { createComplex, deleteComplex, getComplexes, getDeletedComplexes, getMyComplexes, restoreComplex, updateComplex, updateComplexStatus } from "../handlers/complex"
import { optionalAuthenticate } from "../middleware/optionalAuth"
import { validateCreateComplex, validateRestoreComplex, validateUpdateComplex, validateUpdateComplexStatus } from "../validators/complexValidators"

const router = Router()

//Routing
router.post('/', 
    authenticate,
    validateCreateComplex,
    createComplex)
        
router.get('/', 
    optionalAuthenticate, 
    getComplexes)

router.patch('/:id', 
    authenticate,
    validateUpdateComplex,
    updateComplex)

router.delete('/:id',
    authenticate,
    deleteComplex)

router.get('/my-complexes', 
    authenticate, 
    getMyComplexes)

router.get('/my-deleted',
    authenticate, 
    getDeletedComplexes)

router.patch('/:id/restore',
    authenticate,
    validateRestoreComplex,
    restoreComplex
)

router.patch('/:id/status', 
    authenticate,
    validateUpdateComplexStatus,
    updateComplexStatus)
    

    
export default router
