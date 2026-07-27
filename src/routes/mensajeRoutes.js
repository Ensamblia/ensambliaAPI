import express from 'express'
const router = express.Router()
import mensajeController from '../controllers/mensajeController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.use(authMiddleware)

router.get('/', mensajeController.getMensajes)
router.get('/chat', mensajeController.getByChatId)
router.get('/perfil', mensajeController.getByPerfilId)

router.get('/:id', mensajeController.getById)

router.post('/', mensajeController.createMensaje)

router.put('/:id', mensajeController.updateMensaje)

router.delete('/:id', mensajeController.deleteMensaje)

export default router
