import express from 'express'
const router = express.Router()
import comentarioController from '../controllers/comentarioController.js';



router.get('/', comentarioController.getComentarios)
router.get('/perfil', comentarioController.getByPerfilId)
router.get('/anuncio', comentarioController.getByAnuncioId)

router.get('/:id', comentarioController.getById)

router.post('/', comentarioController.createComentario)

router.put('/:id', comentarioController.updateComentario)

router.delete('/:id', comentarioController.deleteComentario)

export default router