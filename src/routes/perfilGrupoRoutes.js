import express from 'express'
const router = express.Router()
import perfilGrupoController from '../controllers/perfilGrupoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', perfilGrupoController.getPerfilGrupos)
router.get('/perfil', perfilGrupoController.getByPerfilId)
router.get('/grupo', perfilGrupoController.getByGrupoId)

router.get('/:perfil_id/:grupo_id', perfilGrupoController.getById)

router.post('/', authMiddleware, perfilGrupoController.createPerfilGrupo)

router.delete('/:perfil_id/:grupo_id', authMiddleware, perfilGrupoController.deletePerfilGrupo)

export default router
