import express from 'express'
const router = express.Router()
import multimediaController from '../controllers/multimediaController.js'

router.get('/', multimediaController.getMultimedia)
router.get('/perfil', multimediaController.getByPerfilId)
router.get('/anuncio', multimediaController.getByAnuncioId)

router.get('/:id', multimediaController.getById)

router.post('/', multimediaController.createMultimedia)

router.put('/:id', multimediaController.updateMultimedia)

router.delete('/:id', multimediaController.deleteMultimedia)

export default router