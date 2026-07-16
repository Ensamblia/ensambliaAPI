import express from 'express'
const router = express.Router()
import multimediaController from '../controllers/multimediaController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createMultimediaValidators,
    updateMultimediaValidators,
    getMultimediaByIdValidators,
    deleteMultimediaValidators,
    getMultimediaValidators
} from '../validators/multimediaValidator.js'

router.get('/',
    authMiddleware,
    getMultimediaValidators,
    handleValidation,
    multimediaController.getMultimedia
)

router.get('/perfil',
    authMiddleware,
    getMultimediaValidators,
    handleValidation,
    multimediaController.getByPerfilId
)

router.get('/anuncio',
    authMiddleware,
    getMultimediaValidators,
    handleValidation,
    multimediaController.getByAnuncioId
)

router.get('/:id',
    authMiddleware,
    getMultimediaByIdValidators,
    handleValidation,
    multimediaController.getById
)

router.post('/',
    authMiddleware,
    createMultimediaValidators,
    handleValidation,
    multimediaController.createMultimedia
)

router.put('/:id',
    authMiddleware,
    updateMultimediaValidators,
    handleValidation,
    multimediaController.updateMultimedia
)

router.delete('/:id',
    authMiddleware,
    deleteMultimediaValidators,
    handleValidation,
    multimediaController.deleteMultimedia
)

export default router