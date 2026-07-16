import { body, param, query } from 'express-validator'

const createPerfilGrupoValidators = [
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilGrupoByIdValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt()
]

const deletePerfilGrupoValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('grupo_id')
        .notEmpty().withMessage('grupo_id es obligatorio')
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilGruposValidators = [
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('grupo_id')
        .optional()
        .isInt({ min: 1 }).withMessage('grupo_id debe ser un número entero positivo')
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
    createPerfilGrupoValidators,
    getPerfilGrupoByIdValidators,
    deletePerfilGrupoValidators,
    getPerfilGruposValidators
}