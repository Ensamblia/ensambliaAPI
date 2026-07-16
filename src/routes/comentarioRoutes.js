import express from 'express'
const router = express.Router()
import comentarioController from '../controllers/comentarioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, comentarioController.getComentarios)
router.get('/perfil', authMiddleware, comentarioController.getByPerfilId)
router.get('/anuncio', authMiddleware, comentarioController.getByAnuncioId)

router.get('/:id', authMiddleware, comentarioController.getById)

router.post('/', authMiddleware, comentarioController.createComentario)

router.put('/:id', authMiddleware, comentarioController.updateComentario)

router.delete('/:id', authMiddleware, comentarioController.deleteComentario)

export default router