import express from 'express'
const router = express.Router()
import mensajeLeidoController from '../controllers/mensajeLeidoController.js'

router.get('/', mensajeLeidoController.getMensajeLeidos)
router.get('/:mensaje_id/:perfil_id', mensajeLeidoController.getById)

router.post('/', mensajeLeidoController.createMensajeLeido)

router.delete('/:mensaje_id/:perfil_id', mensajeLeidoController.deleteMensajeLeido)

export default router
