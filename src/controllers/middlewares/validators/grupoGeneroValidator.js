import { body, param, query } from 'express-validator'

const createGrupoGeneroValidators = [
    body('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt(),
    body('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const getGrupoGeneroByIdValidators = [
    param('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt(),
    param('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const deleteGrupoGeneroValidators = [
    param('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt(),
    param('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const getGrupoGenerosValidators = [
    query('grupo_id')
        .optional()
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt(),
    query('genero_id')
        .optional()
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100')
        .toInt(),
    query('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('El offset debe ser un número entero positivo')
        .toInt()
]

export {
    createGrupoGeneroValidators,
    getGrupoGeneroByIdValidators,
    deleteGrupoGeneroValidators,
    getGrupoGenerosValidators
}