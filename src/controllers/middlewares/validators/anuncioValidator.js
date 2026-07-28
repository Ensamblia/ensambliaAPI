import { body, param, query } from 'express-validator'


const createAnuncioValidators = [
    body('titulo')
        .notEmpty().withMessage('El título es obligatorio')
        .isString().withMessage('El título debe ser un texto')
        .isLength({ min: 3, max: 60 }).withMessage('El título debe tener entre 3 y 60 caracteres')
        .trim()
        .escape(),

    body('contenido')
        .notEmpty().withMessage('El contenido es obligatorio')
        .isString().withMessage('El contenido debe ser un texto')
        .isLength({ min: 10, max: 750 }).withMessage('El contenido debe tener entre 10 y 750 caracteres')
        .trim()
        .escape(),

    body('perfil_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),

    body('tipo_anuncio_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('tipo_anuncio_id debe ser un número entero positivo')
        .toInt()
]

const updateAnuncioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt(),

    body('titulo')
        .optional()
        .isString().withMessage('El título debe ser un texto')
        .isLength({ min: 3, max: 60 }).withMessage('El título debe tener entre 3 y 60 caracteres')
        .trim()
        .escape(),

    body('contenido')
        .optional()
        .isString().withMessage('El contenido debe ser un texto')
        .isLength({ min: 10, max: 750 }).withMessage('El contenido debe tener entre 10 y 750 caracteres')
        .trim()
        .escape(),

    body('perfil_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),

    body('tipo_anuncio_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('tipo_anuncio_id debe ser un número entero positivo')
        .toInt()
]

const getAnuncioByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteAnuncioValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getAnunciosValidators = [
    query('titulo')
        .optional()
        .isString().withMessage('El título debe ser un texto')
        .trim()
        .escape(),

    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),

    query('tipo_anuncio_id')
        .optional()
        .isInt({ min: 1 }).withMessage('tipo_anuncio_id debe ser un número entero positivo')
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
    createAnuncioValidators,
    updateAnuncioValidators,
    getAnuncioByIdValidators,
    deleteAnuncioValidators,
    getAnunciosValidators
}