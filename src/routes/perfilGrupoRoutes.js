import express from 'express'
const router = express.Router()
import perfilGrupoController from '../controllers/perfilGrupoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, perfilGrupoController.getPerfilGrupos)
router.get('/perfil', authMiddleware, perfilGrupoController.getByPerfilId)
router.get('/grupo', authMiddleware, perfilGrupoController.getByGrupoId)

router.get('/:perfil_id/:grupo_id', authMiddleware, perfilGrupoController.getById)

router.post('/', authMiddleware, perfilGrupoController.createPerfilGrupo)

router.delete('/:perfil_id/:grupo_id', authMiddleware, perfilGrupoController.deletePerfilGrupo)

export default router