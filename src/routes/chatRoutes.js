import express from 'express'
const router = express.Router()
import chatController from '../controllers/chatController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, chatController.getChats)
router.get('/:id', authMiddleware, chatController.getById)

router.delete('/:id', authMiddleware, chatController.deleteChat)

export default router