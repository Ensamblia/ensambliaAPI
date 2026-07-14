import express from 'express'
const router = express.Router()
import generoMusicalController from '../controllers/generoMusicalController.js';



router.get('/', generoMusicalController.getGeneroMusical)
router.get('/:id', generoMusicalController.getById)

router.post('/', generoMusicalController.createGeneroMusical)

router.put('/:id', generoMusicalController.updateGeneroMusical)

router.delete('/:id', generoMusicalController.deleteGeneroMusical)

export default router