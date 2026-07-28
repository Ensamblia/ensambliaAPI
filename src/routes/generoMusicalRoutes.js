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
} from '../controllers/middlewares/validators/generoMusicalValidator.js'

router.get('/',
    getGeneroMusicalesValidators,
    handleValidation,
    generoMusicalController.getGeneroMusical
)

router.get('/:id',
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
