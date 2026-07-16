import express from 'express'
const router = express.Router()
import perfilGrupoController from '../controllers/perfilGrupoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'
import {
    createPerfilGrupoValidators,
    getPerfilGrupoByIdValidators,
    deletePerfilGrupoValidators,
    getPerfilGruposValidators
} from '../validators/perfilGrupoValidator.js'

router.get('/',
    authMiddleware,
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getPerfilGrupos
)

router.get('/perfil',
    authMiddleware,
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getByPerfilId
)

router.get('/grupo',
    authMiddleware,
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getByGrupoId
)

router.get('/:perfil_id/:grupo_id',
    authMiddleware,
    getPerfilGrupoByIdValidators,
    handleValidation,
    perfilGrupoController.getById
)

router.post('/',
    authMiddleware,
    createPerfilGrupoValidators,
    handleValidation,
    perfilGrupoController.createPerfilGrupo
)

router.delete('/:perfil_id/:grupo_id',
    authMiddleware,
    deletePerfilGrupoValidators,
    handleValidation,
    perfilGrupoController.deletePerfilGrupo
)

export default router