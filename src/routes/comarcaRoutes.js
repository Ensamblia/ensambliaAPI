import express from 'express'
const router = express.Router()
import comarcaController from '../controllers/comarcaController.js';



router.get('/', comarcaController.getComarcas)
router.get('/:id', comarcaController.getById)

router.post('/', comarcaController.createComarca)

router.put('/:id', comarcaController.updateComarca)

router.delete('/:id', comarcaController.deleteComarca)

export default router