import express from 'express'
const router = express.Router()
import multimediaController from '../controllers/multimediaController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', multimediaController.getMultimedias)
router.get('/perfil', multimediaController.getByPerfilId)
router.get('/anuncio', multimediaController.getByAnuncioId)

router.get('/:id', multimediaController.getById)

router.post('/', authMiddleware, multimediaController.createMultimedia)

router.put('/:id', authMiddleware, multimediaController.updateMultimedia)

router.delete('/:id', authMiddleware, multimediaController.deleteMultimedia)

export default router
