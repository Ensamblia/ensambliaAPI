import express from 'express'
const router = express.Router()
import tipoAnuncioController from '../controllers/tipoAnuncioController.js';

router.get('/', tipoAnuncioController.getTipoAnuncios)
router.get('/:id', tipoAnuncioController.getById)

router.post('/', tipoAnuncioController.createTipoAnuncio)

router.put('/:id', tipoAnuncioController.updateTipoAnuncio)

router.delete('/:id', tipoAnuncioController.deleteTipoAnuncio)

export default router
