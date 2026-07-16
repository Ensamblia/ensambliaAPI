import express from 'express'
const router = express.Router()
import grupoGeneroController from '../controllers/grupoGeneroController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createGrupoGeneroValidators,
    getGrupoGeneroByIdValidators,
    deleteGrupoGeneroValidators,
    getGrupoGenerosValidators
} from '../validators/grupoGeneroValidator.js'

router.get('/',
    authMiddleware,
    getGrupoGenerosValidators,
    handleValidation,
    grupoGeneroController.getGrupoGeneros
)

router.get('/:grupo_id/:genero_id',
    authMiddleware,
    getGrupoGeneroByIdValidators,
    handleValidation,
    grupoGeneroController.getById
)

router.post('/',
    authMiddleware,
    createGrupoGeneroValidators,
    handleValidation,
    grupoGeneroController.createGrupoGenero
)

router.delete('/:grupo_id/:genero_id',
    authMiddleware,
    deleteGrupoGeneroValidators,
    handleValidation,
    grupoGeneroController.deleteGrupoGenero
)

export default router
