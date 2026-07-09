import express from 'express'
const router = express.Router()
import grupoGeneroController from '../controllers/grupoGeneroController.js'

router.get('/', grupoGeneroController.getGrupoGeneros)
router.get('/:grupo_id/:genero_id', grupoGeneroController.getById)

router.post('/', grupoGeneroController.createGrupoGenero)

router.delete('/:grupo_id/:genero_id', grupoGeneroController.deleteGrupoGenero)

export default router
