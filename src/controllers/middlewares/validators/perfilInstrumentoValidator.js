import { body, param, query } from 'express-validator'

const createPerfilInstrumentoValidators = [
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('instrumento_id')
        .notEmpty().withMessage('instrumento_id es obligatorio')
        .isInt({ min: 1 }).withMessage('instrumento_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilInstrumentoByIdValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('instrumento_id')
        .notEmpty().withMessage('instrumento_id es obligatorio')
        .isInt({ min: 1 }).withMessage('instrumento_id debe ser un número entero positivo')
        .toInt()
]

const deletePerfilInstrumentoValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('instrumento_id')
        .notEmpty().withMessage('instrumento_id es obligatorio')
        .isInt({ min: 1 }).withMessage('instrumento_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilInstrumentosValidators = [
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('instrumento_id')
        .optional()
        .isInt({ min: 1 }).withMessage('instrumento_id debe ser un número entero positivo')
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
    createPerfilInstrumentoValidators,
    getPerfilInstrumentoByIdValidators,
    deletePerfilInstrumentoValidators,
    getPerfilInstrumentosValidators
}