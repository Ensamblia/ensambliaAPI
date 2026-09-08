import express from 'express'
const router = express.Router()
import chatController from '../controllers/chatController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    getChatByIdValidators,
    deleteChatValidators,
    getChatsValidators
} from '../controllers/middlewares/validators/chatValidator.js'

router.get('/',
    authMiddleware,
    getChatsValidators,
    handleValidation,
    chatController.getChats
)

router.get('/:id',
    authMiddleware,
    getChatByIdValidators,
    handleValidation,
    chatController.getById
)

router.post('/con/:otro_perfil_id',
    authMiddleware,
    chatController.iniciarConversacion
)

router.delete('/:id',
    authMiddleware,
    deleteChatValidators,
    handleValidation,
    chatController.deleteChat
)

export default router
