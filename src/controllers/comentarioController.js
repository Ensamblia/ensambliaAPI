import comentarioModel from "../models/comentarioModel.js"

const getComentarios = async (req, res) => {
    try {
        const data = await comentarioModel.getComentarios()
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
        const data = await comentarioModel.getById(id)
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
        const data = await comentarioModel.getByPerfilId(perfil_id)
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
        const data = await comentarioModel.getByAnuncioId(anuncio_id)
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

const deleteComentario = async (req, res) => {
    try {
        const { id } = req.params
        const data = await comentarioModel.deleteComentario(id)
        if (!data) {
            return res.status(404).json({
                error: "Comentario not found"
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

const updateComentario = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "contenido",
            "esta_eliminado",
        ]

        if (!payload.contenido || payload.contenido.trim() === '') {
            return res.status(400).json({
                error: "Contenido is a mandatory field. Cannot be undefined or null"
            })
        }

        if (payload.esta_eliminado === undefined && payload.esta_eliminado === null) {
            return res.status(400).json({
                error: "esta_eliminado must either true or false"
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

        const result = await comentarioModel.updateComentario(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "comentario not found"
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

const createComentario = async (req, res) => {
    try {

        const {
            contenido,
            esta_eliminado,
            anuncio_id,
            perfil_id
        } = req.body

        if (!contenido || contenido.trim() === '') {
            return res.status(400).json({
                error: "contenido is a mandatory field. Cannot be undefined or null"
            })
        }

        if (anuncio_id !== undefined && !Number.isInteger(anuncio_id)) {
            return res.status(400).json({
                error: "anuncio_id must be integer"
            });
        }

        if (perfil_id !== undefined && !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id must be integer"
            });
        }


        const columns = [
            "contenido",
            "esta_eliminado",
            "anuncio_id",
            "perfil_id"
        ]

        const values = [
            contenido,
            esta_eliminado,
            anuncio_id,
            perfil_id
        ]

        const data = await comentarioModel.createComentario(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Comentario not added :("
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
    getComentarios,
    getById,
    getByPerfilId,
    getByAnuncioId,
    deleteComentario,
    updateComentario,
    createComentario
} 