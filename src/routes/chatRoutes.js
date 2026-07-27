import express from 'express'
const router = express.Router()
import chatController from '../controllers/chatController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.use(authMiddleware)

router.get('/', chatController.getChats)
router.get('/:id', chatController.getById)

router.delete('/:id', chatController.deleteChat)

export default router