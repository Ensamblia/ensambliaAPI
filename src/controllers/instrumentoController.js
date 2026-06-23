import instrumentoModel from '../models/instrumentoModel.js'

const getInstrumentos = async (req, res) => {
    try {
        const data = await instrumentoModel.getInstrumentos()
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
        const data = await instrumentoModel.getById(id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for id: ${id}`
            });
        }
        res.status(220).json(data)
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

const createInstrumento = async (req, res) => {
    try {
        const { nombre } = req.body
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "Nombre es un campo obligatorio. No puede estar vacío, ni ser undefined o null"
            })
        }
        const data = await instrumentoModel.createInstrumento(nombre)
        if (!data) {
            return res.status(404).json({
                error: "Instrumento no añadido correctamente"
            });
        }
        res.status(201).json(data);
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

const updateInstrumento = async (req, res) => {
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
                error: "Nombre es un campo obligatorio. No puede estar vacío, ni ser undefined o null"
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
                error: "Debe enviar al menos un campo para actualizar"
            });
        }

        values.push(id)

        const result = await instrumentoModel.updateInstrumento(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Instrumento no encontrado"
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

const deleteInstrumento = async (req, res) => {
    try {
        const { id } = req.params
        const data = await instrumentoModel.deleteInstrumento(id)
        if (!data) {
            return res.status(404).json({
                error: "Instrumento no encontrado"
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
    getInstrumentos,
    getById,
    createInstrumento,
    updateInstrumento,
    deleteInstrumento
}

// req.query -> /?nblala?blbl?ba  para buscar múltiples parámetros en la URL
//req.params -> /:  para buscar uno después del :