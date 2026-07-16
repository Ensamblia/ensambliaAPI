import express from 'express'
const router = express.Router()
import generoMusicalController from '../controllers/generoMusicalController.js'
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js'

router.get('/', authMiddleware, generoMusicalController.getGeneroMusical)
router.get('/:id', authMiddleware, generoMusicalController.getById)

router.post('/', authMiddleware, generoMusicalController.createGeneroMusical)

router.put('/:id', authMiddleware, generoMusicalController.updateGeneroMusical)

router.delete('/:id', authMiddleware, generoMusicalController.deleteGeneroMusical)

export default router