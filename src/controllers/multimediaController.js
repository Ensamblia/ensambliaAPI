import multimediaModel from "../models/multimediaModel.js"

const getMultimedia = async (req, res) => {
    try {
        const data = await multimediaModel.getMultimedia()
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
        const data = await multimediaModel.getById(id)
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

const getByPerfilId = async (req, res) => {
    try {
        const { perfil_id } = req.query
        if (!perfil_id) {
            return res.status(400).json({
                error: "perfil_id es un parámetro requerido"
            })
        }
        const data = await multimediaModel.getByPerfilId(perfil_id)
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

const getByAnuncioId = async (req, res) => {
    try {
        const { anuncio_id } = req.query
        if (!anuncio_id) {
            return res.status(400).json({
                error: "anuncio_id es un parámetro requerido"
            })
        }
        const data = await multimediaModel.getByAnuncioId(anuncio_id)
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

const deleteMultimedia = async (req, res) => {
    try {
        const { id } = req.params
        const data = await multimediaModel.deleteMultimedia(id)
        if (!data) {
            return res.status(404).json({
                error: "Multimedia not found"
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

const updateMultimedia = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "ruta_archivo",
            "tamano_bytes",
            "tipo_id",
            "perfil_id",
            "anuncio_id"
        ]

        // Validar que al menos un campo venga en el payload
        const hasValidField = Object.keys(payload).some(field => allowedFields.includes(field))
        if (!hasValidField) {
            return res.status(400).json({
                error: "Debe enviar al menos un campo válido para actualizar"
            })
        }

        // Validaciones específicas
        if (payload.nombre !== undefined && (typeof payload.nombre !== 'string' || payload.nombre.trim() === '')) {
            return res.status(400).json({
                error: "nombre no puede estar vacío"
            })
        }

        if (payload.ruta_archivo !== undefined && (typeof payload.ruta_archivo !== 'string' || payload.ruta_archivo.trim() === '')) {
            return res.status(400).json({
                error: "ruta_archivo no puede estar vacío"
            })
        }

        const integerFields = ["tamano_bytes", "tipo_id", "perfil_id", "anuncio_id"]
        for (const field of integerFields) {
            if (payload[field] !== undefined && payload[field] !== null && !Number.isInteger(payload[field])) {
                return res.status(400).json({
                    error: `${field} debe ser un entero`
                })
            }
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

        const result = await multimediaModel.updateMultimedia(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Multimedia not found"
            });
        }
        res.status(200).json(result)
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

const createMultimedia = async (req, res) => {
    try {
        const {
            nombre,
            ruta_archivo,
            tamano_bytes,
            tipo_id,
            perfil_id,
            anuncio_id
        } = req.body

        // Validaciones
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "nombre es un campo obligatorio"
            })
        }

        if (!ruta_archivo || ruta_archivo.trim() === '') {
            return res.status(400).json({
                error: "ruta_archivo es un campo obligatorio"
            })
        }

        if (tipo_id !== undefined && tipo_id !== null && !Number.isInteger(tipo_id)) {
            return res.status(400).json({
                error: "tipo_id debe ser un entero"
            })
        }

        if (perfil_id !== undefined && perfil_id !== null && !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id debe ser un entero"
            })
        }

        if (anuncio_id !== undefined && anuncio_id !== null && !Number.isInteger(anuncio_id)) {
            return res.status(400).json({
                error: "anuncio_id debe ser un entero"
            })
        }

        const columns = [
            "nombre",
            "ruta_archivo",
            "tamano_bytes",
            "tipo_id",
            "perfil_id",
            "anuncio_id"
        ]

        const values = [
            nombre,
            ruta_archivo,
            tamano_bytes ?? null,
            tipo_id ?? null,
            perfil_id ?? null,
            anuncio_id ?? null
        ]

        const data = await multimediaModel.createMultimedia(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Multimedia no añadida correctamente"
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
    getMultimedia,
    getById,
    getByPerfilId,
    getByAnuncioId,
    deleteMultimedia,
    updateMultimedia,
    createMultimedia
}