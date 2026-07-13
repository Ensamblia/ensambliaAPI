import express from 'express'
const router = express.Router()
import perfilGeneroMusicalController from '../controllers/perfilGeneroMusicalController.js'

router.get('/', perfilGeneroMusicalController.getPerfilGeneroMusicales)
router.get('/perfil', perfilGeneroMusicalController.getByPerfilId)
router.get('/genero', perfilGeneroMusicalController.getByGeneroId)

router.get('/:perfil_id/:genero_id', perfilGeneroMusicalController.getById)

router.post('/', perfilGeneroMusicalController.createPerfilGeneroMusical)

router.delete('/:perfil_id/:genero_id', perfilGeneroMusicalController.deletePerfilGeneroMusical)

export default router
