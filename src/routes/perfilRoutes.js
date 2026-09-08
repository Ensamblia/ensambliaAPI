import express from 'express'
const router = express.Router()
import perfilController from '../controllers/perfilController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createPerfilValidators,
    updatePerfilValidators,
    getPerfilByIdValidators,
    deletePerfilValidators,
    getPerfilesValidators
} from '../controllers/middlewares/validators/perfilValidator.js'

router.get('/',
    getPerfilesValidators,
    handleValidation,
    perfilController.getPerfiles
)

router.get('/usuario',
    getPerfilesValidators,
    handleValidation,
    perfilController.getByUsuarioId
)

router.get('/comarca',
    getPerfilesValidators,
    handleValidation,
    perfilController.getByComarcaId
)

router.get('/me', authMiddleware, perfilController.getMe)

router.get('/:id',
    getPerfilByIdValidators,
    handleValidation,
    perfilController.getById
)

router.post('/',
    authMiddleware,
    createPerfilValidators,
    handleValidation,
    perfilController.createPerfil
)

router.put('/:id',
    authMiddleware,
    updatePerfilValidators,
    handleValidation,
    perfilController.updatePerfil
)

router.delete('/:id',
    authMiddleware,
    deletePerfilValidators,
    handleValidation,
    perfilController.deletePerfil
)

export default router
