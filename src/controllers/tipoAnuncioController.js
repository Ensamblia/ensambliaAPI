import tipoAnuncioModel from "../models/tipoAnuncioModel.js"

const getTipoAnuncios = async (req, res) => {
    try {
        const data = await tipoAnuncioModel.getTipoAnuncios()
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
        const data = await tipoAnuncioModel.getById(id)
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

const deleteTipoAnuncio = async (req, res) => {
    try {
        const { id } = req.params
        const data = await tipoAnuncioModel.deleteTipoAnuncio(id)
        if (!data) {
            return res.status(404).json({
                error: "Tipo_anuncio not found"
            });
        }
        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const updateTipoAnuncio = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "tipo"
        ]

        if (!payload.tipo || payload.tipo.trim() === '') {
            return res.status(400).json({
                error: "Tipo is a mandatory field. Cannot be undefined or null"
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

        const result = await tipoAnuncioModel.updateTipoAnuncio(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Tipo_anuncio not found"
            });
        }
        res.status(201).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createTipoAnuncio = async (req, res) => {
    try {

        const { tipo } = req.body

        if (!tipo || tipo.trim() === '') {
            return res.status(400).json({
                error: "Tipo is a mandatory field. Cannot be undefined or null"
            })
        }

        const columns = [
            "tipo"
        ]

        const values = [
            tipo
        ]

        const data = await tipoAnuncioModel.createTipoAnuncio(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Tipo_anuncio not added :("
            });
        }
        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getTipoAnuncios,
    getById,
    deleteTipoAnuncio,
    updateTipoAnuncio,
    createTipoAnuncio
}
