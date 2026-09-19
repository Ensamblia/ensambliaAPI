import generoMusicalModel from "../models/generoMusicalModel.js"

const getGeneroMusical = async (req, res) => {
    try {
        const data = await generoMusicalModel.getGeneroMusical()
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
        const data = await generoMusicalModel.getById(id)
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

const deleteGeneroMusical = async (req, res) => {
    try {
        const { id } = req.params
        const data = await generoMusicalModel.deleteGeneroMusical(id)
        if (!data) {
            return res.status(404).json({
                error: "GeneroMusical not found"
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

const updateGeneroMusical = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre"
        ]

        if (!payload.nombre || payload.nombre.trim() === '') {
            return res.status(400).json({
                error: "Nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        for (const field in payload) {
            if (!allowedFields.includes(field)) continue

            if (payload[field] !== undefined) {
                values.push(payload[field])

                if (field === "fulltext") {
                    updates.push(`${field} = $${values.length}::tsvector`);
                } else {
                    updates.push(`${field} = $${values.length}`);
                }
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "At least one field must be modified"
            });
        }

        values.push(id)

        const result = await generoMusicalModel.updateGeneroMusical(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "GeneroMusical not found"
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

const createGeneroMusical = async (req, res) => {
    try {

        const {
            nombre
        } = req.body

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "Nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        const columns = [
            "nombre"
        ]

        const values = [
            nombre
        ]

        const data = await generoMusicalModel.createGeneroMusical(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "GeneroMusical not added :("
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
    getGeneroMusical,
    getById,
    deleteGeneroMusical,
    updateGeneroMusical,
    createGeneroMusical
}