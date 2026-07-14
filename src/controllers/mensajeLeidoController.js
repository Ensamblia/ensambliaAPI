import mensajeLeidoModel from '../models/mensajeLeidoModel.js'

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
        const { mensaje_id, perfil_id } = req.params
        const data = await mensajeLeidoModel.getById(mensaje_id, perfil_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for mensaje_id: ${mensaje_id} and perfil_id: ${perfil_id}`
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

const createMensajeLeido = async (req, res) => {
    try {
        const { mensaje_id, perfil_id } = req.body

        if (mensaje_id === undefined || !Number.isInteger(mensaje_id)) {
            return res.status(400).json({
                error: "mensaje_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (perfil_id === undefined || !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id es un campo obligatorio y debe ser un entero"
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

const deleteMensajeLeido = async (req, res) => {
    try {
        const { mensaje_id, perfil_id } = req.params
        const data = await mensajeLeidoModel.deleteMensajeLeido(mensaje_id, perfil_id)
        if (!data) {
            return res.status(404).json({
                error: "Mensaje_leido no encontrado"
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
    getMensajeLeidos,
    getById,
    createMensajeLeido,
    deleteMensajeLeido
}
