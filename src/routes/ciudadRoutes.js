import express from 'express'
const router = express.Router()
import ciudadController from '../controllers/ciudadController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, ciudadController.getCiudades)
router.get('/:id', authMiddleware, ciudadController.getById)

router.post('/', authMiddleware, ciudadController.createCiudad)

router.put('/:id', authMiddleware, ciudadController.updateCiudad)

router.delete('/:id', authMiddleware, ciudadController.deleteCiudad)

export default router