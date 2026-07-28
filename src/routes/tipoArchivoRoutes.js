import express from 'express'
const router = express.Router()
import tipoArchivoController from '../controllers/tipoArchivoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createTipoArchivoValidators,
    updateTipoArchivoValidators,
    getTipoArchivoByIdValidators,
    deleteTipoArchivoValidators,
    getTipoArchivosValidators
} from '../controllers/middlewares/validators/tipoArchivoValidator.js'

router.get('/',
    getTipoArchivosValidators,
    handleValidation,
    tipoArchivoController.getTipoArchivos
)

router.get('/:id',
    getTipoArchivoByIdValidators,
    handleValidation,
    tipoArchivoController.getById
)

router.post('/',
    authMiddleware,
    createTipoArchivoValidators,
    handleValidation,
    tipoArchivoController.createTipoArchivo
)

router.put('/:id',
    authMiddleware,
    updateTipoArchivoValidators,
    handleValidation,
    tipoArchivoController.updateTipoArchivo
)

router.delete('/:id',
    authMiddleware,
    deleteTipoArchivoValidators,
    handleValidation,
    tipoArchivoController.deleteTipoArchivo
)

export default router
