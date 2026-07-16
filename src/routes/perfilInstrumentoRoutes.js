import express from 'express'
const router = express.Router()
import perfilInstrumentoController from '../controllers/perfilInstrumentoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createPerfilInstrumentoValidators,
    getPerfilInstrumentoByIdValidators,
    deletePerfilInstrumentoValidators,
    getPerfilInstrumentosValidators
} from '../validators/perfilInstrumentoValidator.js'

router.get('/',
    authMiddleware,
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getPerfilInstrumentos
)

router.get('/perfil',
    authMiddleware,
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getByPerfilId
)

router.get('/instrumento',
    authMiddleware,
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getByInstrumentoId
)

router.get('/:perfil_id/:instrumento_id',
    authMiddleware,
    getPerfilInstrumentoByIdValidators,
    handleValidation,
    perfilInstrumentoController.getById
)

router.post('/',
    authMiddleware,
    createPerfilInstrumentoValidators,
    handleValidation,
    perfilInstrumentoController.createPerfilInstrumento
)

router.delete('/:perfil_id/:instrumento_id',
    authMiddleware,
    deletePerfilInstrumentoValidators,
    handleValidation,
    perfilInstrumentoController.deletePerfilInstrumento
)

export default router
