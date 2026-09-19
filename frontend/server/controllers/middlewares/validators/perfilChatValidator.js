import { body, param, query } from 'express-validator'

const createPerfilChatValidators = [
    body('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    body('chat_id')
        .notEmpty().withMessage('chat_id es obligatorio')
        .isInt({ min: 1 }).withMessage('chat_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilChatByIdValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('chat_id')
        .notEmpty().withMessage('chat_id es obligatorio')
        .isInt({ min: 1 }).withMessage('chat_id debe ser un número entero positivo')
        .toInt()
]

const deletePerfilChatValidators = [
    param('perfil_id')
        .notEmpty().withMessage('perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    param('chat_id')
        .notEmpty().withMessage('chat_id es obligatorio')
        .isInt({ min: 1 }).withMessage('chat_id debe ser un número entero positivo')
        .toInt()
]

const getPerfilChatsValidators = [
    query('perfil_id')
        .optional()
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo')
        .toInt(),
    query('chat_id')
        .optional()
        .isInt({ min: 1 }).withMessage('chat_id debe ser un número entero positivo')
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
    createPerfilChatValidators,
    getPerfilChatByIdValidators,
    deletePerfilChatValidators,
    getPerfilChatsValidators
}