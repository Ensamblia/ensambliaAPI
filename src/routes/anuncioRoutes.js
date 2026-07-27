import express from 'express'
const router = express.Router()
import anuncioController from '../controllers/anuncioController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', anuncioController.getAnuncios)
router.get('/:id', anuncioController.getById)

router.post('/', authMiddleware, anuncioController.createAnuncio)

router.put('/:id', authMiddleware, anuncioController.updateAnuncio)

router.delete('/:id', authMiddleware, anuncioController.deleteAnuncio)

export default router