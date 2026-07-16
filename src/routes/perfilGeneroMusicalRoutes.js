import express from 'express'
const router = express.Router()
import perfilGeneroMusicalController from '../controllers/perfilGeneroMusicalController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createPerfilGeneroMusicalValidators,
    getPerfilGeneroMusicalByIdValidators,
    deletePerfilGeneroMusicalValidators,
    getPerfilGeneroMusicalesValidators
} from '../validators/perfilGeneroMusicalValidator.js'

router.get('/',
    authMiddleware,
    getPerfilGeneroMusicalesValidators,
    handleValidation,
    perfilGeneroMusicalController.getPerfilGeneroMusicales
)

router.get('/perfil',
    authMiddleware,
    getPerfilGeneroMusicalesValidators,
    handleValidation,
    perfilGeneroMusicalController.getByPerfilId
)

router.get('/genero',
    authMiddleware,
    getPerfilGeneroMusicalesValidators,
    handleValidation,
    perfilGeneroMusicalController.getByGeneroId
)

router.get('/:perfil_id/:genero_id',
    authMiddleware,
    getPerfilGeneroMusicalByIdValidators,
    handleValidation,
    perfilGeneroMusicalController.getById
)

router.post('/',
    authMiddleware,
    createPerfilGeneroMusicalValidators,
    handleValidation,
    perfilGeneroMusicalController.createPerfilGeneroMusical
)

router.delete('/:perfil_id/:genero_id',
    authMiddleware,
    deletePerfilGeneroMusicalValidators,
    handleValidation,
    perfilGeneroMusicalController.deletePerfilGeneroMusical
)

export default router