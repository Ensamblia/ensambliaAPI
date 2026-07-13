import express from 'express'
const router = express.Router()
import perfilChatController from '../controllers/perfilChatController.js'

router.get('/', perfilChatController.getPerfilChats)
router.get('/perfil', perfilChatController.getByPerfilId)
router.get('/chat', perfilChatController.getByChatId)

router.get('/:perfil_id/:chat_id', perfilChatController.getById)

router.post('/', perfilChatController.createPerfilChat)

router.delete('/:perfil_id/:chat_id', perfilChatController.deletePerfilChat)

export default router
