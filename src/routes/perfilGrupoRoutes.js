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
} from '../controllers/middlewares/validators/perfilGrupoValidator.js'

router.get('/',
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getPerfilGrupos
)

router.get('/perfil',
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getByPerfilId
)

router.get('/grupo',
    getPerfilGruposValidators,
    handleValidation,
    perfilGrupoController.getByGrupoId
)

router.get('/:perfil_id/:grupo_id',
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
