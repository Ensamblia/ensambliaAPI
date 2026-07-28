import express from 'express'
const router = express.Router()
import ciudadController from '../controllers/ciudadController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createCiudadValidators,
    updateCiudadValidators,
    getCiudadByIdValidators,
    deleteCiudadValidators,
    getCiudadesValidators
} from '../controllers/middlewares/validators/ciudadValidator.js'

router.get('/',
    getCiudadesValidators,
    handleValidation,
    ciudadController.getCiudades
)

router.get('/:id',
    getCiudadByIdValidators,
    handleValidation,
    ciudadController.getById
)

router.post('/',
    authMiddleware,
    createCiudadValidators,
    handleValidation,
    ciudadController.createCiudad
)

router.put('/:id',
    authMiddleware,
    updateCiudadValidators,
    handleValidation,
    ciudadController.updateCiudad
)

router.delete('/:id',
    authMiddleware,
    deleteCiudadValidators,
    handleValidation,
    ciudadController.deleteCiudad
)

export default router
