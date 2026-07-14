import perfilChatModel from '../models/perfilChatModel.js'

const getPerfilChats = async (req, res) => {
    try {
        const data = await perfilChatModel.getPerfilChats()
        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

const getById = async (req, res) => {
    try {
        const { perfil_id, chat_id } = req.params
        const data = await perfilChatModel.getById(perfil_id, chat_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and chat_id: ${chat_id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

const getByPerfilId = async (req, res) => {
    try {
        const { perfil_id } = req.query
        const data = await perfilChatModel.getByPerfilId(perfil_id)
        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

const getByChatId = async (req, res) => {
    try {
        const { chat_id } = req.query
        const data = await perfilChatModel.getByChatId(chat_id)
        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

const createPerfilChat = async (req, res) => {
    try {
        const { perfil_id, chat_id } = req.body

        if (perfil_id === undefined || !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (chat_id === undefined || !Number.isInteger(chat_id)) {
            return res.status(400).json({
                error: "chat_id es un campo obligatorio y debe ser un entero"
            })
        }

        const data = await perfilChatModel.createPerfilChat(perfil_id, chat_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_chat no añadido correctamente"
            });
        }
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

const deletePerfilChat = async (req, res) => {
    try {
        const { perfil_id, chat_id } = req.params
        const data = await perfilChatModel.deletePerfilChat(perfil_id, chat_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_chat no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }
}

export default {
    getPerfilChats,
    getById,
    getByPerfilId,
    getByChatId,
    createPerfilChat,
    deletePerfilChat
}
