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
} from '../controllers/middlewares/validators/perfilInstrumentoValidator.js'

router.get('/',
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getPerfilInstrumentos
)

router.get('/perfil',
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getByPerfilId
)

router.get('/instrumento',
    getPerfilInstrumentosValidators,
    handleValidation,
    perfilInstrumentoController.getByInstrumentoId
)

router.get('/:perfil_id/:instrumento_id',
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
