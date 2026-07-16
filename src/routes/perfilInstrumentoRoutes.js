import express from 'express'
const router = express.Router()
import perfilInstrumentoController from '../controllers/perfilInstrumentoController.js'

router.get('/', perfilInstrumentoController.getPerfilInstrumentos)
router.get('/perfil', perfilInstrumentoController.getByPerfilId)
router.get('/instrumento', perfilInstrumentoController.getByInstrumentoId)

router.get('/:perfil_id/:instrumento_id', perfilInstrumentoController.getById)

router.post('/', perfilInstrumentoController.createPerfilInstrumento)

router.delete('/:perfil_id/:instrumento_id', perfilInstrumentoController.deletePerfilInstrumento)

export default router
