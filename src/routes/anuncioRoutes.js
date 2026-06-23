import express from 'express'
const router = express.Router()
import anuncioController from '../controllers/anuncioController.js'

router.get('/', anuncioController.getAnuncios)
router.get('/:id', anuncioController.getById)

router.post('/', anuncioController.createAnuncio)

router.put('/:id', anuncioController.updateAnuncio)

router.delete('/:id', anuncioController.deleteAnuncio)

export default router