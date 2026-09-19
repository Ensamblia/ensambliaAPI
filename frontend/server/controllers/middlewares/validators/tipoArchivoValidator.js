import { body, param, query } from 'express-validator'

const createTipoArchivoValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 10 }).withMessage('El nombre no puede superar los 10 caracteres')
        .trim()
        .escape(),
    body('extension')
        .notEmpty().withMessage('La extensión es obligatoria')
        .isString().withMessage('La extensión debe ser un texto')
        .isLength({ max: 10 }).withMessage('La extensión no puede superar los 10 caracteres')
        .matches(/^\./).withMessage('La extensión debe comenzar con un punto (ej: .jpg)')
        .trim()
        .escape(),
    body('mime_type')
        .notEmpty().withMessage('El mime_type es obligatorio')
        .isString().withMessage('El mime_type debe ser un texto')
        .isLength({ max: 50 }).withMessage('El mime_type no puede superar los 50 caracteres')
        .trim()
        .escape()
]

const updateTipoArchivoValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),
    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 10 }).withMessage('El nombre no puede superar los 10 caracteres')
        .trim()
        .escape(),
    body('extension')
        .optional()
        .isString().withMessage('La extensión debe ser un texto')
        .isLength({ max: 10 }).withMessage('La extensión no puede superar los 10 caracteres')
        .matches(/^\./).withMessage('La extensión debe comenzar con un punto (ej: .jpg)')
        .trim()
        .escape(),
    body('mime_type')
        .optional()
        .isString().withMessage('El mime_type debe ser un texto')
        .isLength({ max: 50 }).withMessage('El mime_type no puede superar los 50 caracteres')
        .trim()
        .escape()
]

const getTipoArchivoByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteTipoArchivoValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getTipoArchivosValidators = [
    query('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .trim()
        .escape(),
    query('extension')
        .optional()
        .isString().withMessage('La extensión debe ser un texto')
        .trim()
        .escape(),
    query('mime_type')
        .optional()
        .isString().withMessage('El mime_type debe ser un texto')
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
    createTipoArchivoValidators,
    updateTipoArchivoValidators,
    getTipoArchivoByIdValidators,
    deleteTipoArchivoValidators,
    getTipoArchivosValidators
}