import express from 'express'
const router = express.Router()
import tipoAnuncioController from '../controllers/tipoAnuncioController.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', tipoAnuncioController.getTipoAnuncios)
router.get('/:id', tipoAnuncioController.getById)

router.post('/', authMiddleware, tipoAnuncioController.createTipoAnuncio)

router.put('/:id', authMiddleware, tipoAnuncioController.updateTipoAnuncio)

router.delete('/:id', authMiddleware, tipoAnuncioController.deleteTipoAnuncio)

export default router
