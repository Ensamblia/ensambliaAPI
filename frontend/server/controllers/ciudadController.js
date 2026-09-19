import ciudadModel from "../models/ciudadModel.js"

const getCiudades = async (req, res) => {
    try {
        const data = await ciudadModel.getCiudades()
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
        const data = await ciudadModel.getById(id)
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

const deleteCiudad = async (req, res) => {
    try {
        const { id } = req.params
        const data = await ciudadModel.deleteCiudad(id)
        if (!data) {
            return res.status(404).json({
                error: "Ciudad not found"
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

const updateCiudad = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "comarca_id"
        ]

        if (!payload.nombre || payload.nombre.trim() === '') {
            return res.status(400).json({
                error: "Nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        if (payload.comarca_id !== undefined && !Number.isInteger(payload.comarca_id)) {
            return res.status(400).json({
                error: "comarca_id must be integer"
            });
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

        const result = await ciudadModel.updateCiudad(updates, values)

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

const createCiudad = async (req, res) => {
    try {

        const {
            nombre,
            comarca_id
        } = req.body

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "Nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        if (comarca_id !== undefined && !Number.isInteger(comarca_id)) {
            return res.status(400).json({
                error: "perfil_id must be integer"
            });
        }

        const columns = [
            "nombre",
            "comarca_id"
        ]

        const values = [
            nombre,
            comarca_id
        ]

        const data = await ciudadModel.createCiudad(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Ciudad not added :("
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
    getCiudades,
    getById,
    deleteCiudad,
    updateCiudad,
    createCiudad
} 