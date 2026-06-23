import anuncioModel from '../models/anuncioModel.js'

const getAnuncios = async (req, res) => {
    try {
        const data = await anuncioModel.getAnuncios()
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
        const data = await anuncioModel.getById(id)
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

const deleteAnuncio = async (req, res) => {
    try {
        const { id } = req.params
        const data = await anuncioModel.deleteAnuncio(id)
        if (!data) {
            return res.status(404).json({
                error: "Anuncio not found"
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

const updateAnuncio = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "titulo",
            "contenido",
            "tipo_anuncio_id"
        ]

        if (!payload.titulo || payload.titulo.trim() === '') {
            return res.status(400).json({
                error: "Titulo is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!payload.contenido || payload.contenido.trim() === '') {
            return res.status(400).json({
                error: "Contenido is a mandatory field. Cannot be undefined or null"
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

        const result = await anuncioModel.updateAnuncio(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Anuncio not found"
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

const createAnuncio = async (req, res) => {
    try {

        const {
            titulo,
            contenido,
            perfil_id,
            tipo_anuncio_id
        } = req.body

        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({
                error: "Titulo is a mandatory field. Cannot be undefined or null"
            })
        }

        if (perfil_id !== undefined && !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id must be integer"
            });
        }

        if (tipo_anuncio_id !== undefined && !Number.isInteger(tipo_anuncio_id)) {
            return res.status(400).json({
                error: "tipo_anuncio_id must be integer"
            });
        }

        const columns = [
            "titulo",
            "contenido",
            "perfil_id",
            "tipo_anuncio_id"
        ]

        const values = [
            titulo,
            contenido ?? null,
            perfil_id,
            tipo_anuncio_id
        ]

        const data = await anuncioModel.createAnuncio(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Anuncio not published :("
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
    getAnuncios,
    getById,
    deleteAnuncio,
    updateAnuncio,
    createAnuncio
} 