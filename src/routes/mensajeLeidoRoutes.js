import express from 'express'
const router = express.Router()
import mensajeLeidoController from '../controllers/mensajeLeidoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, mensajeLeidoController.getMensajeLeidos)
router.get('/:mensaje_id/:perfil_id', authMiddleware, mensajeLeidoController.getById)

router.post('/', authMiddleware, mensajeLeidoController.createMensajeLeido)

router.delete('/:mensaje_id/:perfil_id', authMiddleware, mensajeLeidoController.deleteMensajeLeido)

export default router
