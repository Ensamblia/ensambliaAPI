import chatModel from '../models/chatModel.js';
import perfilModel from '../models/perfilModel.js'
import perfilChatModel from '../models/perfilChatModel.js'

const getMiPerfilId = async (req) => {
    const perfiles = await perfilModel.getByUsuarioId(req.usuario.usuario_id)
    return perfiles[0]?.perfil_id ?? null
}

const esParticipante = async (chat_id, perfil_id) => {
    const participantes = await perfilChatModel.getByChatId(chat_id)
    return participantes.some((p) => p.perfil_id === perfil_id)
}

const getChats = async (req, res) => {
    try {
        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }

        const misPerfilChats = await perfilChatModel.getByPerfilId(miPerfilId).catch(() => [])
        const misChatIds = new Set(misPerfilChats.map((pc) => pc.chat_id))

        const data = await chatModel.getChats()
        const misChats = data.filter((chat) => misChatIds.has(chat.chat_id))

        if (misChats.length === 0) {
            return res.status(404).json({
                error: "Nothing found"
            })
        }
        res.status(200).json(misChats)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || !(await esParticipante(id, miPerfilId))) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }

        const data = await chatModel.getById(id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for id: ${id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const iniciarConversacion = async (req, res) => {
    try {
        const otroPerfilId = Number(req.params.otro_perfil_id)
        if (!Number.isInteger(otroPerfilId)) {
            return res.status(400).json({
                error: "otro_perfil_id debe ser un entero"
            })
        }

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId) {
            return res.status(403).json({
                error: "Necesitas crear tu perfil antes de iniciar una conversación"
            })
        }

        if (otroPerfilId === miPerfilId) {
            return res.status(400).json({
                error: "No puedes iniciar un chat contigo mismo"
            })
        }

        const otroPerfil = await perfilModel.getById(otroPerfilId)
        if (!otroPerfil) {
            return res.status(404).json({
                error: `Perfil no encontrado: ${otroPerfilId}`
            })
        }

        const misPerfilChats = await perfilChatModel.getByPerfilId(miPerfilId).catch(() => [])
        for (const { chat_id } of misPerfilChats) {
            const participantes = await perfilChatModel.getByChatId(chat_id)
            const idsParticipantes = participantes.map((p) => p.perfil_id)
            if (idsParticipantes.length === 2 && idsParticipantes.includes(otroPerfilId)) {
                return res.status(200).json({ chat_id })
            }
        }

        const chat = await chatModel.createChat()
        await perfilChatModel.createPerfilChat(miPerfilId, chat.chat_id)
        await perfilChatModel.createPerfilChat(otroPerfilId, chat.chat_id)

        res.status(201).json({ chat_id: chat.chat_id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deleteChat = async (req, res) => {
    try {
        const { id } = req.params

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || !(await esParticipante(id, miPerfilId))) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }

        const data = await chatModel.deleteChat(id)
        if (!data) {
            return res.status(404).json({
                error: "Chat not found"
            });
        }
        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getChats,
    getById,
    deleteChat,
    iniciarConversacion
}
