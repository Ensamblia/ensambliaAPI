import mensajeLeidoModel from '../models/mensajeLeidoModel.js'
import mensajeModel from '../models/mensajeModel.js'
import perfilModel from '../models/perfilModel.js'
import perfilChatModel from '../models/perfilChatModel.js'

const getMiPerfilId = async (req) => {
    const perfiles = await perfilModel.getByUsuarioId(req.usuario.usuario_id)
    return perfiles[0]?.perfil_id ?? null
}

const getMensajeLeidos = async (req, res) => {
    try {
        const data = await mensajeLeidoModel.getMensajeLeidos()
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
        const { mensaje_id, perfil_id } = req.params
        const data = await mensajeLeidoModel.getById(mensaje_id, perfil_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for mensaje_id: ${mensaje_id} and perfil_id: ${perfil_id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createMensajeLeido = async (req, res) => {
    try {
        const { mensaje_id } = req.body

        if (mensaje_id === undefined || !Number.isInteger(mensaje_id)) {
            return res.status(400).json({
                error: "mensaje_id es un campo obligatorio y debe ser un entero"
            })
        }

        const perfil_id = await getMiPerfilId(req)
        if (!perfil_id) {
            return res.status(403).json({
                error: "Necesitas crear tu perfil antes de marcar mensajes como leídos"
            })
        }

        const mensaje = await mensajeModel.getById(mensaje_id)
        if (!mensaje) {
            return res.status(404).json({
                error: `Mensaje no encontrado: ${mensaje_id}`
            })
        }
        const participantes = await perfilChatModel.getByChatId(mensaje.chat_id)
        if (!participantes.some((p) => p.perfil_id === perfil_id)) {
            return res.status(403).json({
                error: "No participas en el chat de este mensaje"
            })
        }

        const data = await mensajeLeidoModel.createMensajeLeido(mensaje_id, perfil_id)
        if (!data) {
            return res.status(404).json({
                error: "Mensaje_leido no añadido correctamente"
            });
        }
        res.status(201).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deleteMensajeLeido = async (req, res) => {
    try {
        const { mensaje_id, perfil_id } = req.params

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || Number(perfil_id) !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes borrar la marca de leído de otro perfil"
            })
        }

        const data = await mensajeLeidoModel.deleteMensajeLeido(mensaje_id, perfil_id)
        if (!data) {
            return res.status(404).json({
                error: "Mensaje_leido no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getMensajeLeidos,
    getById,
    createMensajeLeido,
    deleteMensajeLeido
}
