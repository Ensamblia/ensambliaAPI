import mensajeModel from "../models/mensajeModel.js"

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
        const data = await mensajeModel.deleteMensaje(id)
        if (!data) {
            return res.status(404).json({
                error: "Mensaje not found"
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

const updateMensaje = async (req, res) => {
    try {
        const { id } = req.params
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
            chat_id,
            perfil_id
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

        if (perfil_id !== undefined && !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id must be integer"
            });
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
