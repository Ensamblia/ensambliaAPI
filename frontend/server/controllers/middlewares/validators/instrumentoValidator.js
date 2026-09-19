import { body, param, query } from 'express-validator'

const createInstrumentoValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 30 }).withMessage('El nombre no puede superar los 30 caracteres')
        .trim()
        .escape()
]

const updateInstrumentoValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),
    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 30 }).withMessage('El nombre no puede superar los 30 caracteres')
        .trim()
        .escape()
]

const getInstrumentoByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteInstrumentoValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getInstrumentosValidators = [
    query('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .trim()
        .escape(),
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
    createInstrumentoValidators,
    updateInstrumentoValidators,
    getInstrumentoByIdValidators,
    deleteInstrumentoValidators,
    getInstrumentosValidators
}