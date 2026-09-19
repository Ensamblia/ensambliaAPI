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
} from '../validators/comentarioValidator.js'

router.get('/',
    authMiddleware,
    getComentariosValidators,
    handleValidation,
    comentarioController.getComentarios
)

router.get('/perfil',
    authMiddleware,
    getComentariosValidators,
    handleValidation,
    comentarioController.getByPerfilId
)

router.get('/anuncio',
    authMiddleware,
    getComentariosValidators,
    handleValidation,
    comentarioController.getByAnuncioId
)

router.get('/:id',
    authMiddleware,
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