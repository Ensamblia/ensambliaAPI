import express from 'express'
const router = express.Router()
import instrumentoController from '../controllers/instrumentoController.js'

router.get('/', instrumentoController.getInstrumentos)
router.get('/:id', instrumentoController.getById)

router.post('/', instrumentoController.createInstrumento)

router.put('/:id', instrumentoController.updateInstrumento)

router.delete('/:id', instrumentoController.deleteInstrumento)

export default router