import express from 'express'
const router = express.Router()
import perfilController from '../controllers/perfilController.js';



router.get('/', perfilController.getPerfiles)
router.get('/usuario', perfilController.getByUsuarioId)
router.get('/comarca', perfilController.getByComarcaId)

router.get('/:id', perfilController.getById)

router.post('/', perfilController.createPerfil)

router.put('/:id', perfilController.updatePerfil)

router.delete('/:id', perfilController.deletePerfil)

export default router
