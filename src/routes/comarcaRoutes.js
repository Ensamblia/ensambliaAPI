import express from 'express'
const router = express.Router()
import comarcaController from '../controllers/comarcaController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'



router.get('/', comarcaController.getComarcas)
router.get('/:id', comarcaController.getById)

router.post('/', authMiddleware, comarcaController.createComarca)

router.put('/:id', authMiddleware, comarcaController.updateComarca)

router.delete('/:id', authMiddleware, comarcaController.deleteComarca)

export default router