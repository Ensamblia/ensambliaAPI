import express from 'express'
const router = express.Router()
import comarcaController from '../controllers/comarcaController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createComarcaValidators,
    updateComarcaValidators,
    getComarcaByIdValidators,
    deleteComarcaValidators,
    getComarcasValidators
} from '../validators/comarcaValidator.js'

router.get('/',
    authMiddleware,
    getComarcasValidators,
    handleValidation,
    comarcaController.getComarcas
)

router.get('/:id',
    authMiddleware,
    getComarcaByIdValidators,
    handleValidation,
    comarcaController.getById
)

router.post('/',
    authMiddleware,
    createComarcaValidators,
    handleValidation,
    comarcaController.createComarca
)

router.put('/:id',
    authMiddleware,
    updateComarcaValidators,
    handleValidation,
    comarcaController.updateComarca
)

router.delete('/:id',
    authMiddleware,
    deleteComarcaValidators,
    handleValidation,
    comarcaController.deleteComarca
)

export default router