import { body, param, query } from 'express-validator'

const createGrupoValidators = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
        .trim()
        .escape(),
    body('descripcion')
        .optional({ nullable: true })
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres')
        .trim()
        .escape()
]

const updateGrupoValidators = [
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
    body('descripcion')
        .optional({ nullable: true })
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres')
        .trim()
        .escape()
]

const getGrupoByIdValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const deleteGrupoValidators = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .toInt()
]

const getGruposValidators = [
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
    createGrupoValidators,
    updateGrupoValidators,
    getGrupoByIdValidators,
    deleteGrupoValidators,
    getGruposValidators
}