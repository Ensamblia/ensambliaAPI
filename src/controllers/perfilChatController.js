import perfilChatModel from '../models/perfilChatModel.js'
import perfilModel from '../models/perfilModel.js'

const getMiPerfilId = async (req) => {
    const perfiles = await perfilModel.getByUsuarioId(req.usuario.usuario_id)
    return perfiles[0]?.perfil_id ?? null
}

const getPerfilChats = async (req, res) => {
    try {
        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }

        const misChats = await perfilChatModel.getByPerfilId(miPerfilId).catch(() => [])
        const misChatIds = new Set(misChats.map((pc) => pc.chat_id))

        const todos = await perfilChatModel.getPerfilChats()
        const data = todos.filter((pc) => misChatIds.has(pc.chat_id))

        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getById = async (req, res) => {
    try {
        const { perfil_id, chat_id } = req.params

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }
        if (Number(perfil_id) !== miPerfilId) {
            const participantes = await perfilChatModel.getByChatId(chat_id).catch(() => [])
            if (!participantes.some((p) => p.perfil_id === miPerfilId)) {
                return res.status(403).json({
                    error: "No participas en este chat"
                })
            }
        }

        const data = await perfilChatModel.getById(perfil_id, chat_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and chat_id: ${chat_id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getByPerfilId = async (req, res) => {
    try {
        const { perfil_id } = req.query

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || Number(perfil_id) !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes ver los chats de otro perfil"
            })
        }

        const data = await perfilChatModel.getByPerfilId(perfil_id)
        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getByChatId = async (req, res) => {
    try {
        const { chat_id } = req.query

        const miPerfilId = await getMiPerfilId(req)
        const participantes = await perfilChatModel.getByChatId(chat_id)
        if (!miPerfilId || !participantes.some((p) => p.perfil_id === miPerfilId)) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }

        const data = participantes
        if (data.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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

        const miPerfilId = await getMiPerfilId(req)
        if (perfil_id !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes añadir a otro perfil a un chat"
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
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deletePerfilChat = async (req, res) => {
    try {
        const { perfil_id, chat_id } = req.params

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || Number(perfil_id) !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes sacar a otro perfil de un chat"
            })
        }

        const data = await perfilChatModel.deletePerfilChat(perfil_id, chat_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_chat no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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
