import express from 'express'
const router = express.Router()
import instrumentoController from '../controllers/instrumentoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createInstrumentoValidators,
    updateInstrumentoValidators,
    getInstrumentoByIdValidators,
    deleteInstrumentoValidators,
    getInstrumentosValidators
} from '../controllers/middlewares/validators/instrumentoValidator.js'

router.get('/',
    getInstrumentosValidators,
    handleValidation,
    instrumentoController.getInstrumentos
)

router.get('/:id',
    getInstrumentoByIdValidators,
    handleValidation,
    instrumentoController.getById
)

router.post('/',
    authMiddleware,
    createInstrumentoValidators,
    handleValidation,
    instrumentoController.createInstrumento
)

router.put('/:id',
    authMiddleware,
    updateInstrumentoValidators,
    handleValidation,
    instrumentoController.updateInstrumento
)

router.delete('/:id',
    authMiddleware,
    deleteInstrumentoValidators,
    handleValidation,
    instrumentoController.deleteInstrumento
)

export default router
