import express from 'express'
const router = express.Router()
import generoMusicalController from '../controllers/generoMusicalController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createGeneroMusicalValidators,
    updateGeneroMusicalValidators,
    getGeneroMusicalByIdValidators,
    deleteGeneroMusicalValidators,
    getGeneroMusicalesValidators
} from '../validators/generoMusicalValidator.js'

router.get('/',
    authMiddleware,
    getGeneroMusicalesValidators,
    handleValidation,
    generoMusicalController.getGeneroMusical
)

router.get('/:id',
    authMiddleware,
    getGeneroMusicalByIdValidators,
    handleValidation,
    generoMusicalController.getById
)

router.post('/',
    authMiddleware,
    createGeneroMusicalValidators,
    handleValidation,
    generoMusicalController.createGeneroMusical
)

router.put('/:id',
    authMiddleware,
    updateGeneroMusicalValidators,
    handleValidation,
    generoMusicalController.updateGeneroMusical
)

router.delete('/:id',
    authMiddleware,
    deleteGeneroMusicalValidators,
    handleValidation,
    generoMusicalController.deleteGeneroMusical
)

export default router