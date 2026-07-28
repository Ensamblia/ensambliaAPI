import express from 'express'
const router = express.Router()
import usuarioController from '../controllers/usuarioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { requireAdmin } from '../controllers/middlewares/adminMiddleware.js'

router.get('/', authMiddleware, requireAdmin, usuarioController.getUsuarios)
router.get('/:id', authMiddleware, requireAdmin, usuarioController.getById)

router.put('/:id', authMiddleware, requireAdmin, usuarioController.updateUsuario)

router.delete('/:id', authMiddleware, requireAdmin, usuarioController.deleteUsuario)

export default router
