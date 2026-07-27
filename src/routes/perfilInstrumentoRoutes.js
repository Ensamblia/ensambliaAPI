import express from 'express'
const router = express.Router()
import perfilInstrumentoController from '../controllers/perfilInstrumentoController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', perfilInstrumentoController.getPerfilInstrumentos)
router.get('/perfil', perfilInstrumentoController.getByPerfilId)
router.get('/instrumento', perfilInstrumentoController.getByInstrumentoId)

router.get('/:perfil_id/:instrumento_id', perfilInstrumentoController.getById)

router.post('/', authMiddleware, perfilInstrumentoController.createPerfilInstrumento)

router.delete('/:perfil_id/:instrumento_id', authMiddleware, perfilInstrumentoController.deletePerfilInstrumento)

export default router
