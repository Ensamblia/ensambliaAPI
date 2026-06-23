import express from 'express'
const router = express.Router()
import ciudadController from '../controllers/ciudadController.js';



router.get('/', ciudadController.getCiudades)
router.get('/:id', ciudadController.getById)

router.post('/', ciudadController.createCiudad)

router.put('/:id', ciudadController.updateCiudad)

router.delete('/:id', ciudadController.deleteCiudad)

export default router