import express from 'express'
const router = express.Router()
import tipoArchivoController from '../controllers/tipoArchivoController.js'

router.get('/', tipoArchivoController.getTipoArchivos)
router.get('/:id', tipoArchivoController.getById)

router.post('/', tipoArchivoController.createTipoArchivo)

router.put('/:id', tipoArchivoController.updateTipoArchivo)

router.delete('/:id', tipoArchivoController.deleteTipoArchivo)

export default router