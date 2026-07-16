import express from 'express'
const router = express.Router()
import perfilChatController from '../controllers/perfilChatController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, perfilChatController.getPerfilChats)
router.get('/perfil', authMiddleware, perfilChatController.getByPerfilId)
router.get('/chat', authMiddleware, perfilChatController.getByChatId)

router.get('/:perfil_id/:chat_id', authMiddleware, perfilChatController.getById)

router.post('/', authMiddleware, perfilChatController.createPerfilChat)

router.delete('/:perfil_id/:chat_id', authMiddleware, perfilChatController.deletePerfilChat)

export default router
