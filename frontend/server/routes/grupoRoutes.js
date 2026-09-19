import express from 'express'
const router = express.Router()
import grupoController from '../controllers/grupoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createGrupoValidators,
    updateGrupoValidators,
    getGrupoByIdValidators,
    deleteGrupoValidators,
    getGruposValidators
} from '../validators/grupoValidator.js'

router.get('/',
    authMiddleware,
    getGruposValidators,
    handleValidation,
    grupoController.getGrupos
)

router.get('/:id',
    authMiddleware,
    getGrupoByIdValidators,
    handleValidation,
    grupoController.getById
)

router.post('/',
    authMiddleware,
    createGrupoValidators,
    handleValidation,
    grupoController.createGrupo
)

router.put('/:id',
    authMiddleware,
    updateGrupoValidators,
    handleValidation,
    grupoController.updateGrupo
)

router.delete('/:id',
    authMiddleware,
    deleteGrupoValidators,
    handleValidation,
    grupoController.deleteGrupo
)

export default router