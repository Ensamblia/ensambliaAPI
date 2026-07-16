import express from 'express'
const router = express.Router()
import perfilController from '../controllers/perfilController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, perfilController.getPerfiles)
router.get('/usuario', authMiddleware, perfilController.getByUsuarioId)
router.get('/comarca', authMiddleware, perfilController.getByComarcaId)

router.get('/:id', authMiddleware, perfilController.getById)

router.post('/', authMiddleware, perfilController.createPerfil)

router.put('/:id', authMiddleware, perfilController.updatePerfil)

router.delete('/:id', authMiddleware, perfilController.deletePerfil)

export default router
