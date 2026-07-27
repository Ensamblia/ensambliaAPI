import express from 'express'
const router = express.Router()
import perfilController from '../controllers/perfilController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'



router.get('/', perfilController.getPerfiles)
router.get('/usuario', perfilController.getByUsuarioId)
router.get('/comarca', perfilController.getByComarcaId)
router.get('/me', authMiddleware, perfilController.getMe)

router.get('/:id', perfilController.getById)

router.post('/', authMiddleware, perfilController.createPerfil)

router.put('/:id', authMiddleware, perfilController.updatePerfil)

router.delete('/:id', authMiddleware, perfilController.deletePerfil)

export default router
