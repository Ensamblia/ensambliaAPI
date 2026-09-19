import { body, param, query } from 'express-validator'

const SEXOS_PERMITIDOS = ["Hombre", "Mujer", "Otro", "Prefiero no decir"]

const createPerfilValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('apellido')
        .notEmpty().withMessage('El apellido es obligatorio')
        .isString().withMessage('El apellido debe ser un texto')
        .isLength({ max: 50 }).withMessage('El apellido no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('correo')
        .notEmpty().withMessage('El correo es obligatorio')
        .isEmail().withMessage('El correo debe tener un formato válido')
        .isLength({ max: 50 }).withMessage('El correo no puede superar los 50 caracteres')
        .trim()
        .normalizeEmail(),
    body('numero_telefono')
        .optional({ nullable: true })
        .isInt({ min: 100000000, max: 999999999 }).withMessage('El teléfono debe tener 9 dígitos')
        .toInt(),
    body('edad')
        .optional({ nullable: true })
        .isInt({ min: 1, max: 120 }).withMessage('La edad debe estar entre 1 y 120 años')
        .toInt(),
    body('sexo')
        .optional({ nullable: true })
        .isIn(SEXOS_PERMITIDOS).withMessage(`El sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(", ")}`),
    body('disponibilidad')
        .optional()
        .isBoolean().withMessage('La disponibilidad debe ser un booleano')
        .toBoolean(),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 150 }).withMessage('La descripción no puede superar los 150 caracteres')
        .trim()
        .escape(),
    body('comarca_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
        .toInt(),
    body('usuario_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('usuario_id debe ser un número entero positivo')
        .toInt()
]

const updatePerfilValidators = [
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
    body('apellido')
        .optional()
        .isString().withMessage('El apellido debe ser un texto')
        .isLength({ max: 50 }).withMessage('El apellido no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('correo')
        .optional()
        .isEmail().withMessage('El correo debe tener un formato válido')
        .isLength({ max: 50 }).withMessage('El correo no puede superar los 50 caracteres')
        .trim()
        .normalizeEmail(),
    body('numero_telefono')
        .optional({ nullable: true })
        .isInt({ min: 100000000, max: 999999999 }).withMessage('El teléfono debe tener 9 dígitos')
        .toInt(),
    body('edad')
        .optional({ nullable: true })
        .isInt({ min: 1, max: 120 }).withMessage('La edad debe estar entre 1 y 120 años')
        .toInt(),
    body('sexo')
        .optional({ nullable: true })
        .isIn(SEXOS_PERMITIDOS).withMessage(`El sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(", ")}`),
    body('disponibilidad')
        .optional()
        .isBoolean().withMessage('La disponibilidad debe ser un booleano')
        .toBoolean(),
    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 150 }).withMessage('La descripción no puede superar los 150 caracteres')
        .trim()
        .escape(),
    body('comarca_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
        .toInt(),
    body('usuario_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('usuario_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deletePerfilValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getPerfilesValidators = [
    query('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .trim()
        .escape(),
    query('apellido')
        .optional()
        .isString().withMessage('El apellido debe ser un texto')
        .trim()
        .escape(),
    query('correo')
        .optional()
        .isEmail().withMessage('El correo debe tener un formato válido')
        .trim()
        .normalizeEmail(),
    query('comarca_id')
        .optional()
        .isInt({ min: 1 }).withMessage('comarca_id debe ser un número entero positivo')
        .toInt(),
    query('usuario_id')
        .optional()
        .isInt({ min: 1 }).withMessage('usuario_id debe ser un número entero positivo')
        .toInt(),
    query('disponibilidad')
        .optional()
        .isBoolean().withMessage('La disponibilidad debe ser un booleano')
        .toBoolean(),
    query('sexo')
        .optional()
        .isIn(SEXOS_PERMITIDOS).withMessage(`El sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(", ")}`),
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
    createPerfilValidators,
    updatePerfilValidators,
    getPerfilByIdValidators,
    deletePerfilValidators,
    getPerfilesValidators
}