import grupoModel from "../models/grupoModel.js"

const getGrupos = async (req, res) => {
    try {
        const data = await grupoModel.getGrupos()
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
        const data = await grupoModel.getById(id)
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

const deleteGrupo = async (req, res) => {
    try {
        const { id } = req.params
        const data = await grupoModel.deleteGrupo(id)
        if (!data) {
            return res.status(404).json({
                error: "Grupo not found"
            });
        }
        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const updateGrupo = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "descripcion"
        ]

        const hasValidField = Object.keys(payload).some(field => allowedFields.includes(field))
        if (!hasValidField) {
            return res.status(400).json({
                error: "Debe enviar al menos un campo válido para actualizar"
            })
        }

        if (payload.nombre !== undefined && (typeof payload.nombre !== 'string' || payload.nombre.trim() === '')) {
            return res.status(400).json({
                error: "nombre no puede estar vacío"
            })
        }

        if (payload.descripcion !== undefined && (typeof payload.descripcion !== 'string')) {
            return res.status(400).json({
                error: "descripcion debe ser un texto"
            })
        }

        for (const field of allowedFields) {
            if (payload[field] !== undefined) {
                values.push(payload[field])
                updates.push(`${field} = $${values.length}`)
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "At least one field must be modified"
            });
        }

        values.push(id)

        const result = await grupoModel.updateGrupo(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Grupo not found"
            });
        }
        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createGrupo = async (req, res) => {
    try {

        const {
            nombre,
            descripcion
        } = req.body

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "nombre es un campo obligatorio"
            })
        }

        if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
            return res.status(400).json({
                error: "descripcion debe ser un texto"
            })
        }

        const columns = [
            "nombre",
            "descripcion"
        ]

        const values = [
            nombre,
            descripcion ?? null
        ]

        const data = await grupoModel.createGrupo(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Grupo no añadido correctamente"
            });
        }
        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getGrupos,
    getById,
    deleteGrupo,
    updateGrupo,
    createGrupo
}
