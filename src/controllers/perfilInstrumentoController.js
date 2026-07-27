import perfilInstrumentoModel from '../models/perfilInstrumentoModel.js'
import perfilModel from '../models/perfilModel.js'

const getPerfilInstrumentos = async (req, res) => {
    try {
        const data = await perfilInstrumentoModel.getPerfilInstrumentos()
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
        const { perfil_id, instrumento_id } = req.params
        const data = await perfilInstrumentoModel.getById(perfil_id, instrumento_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and instrumento_id: ${instrumento_id}`
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
        const data = await perfilInstrumentoModel.getByPerfilId(perfil_id)
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

const getByInstrumentoId = async (req, res) => {
    try {
        const { instrumento_id } = req.query
        const data = await perfilInstrumentoModel.getByInstrumentoId(instrumento_id)
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

const createPerfilInstrumento = async (req, res) => {
    try {
        const { perfil_id, instrumento_id } = req.body

        if (perfil_id === undefined || !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (instrumento_id === undefined || !Number.isInteger(instrumento_id)) {
            return res.status(400).json({
                error: "instrumento_id es un campo obligatorio y debe ser un entero"
            })
        }

        const perfil = await perfilModel.getById(perfil_id)
        if (!perfil) {
            return res.status(404).json({
                error: `Perfil no encontrado: ${perfil_id}`
            })
        }
        if (perfil.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes modificar el perfil de otro usuario"
            })
        }

        const data = await perfilInstrumentoModel.createPerfilInstrumento(perfil_id, instrumento_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_instrumento no añadido correctamente"
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

const deletePerfilInstrumento = async (req, res) => {
    try {
        const { perfil_id, instrumento_id } = req.params

        const perfil = await perfilModel.getById(perfil_id)
        if (!perfil) {
            return res.status(404).json({
                error: `Perfil no encontrado: ${perfil_id}`
            })
        }
        if (perfil.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes modificar el perfil de otro usuario"
            })
        }

        const data = await perfilInstrumentoModel.deletePerfilInstrumento(perfil_id, instrumento_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_instrumento no encontrado"
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
    getPerfilInstrumentos,
    getById,
    getByPerfilId,
    getByInstrumentoId,
    createPerfilInstrumento,
    deletePerfilInstrumento
}
