import express from 'express'
const router = express.Router()
import comentarioController from '../controllers/comentarioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createComentarioValidators,
    updateComentarioValidators,
    getComentarioByIdValidators,
    deleteComentarioValidators,
    getComentariosValidators
} from '../controllers/middlewares/validators/comentarioValidator.js'

router.get('/',
    getComentariosValidators,
    handleValidation,
    comentarioController.getComentarios
)

router.get('/perfil',
    getComentariosValidators,
    handleValidation,
    comentarioController.getByPerfilId
)

router.get('/anuncio',
    getComentariosValidators,
    handleValidation,
    comentarioController.getByAnuncioId
)

router.get('/:id',
    getComentarioByIdValidators,
    handleValidation,
    comentarioController.getById
)

router.post('/',
    authMiddleware,
    createComentarioValidators,
    handleValidation,
    comentarioController.createComentario
)

router.put('/:id',
    authMiddleware,
    updateComentarioValidators,
    handleValidation,
    comentarioController.updateComentario
)

router.delete('/:id',
    authMiddleware,
    deleteComentarioValidators,
    handleValidation,
    comentarioController.deleteComentario
)

export default router
