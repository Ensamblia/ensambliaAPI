import { body, param, query } from 'express-validator'

const createMensajeLeidoValidators = [
    body('mensaje_id')
        .notEmpty().withMessage('mensaje_id es obligatorio')
        .isInt({ min: 1 }).withMessage('mensaje_id debe ser un número entero positivo')
        .toInt(),
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt()
]

const getMensajeLeidoByIdValidators = [
    param('mensaje_id')
        .notEmpty().withMessage('mensaje_id es obligatorio')
        .isInt({ min: 1 }).withMessage('mensaje_id debe ser un número entero positivo')
        .toInt(),
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt()
]

const deleteMensajeLeidoValidators = [
    param('mensaje_id')
        .notEmpty().withMessage('mensaje_id es obligatorio')
        .isInt({ min: 1 }).withMessage('mensaje_id debe ser un número entero positivo')
        .toInt(),
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt()
]

const getMensajeLeidosValidators = [
    query('mensaje_id')
        .optional()
        .isInt({ min: 1 }).withMessage('mensaje_id debe ser un número entero positivo')
        .toInt(),
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('leido_desde')
        .optional()
        .isISO8601().withMessage('leido_desde debe ser una fecha válida (YYYY-MM-DD)')
        .toDate(),
    query('leido_hasta')
        .optional()
        .isISO8601().withMessage('leido_hasta debe ser una fecha válida (YYYY-MM-DD)')
        .toDate(),
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
    createMensajeLeidoValidators,
    getMensajeLeidoByIdValidators,
    deleteMensajeLeidoValidators,
    getMensajeLeidosValidators
}