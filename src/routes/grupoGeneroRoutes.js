import express from 'express'
const router = express.Router()
import grupoGeneroController from '../controllers/grupoGeneroController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', grupoGeneroController.getGrupoGeneros)
router.get('/:grupo_id/:genero_id', grupoGeneroController.getById)

router.post('/', authMiddleware, grupoGeneroController.createGrupoGenero)

router.delete('/:grupo_id/:genero_id', authMiddleware, grupoGeneroController.deleteGrupoGenero)

export default router
