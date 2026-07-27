import express from 'express'
const router = express.Router()
import instrumentoController from '../controllers/instrumentoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', instrumentoController.getInstrumentos)
router.get('/:id', instrumentoController.getById)

router.post('/', authMiddleware, instrumentoController.createInstrumento)

router.put('/:id', authMiddleware, instrumentoController.updateInstrumento)

router.delete('/:id', authMiddleware, instrumentoController.deleteInstrumento)

export default router