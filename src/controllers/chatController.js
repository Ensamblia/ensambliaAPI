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
    getChats,
    getById,
    deleteChat
}
