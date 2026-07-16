import express from 'express'
const router = express.Router()
import instrumentoController from '../controllers/instrumentoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, instrumentoController.getInstrumentos)
router.get('/:id', authMiddleware, instrumentoController.getById)

router.post('/', authMiddleware, instrumentoController.createInstrumento)

router.put('/:id', authMiddleware, instrumentoController.updateInstrumento)

router.delete('/:id', authMiddleware, instrumentoController.deleteInstrumento)

export default router