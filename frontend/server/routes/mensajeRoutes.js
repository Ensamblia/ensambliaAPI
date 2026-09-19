import express from 'express'
const router = express.Router()
import mensajeController from '../controllers/mensajeController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createMensajeValidators,
    updateMensajeValidators,
    getMensajeByIdValidators,
    deleteMensajeValidators,
    getMensajesValidators
} from '../validators/mensajeValidator.js'

router.get('/',
    authMiddleware,
    getMensajesValidators,
    handleValidation,
    mensajeController.getMensajes
)

router.get('/chat',
    authMiddleware,
    getMensajesValidators,
    handleValidation,
    mensajeController.getByChatId
)

router.get('/perfil',
    authMiddleware,
    getMensajesValidators,
    handleValidation,
    mensajeController.getByPerfilId
)

router.get('/:id',
    authMiddleware,
    getMensajeByIdValidators,
    handleValidation,
    mensajeController.getById
)

router.post('/',
    authMiddleware,
    createMensajeValidators,
    handleValidation,
    mensajeController.createMensaje
)

router.put('/:id',
    authMiddleware,
    updateMensajeValidators,
    handleValidation,
    mensajeController.updateMensaje
)

router.delete('/:id',
    authMiddleware,
    deleteMensajeValidators,
    handleValidation,
    mensajeController.deleteMensaje
)

export default router
