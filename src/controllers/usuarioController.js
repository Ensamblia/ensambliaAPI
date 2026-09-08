import bcrypt from 'bcryptjs'
import usuarioModel from '../models/usuarioModel.js'

const getUsuarios = async (req, res) => {
    try {
        const data = await usuarioModel.getUsuarios()
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
        const { id } = req.params
        const data = await usuarioModel.getById(id)
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

const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await usuarioModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Usuario not found"
            });
        }

        const payload = req.body || {}
        const updates = []
        const values = []

        if (payload.usuario !== undefined) {
            values.push(payload.usuario)
            updates.push(`usuario = $${values.length}`)
        }

        if (payload.es_admin !== undefined) {
            values.push(Boolean(payload.es_admin))
            updates.push(`es_admin = $${values.length}`)
        }

        if (payload.password !== undefined) {
            const passwordHash = await bcrypt.hash(payload.password, 10)
            values.push(passwordHash)
            updates.push(`password_hash = $${values.length}`)
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "At least one field must be modified"
            });
        }

        values.push(id)

        const data = await usuarioModel.updateUsuario(updates, values)
        if (!data) {
            return res.status(404).json({
                error: "Usuario not found"
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await usuarioModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Usuario not found"
            });
        }

        const data = await usuarioModel.deleteUsuario(id)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getUsuarios,
    getById,
    updateUsuario,
    deleteUsuario
}
