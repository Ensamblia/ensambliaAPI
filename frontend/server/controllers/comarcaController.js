import comarcaModel from "../models/comarcaModel.js"

const getComarcas = async (req, res) => {
    try {
        const data = await comarcaModel.getComarcas()
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
        const data = await comarcaModel.getById(id)
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

const deleteComarca = async (req, res) => {
    try {
        const { id } = req.params
        const data = await comarcaModel.deleteComarca(id)
        if (!data) {
            return res.status(404).json({
                error: "Comarca not found"
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

const updateComarca = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
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

        const result = await comarcaModel.updateComarca(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Ciudad not found"
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

const createComarca = async (req, res) => {
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

        const data = await comarcaModel.createComarca(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Comarca not added :("
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
    getComarcas,
    getById,
    deleteComarca,
    updateComarca,
    createComarca
} 