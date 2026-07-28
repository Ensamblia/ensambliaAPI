import express from 'express'
const router = express.Router()
import perfilChatController from '../controllers/perfilChatController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createPerfilChatValidators,
    getPerfilChatByIdValidators,
    deletePerfilChatValidators,
    getPerfilChatsValidators
} from '../controllers/middlewares/validators/perfilChatValidator.js'

router.get('/',
    authMiddleware,
    getPerfilChatsValidators,
    handleValidation,
    perfilChatController.getPerfilChats
)

router.get('/perfil',
    authMiddleware,
    getPerfilChatsValidators,
    handleValidation,
    perfilChatController.getByPerfilId
)

router.get('/chat',
    authMiddleware,
    getPerfilChatsValidators,
    handleValidation,
    perfilChatController.getByChatId
)

router.get('/:perfil_id/:chat_id',
    authMiddleware,
    getPerfilChatByIdValidators,
    handleValidation,
    perfilChatController.getById
)

router.post('/',
    authMiddleware,
    createPerfilChatValidators,
    handleValidation,
    perfilChatController.createPerfilChat
)

router.delete('/:perfil_id/:chat_id',
    authMiddleware,
    deletePerfilChatValidators,
    handleValidation,
    perfilChatController.deletePerfilChat
)

export default router
