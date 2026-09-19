import { body, param, query } from 'express-validator'

const createPerfilGeneroMusicalValidators = [
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilGeneroMusicalByIdValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const deletePerfilGeneroMusicalValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('genero_id')
        .notEmpty().withMessage('genero_id es obligatorio')
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilGeneroMusicalesValidators = [
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('genero_id')
        .optional()
        .isInt({ min: 1 }).withMessage('genero_id debe ser un número entero positivo')
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
    createPerfilGeneroMusicalValidators,
    getPerfilGeneroMusicalByIdValidators,
    deletePerfilGeneroMusicalValidators,
    getPerfilGeneroMusicalesValidators
}