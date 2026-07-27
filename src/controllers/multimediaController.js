import multimediaModel from "../models/multimediaModel.js"
import perfilModel from "../models/perfilModel.js"
import anuncioModel from "../models/anuncioModel.js"

const getMiPerfilId = async (req) => {
    const perfiles = await perfilModel.getByUsuarioId(req.usuario.usuario_id)
    return perfiles[0]?.perfil_id ?? null
}

const getMultimedias = async (req, res) => {
    try {
        const data = await multimediaModel.getMultimedias()
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

        const existente = await multimediaModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Multimedia not found"
            });
        }
        const miPerfilId = await getMiPerfilId(req)
        if (existente.perfil_id !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes borrar el archivo de otro usuario"
            })
        }

        const data = await multimediaModel.deleteMultimedia(id)
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

        const existente = await multimediaModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Multimedia not found"
            });
        }
        const miPerfilId = await getMiPerfilId(req)
        if (existente.perfil_id !== miPerfilId) {
            return res.status(403).json({
                error: "No puedes editar el archivo de otro usuario"
            })
        }

        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "ruta_archivo",
            "tamano_bytes",
            "tipo_id",
            "anuncio_id"
        ]

        if (payload.nombre !== undefined && (!payload.nombre || payload.nombre.trim() === '')) {
            return res.status(400).json({
                error: "nombre no puede estar vacío"
            })
        }

        if (payload.ruta_archivo !== undefined && (!payload.ruta_archivo || payload.ruta_archivo.trim() === '')) {
            return res.status(400).json({
                error: "ruta_archivo no puede estar vacío"
            })
        }

        const integerFields = ["tamano_bytes", "tipo_id", "anuncio_id"]
        for (const field of integerFields) {
            if (payload[field] !== undefined && payload[field] !== null && !Number.isInteger(payload[field])) {
                return res.status(400).json({
                    error: `${field} debe ser un entero`
                })
            }
        }

        if (payload.anuncio_id !== undefined && payload.anuncio_id !== null) {
            const anuncio = await anuncioModel.getById(payload.anuncio_id)
            if (!anuncio) {
                return res.status(404).json({
                    error: `Anuncio no encontrado: ${payload.anuncio_id}`
                })
            }
            if (anuncio.perfil_id !== miPerfilId) {
                return res.status(403).json({
                    error: "No puedes vincular tu archivo al anuncio de otro usuario"
                })
            }
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

        const result = await multimediaModel.updateMultimedia(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Multimedia not found"
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

const createMultimedia = async (req, res) => {
    try {

        const {
            nombre,
            ruta_archivo,
            tamano_bytes,
            tipo_id,
            anuncio_id
        } = req.body

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!ruta_archivo || ruta_archivo.trim() === '') {
            return res.status(400).json({
                error: "ruta_archivo is a mandatory field. Cannot be undefined or null"
            })
        }

        const integerFields = { tamano_bytes, tipo_id, anuncio_id }
        for (const field in integerFields) {
            const value = integerFields[field]
            if (value !== undefined && value !== null && !Number.isInteger(value)) {
                return res.status(400).json({
                    error: `${field} must be integer`
                })
            }
        }

        const perfil_id = await getMiPerfilId(req)
        if (!perfil_id) {
            return res.status(403).json({
                error: "Necesitas crear tu perfil antes de subir un archivo"
            })
        }

        if (anuncio_id !== undefined && anuncio_id !== null) {
            const anuncio = await anuncioModel.getById(anuncio_id)
            if (!anuncio) {
                return res.status(404).json({
                    error: `Anuncio no encontrado: ${anuncio_id}`
                })
            }
            if (anuncio.perfil_id !== perfil_id) {
                return res.status(403).json({
                    error: "No puedes subir un archivo al anuncio de otro usuario"
                })
            }
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
            perfil_id,
            anuncio_id ?? null
        ]

        const data = await multimediaModel.createMultimedia(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Multimedia not added :("
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
    getMultimedias,
    getById,
    getByPerfilId,
    getByAnuncioId,
    deleteMultimedia,
    updateMultimedia,
    createMultimedia
}
