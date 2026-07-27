import express from 'express'
const router = express.Router()
import comentarioController from '../controllers/comentarioController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'



router.get('/', comentarioController.getComentarios)
router.get('/perfil', comentarioController.getByPerfilId)
router.get('/anuncio', comentarioController.getByAnuncioId)

router.get('/:id', comentarioController.getById)

router.post('/', authMiddleware, comentarioController.createComentario)

router.put('/:id', authMiddleware, comentarioController.updateComentario)

router.delete('/:id', authMiddleware, comentarioController.deleteComentario)

export default router