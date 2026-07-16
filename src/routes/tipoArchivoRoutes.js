import express from 'express'
const router = express.Router()
import tipoArchivoController from '../controllers/tipoArchivoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, tipoArchivoController.getTipoArchivos)
router.get('/:id', authMiddleware, tipoArchivoController.getById)

router.post('/', authMiddleware, tipoArchivoController.createTipoArchivo)

router.put('/:id', authMiddleware, tipoArchivoController.updateTipoArchivo)

router.delete('/:id', authMiddleware, tipoArchivoController.deleteTipoArchivo)

export default router