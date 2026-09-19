import { body, param, query } from 'express-validator'

const createComentarioValidators = [
    body('contenido')
        .notEmpty().withMessage('El contenido es obligatorio')
        .isString().withMessage('El contenido debe ser un texto')
        .isLength({ min: 3, max: 500 }).withMessage('El contenido debe tener entre 3 y 500 caracteres')
        .trim()
        .escape(),
    body('esta_eliminado')
        .optional()
        .isBoolean().withMessage('esta_eliminado debe ser un booleano')
        .toBoolean(),
    body('anuncio_id')
        .notEmpty().withMessage('anuncio_id es obligatorio')
        .isInt({ min: 1 }).withMessage('anuncio_id debe ser un número entero positivo')
        .toInt(),
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt()
]

const updateComentarioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),
    body('contenido')
        .optional()
        .isString().withMessage('El contenido debe ser un texto')
        .isLength({ min: 3, max: 500 }).withMessage('El contenido debe tener entre 3 y 500 caracteres')
        .trim()
        .escape(),
    body('esta_eliminado')
        .optional()
        .isBoolean().withMessage('esta_eliminado debe ser un booleano')
        .toBoolean()
]

const getComentarioByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteComentarioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getComentariosValidators = [
    query('anuncio_id')
        .optional()
        .isInt({ min: 1 }).withMessage('anuncio_id debe ser un número entero positivo')
        .toInt(),
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('fecha_desde')
        .optional()
        .isISO8601().withMessage('fecha_desde debe ser una fecha válida (YYYY-MM-DD)')
        .toDate(),
    query('fecha_hasta')
        .optional()
        .isISO8601().withMessage('fecha_hasta debe ser una fecha válida (YYYY-MM-DD)')
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
    createComentarioValidators,
    updateComentarioValidators,
    getComentarioByIdValidators,
    deleteComentarioValidators,
    getComentariosValidators
}
