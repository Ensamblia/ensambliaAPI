import express from 'express'
const router = express.Router()
import mensajeLeidoController from '../controllers/mensajeLeidoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createMensajeLeidoValidators,
    getMensajeLeidoByIdValidators,
    deleteMensajeLeidoValidators,
    getMensajeLeidosValidators
} from '../controllers/middlewares/validators/mensajeLeidoValidator.js'

router.get('/',
    authMiddleware,
    getMensajeLeidosValidators,
    handleValidation,
    mensajeLeidoController.getMensajeLeidos
)

router.get('/:mensaje_id/:perfil_id',
    authMiddleware,
    getMensajeLeidoByIdValidators,
    handleValidation,
    mensajeLeidoController.getById
)

router.post('/',
    authMiddleware,
    createMensajeLeidoValidators,
    handleValidation,
    mensajeLeidoController.createMensajeLeido
)

router.delete('/:mensaje_id/:perfil_id',
    authMiddleware,
    deleteMensajeLeidoValidators,
    handleValidation,
    mensajeLeidoController.deleteMensajeLeido
)

export default router
