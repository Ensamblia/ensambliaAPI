import { body, param, query } from 'express-validator'

const createTipoAnuncioValidators = [
    body('tipo')
        .notEmpty().withMessage('El tipo es obligatorio')
        .isString().withMessage('El tipo debe ser un texto')
        .isLength({ max: 50 }).withMessage('El tipo no puede superar los 50 caracteres')
        .trim()
        .escape()
]

const updateTipoAnuncioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),
    body('tipo')
        .optional()
        .isString().withMessage('El tipo debe ser un texto')
        .isLength({ max: 50 }).withMessage('El tipo no puede superar los 50 caracteres')
        .trim()
        .escape()
]

const getTipoAnuncioByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteTipoAnuncioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getTipoAnunciosValidators = [
    query('tipo')
        .optional()
        .isString().withMessage('El tipo debe ser un texto')
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
    createTipoAnuncioValidators,
    updateTipoAnuncioValidators,
    getTipoAnuncioByIdValidators,
    deleteTipoAnuncioValidators,
    getTipoAnunciosValidators
}