import express from 'express'
const router = express.Router()
import perfilGeneroMusicalController from '../controllers/perfilGeneroMusicalController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', perfilGeneroMusicalController.getPerfilGeneroMusicales)
router.get('/perfil', perfilGeneroMusicalController.getByPerfilId)
router.get('/genero', perfilGeneroMusicalController.getByGeneroId)

router.get('/:perfil_id/:genero_id', perfilGeneroMusicalController.getById)

router.post('/', authMiddleware, perfilGeneroMusicalController.createPerfilGeneroMusical)

router.delete('/:perfil_id/:genero_id', authMiddleware, perfilGeneroMusicalController.deletePerfilGeneroMusical)

export default router
