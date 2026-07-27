import mensajeModel from "../models/mensajeModel.js"
import perfilModel from "../models/perfilModel.js"
import perfilChatModel from "../models/perfilChatModel.js"

const getMiPerfilId = async (req) => {
    const perfiles = await perfilModel.getByUsuarioId(req.usuario.usuario_id)
    return perfiles[0]?.perfil_id ?? null
}

const esParticipante = async (chat_id, perfil_id) => {
    const participantes = await perfilChatModel.getByChatId(chat_id)
    return participantes.some((p) => p.perfil_id === perfil_id)
}

const getMensajes = async (req, res) => {
    try {
        const data = await mensajeModel.getMensajes()
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
        const { id } = req.params
        const data = await mensajeModel.getById(id)
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

const getByChatId = async (req, res) => {
    try {
        const { chat_id } = req.query

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || !(await esParticipante(chat_id, miPerfilId))) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }

        const data = await mensajeModel.getByChatId(chat_id)
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

const getByPerfilId = async (req, res) => {
    try {
        const { perfil_id } = req.query

        const miPerfilId = await getMiPerfilId(req)
        if (!miPerfilId || Number(perfil_id) !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes ver los mensajes de otro perfil"
            })
        }

        const data = await mensajeModel.getByPerfilId(perfil_id)
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

const deleteMensaje = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await mensajeModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Mensaje not found"
            });
        }
        const miPerfilId = await getMiPerfilId(req)
        if (existente.perfil_id !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes borrar un mensaje que no es tuyo"
            })
        }

        const data = await mensajeModel.deleteMensaje(id)
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

const updateMensaje = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await mensajeModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "mensaje not found"
            });
        }
        const miPerfilId = await getMiPerfilId(req)
        if (existente.perfil_id !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes editar un mensaje que no es tuyo"
            })
        }

        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "contenido",
            "esta_eliminado",
        ]

        if (!payload.contenido || payload.contenido.trim() === '') {
            return res.status(400).json({
                error: "Contenido is a mandatory field. Cannot be undefined or null"
            })
        }

        if (payload.esta_eliminado === undefined && payload.esta_eliminado === null) {
            return res.status(400).json({
                error: "esta_eliminado must either true or false"
            });
        }

        for (const field in payload) {
            if (!allowedFields.includes(field)) continue

            if (payload[field] !== undefined) {
                values.push(payload[field])
                updates.push(`${field} = $${values.length}`);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "At least one field must be modified"
            });
        }

        values.push(id)

        const result = await mensajeModel.updateMensaje(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "mensaje not found"
            });
        }
        res.status(201).json(result)
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

const createMensaje = async (req, res) => {
    try {

        const {
            contenido,
            esta_eliminado,
            chat_id
        } = req.body

        if (!contenido || contenido.trim() === '') {
            return res.status(400).json({
                error: "contenido is a mandatory field. Cannot be undefined or null"
            })
        }

        if (chat_id !== undefined && !Number.isInteger(chat_id)) {
            return res.status(400).json({
                error: "chat_id must be integer"
            });
        }

        const perfil_id = await getMiPerfilId(req)
        if (!perfil_id) {
            return res.status(403).json({
                error: "Necesitas crear tu perfil antes de enviar mensajes"
            })
        }
        if (!(await esParticipante(chat_id, perfil_id))) {
            return res.status(403).json({
                error: "No participas en este chat"
            })
        }

        const columns = [
            "contenido",
            "esta_eliminado",
            "chat_id",
            "perfil_id"
        ]

        const values = [
            contenido,
            esta_eliminado,
            chat_id,
            perfil_id
        ]

        const data = await mensajeModel.createMensaje(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Mensaje not added :("
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

export default {
    getMensajes,
    getById,
    getByChatId,
    getByPerfilId,
    deleteMensaje,
    updateMensaje,
    createMensaje
}
