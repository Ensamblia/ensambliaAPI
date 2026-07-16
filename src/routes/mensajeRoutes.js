import express from 'express'
const router = express.Router()
import mensajeController from '../controllers/mensajeController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, mensajeController.getMensajes)
router.get('/chat', authMiddleware, mensajeController.getByChatId)
router.get('/perfil', authMiddleware, mensajeController.getByPerfilId)

router.get('/:id', authMiddleware, mensajeController.getById)

router.post('/', authMiddleware, mensajeController.createMensaje)

router.put('/:id', authMiddleware, mensajeController.updateMensaje)

router.delete('/:id', authMiddleware, mensajeController.deleteMensaje)

export default router
