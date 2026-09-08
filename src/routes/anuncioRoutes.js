import express from 'express'
const router = express.Router()
import anuncioController from '../controllers/anuncioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createAnuncioValidators,
    updateAnuncioValidators,
    getAnuncioByIdValidators,
    deleteAnuncioValidators,
    getAnunciosValidators
} from '../controllers/middlewares/validators/anuncioValidator.js'

router.get('/',
    getAnunciosValidators,
    handleValidation,
    anuncioController.getAnuncios
)

router.get('/:id',
    getAnuncioByIdValidators,
    handleValidation,
    anuncioController.getById
)

router.post('/',
    authMiddleware,
    createAnuncioValidators,
    handleValidation,
    anuncioController.createAnuncio
)

router.put('/:id',
    authMiddleware,
    updateAnuncioValidators,
    handleValidation,
    anuncioController.updateAnuncio
)

router.delete('/:id',
    authMiddleware,
    deleteAnuncioValidators,
    handleValidation,
    anuncioController.deleteAnuncio
)

export default router
