import { body, param, query } from 'express-validator'

const createMultimediaValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('ruta_archivo')
        .notEmpty().withMessage('La ruta del archivo es obligatoria')
        .isString().withMessage('La ruta del archivo debe ser un texto')
        .isLength({ max: 500 }).withMessage('La ruta del archivo no puede superar los 500 caracteres')
        .trim()
        .escape(),
    body('tamano_bytes')
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage('tamano_bytes debe ser un número entero positivo o cero')
        .toInt(),
    body('tipo_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('tipo_id debe ser un número entero positivo')
        .toInt(),
    body('perfil_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('anuncio_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('anuncio_id debe ser un número entero positivo')
        .toInt()
]

const updateMultimediaValidators = [
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
    body('ruta_archivo')
        .optional()
        .isString().withMessage('La ruta del archivo debe ser un texto')
        .isLength({ max: 500 }).withMessage('La ruta del archivo no puede superar los 500 caracteres')
        .trim()
        .escape(),
    body('tamano_bytes')
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage('tamano_bytes debe ser un número entero positivo o cero')
        .toInt(),
    body('tipo_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('tipo_id debe ser un número entero positivo')
        .toInt(),
    body('perfil_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('anuncio_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('anuncio_id debe ser un número entero positivo')
        .toInt()
]

const getMultimediaByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteMultimediaValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getMultimediaValidators = [
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('anuncio_id')
        .optional()
        .isInt({ min: 1 }).withMessage('anuncio_id debe ser un número entero positivo')
        .toInt(),
    query('tipo_id')
        .optional()
        .isInt({ min: 1 }).withMessage('tipo_id debe ser un número entero positivo')
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
    createMultimediaValidators,
    updateMultimediaValidators,
    getMultimediaByIdValidators,
    deleteMultimediaValidators,
    getMultimediaValidators
}