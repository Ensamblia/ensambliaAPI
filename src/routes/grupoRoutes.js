import express from 'express'
const router = express.Router()
import grupoController from '../controllers/grupoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', grupoController.getGrupos)
router.get('/:id', grupoController.getById)

router.post('/', authMiddleware, grupoController.createGrupo)

router.put('/:id', authMiddleware, grupoController.updateGrupo)

router.delete('/:id', authMiddleware, grupoController.deleteGrupo)

export default router
