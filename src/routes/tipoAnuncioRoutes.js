import express from 'express'
const router = express.Router()
import tipoAnuncioController from '../controllers/tipoAnuncioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createTipoAnuncioValidators,
    updateTipoAnuncioValidators,
    getTipoAnuncioByIdValidators,
    deleteTipoAnuncioValidators,
    getTipoAnunciosValidators
} from '../validators/tipoAnuncioValidator.js'

router.get('/',
    authMiddleware,
    getTipoAnunciosValidators,
    handleValidation,
    tipoAnuncioController.getTipoAnuncios
)

router.get('/:id',
    authMiddleware,
    getTipoAnuncioByIdValidators,
    handleValidation,
    tipoAnuncioController.getById
)

router.post('/',
    authMiddleware,
    createTipoAnuncioValidators,
    handleValidation,
    tipoAnuncioController.createTipoAnuncio
)

router.put('/:id',
    authMiddleware,
    updateTipoAnuncioValidators,
    handleValidation,
    tipoAnuncioController.updateTipoAnuncio
)

router.delete('/:id',
    authMiddleware,
    deleteTipoAnuncioValidators,
    handleValidation,
    tipoAnuncioController.deleteTipoAnuncio
)

export default router