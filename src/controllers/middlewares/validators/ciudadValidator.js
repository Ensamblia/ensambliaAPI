import { body, param, query } from 'express-validator'

const createCiudadValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('comarca_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
        .toInt()
]

const updateCiudadValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),
    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('comarca_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
        .toInt()
]

const getCiudadByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteCiudadValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getCiudadesValidators = [
    query('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .trim()
        .escape(),
    query('comarca_id')
        .optional()
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
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
    createCiudadValidators,
    updateCiudadValidators,
    getCiudadByIdValidators,
    deleteCiudadValidators,
    getCiudadesValidators
}