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

        if (payload.nombre !== undefined && (!payload.nombre || payload.nombre.trim() === '')) {
            return res.status(400).json({
                error: "Nombre no puede estar vacío"
            })
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

        const result = await grupoModel.updateGrupo(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Grupo not found"
            });
        }
        res.status(201).json(result)
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
                error: "Nombre is a mandatory field. Cannot be undefined or null"
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
                error: "Grupo not added :("
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
