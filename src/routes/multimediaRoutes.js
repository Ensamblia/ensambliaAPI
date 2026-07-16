import express from 'express'
const router = express.Router()
import multimediaController from '../controllers/multimediaController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, multimediaController.getMultimedia)
router.get('/perfil', authMiddleware, multimediaController.getByPerfilId)
router.get('/anuncio', authMiddleware, multimediaController.getByAnuncioId)

router.get('/:id', authMiddleware, multimediaController.getById)

router.post('/', authMiddleware, multimediaController.createMultimedia)

router.put('/:id', authMiddleware, multimediaController.updateMultimedia)

router.delete('/:id', authMiddleware, multimediaController.deleteMultimedia)

export default router