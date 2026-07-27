import tipoArchivoModel from "../models/tipoArchivoModel.js"

const getTipoArchivos = async (req, res) => {
    try {
        const data = await tipoArchivoModel.getTipoArchivos()
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
        const data = await tipoArchivoModel.getById(id)
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

const deleteTipoArchivo = async (req, res) => {
    try {
        const { id } = req.params
        const data = await tipoArchivoModel.deleteTipoArchivo(id)
        if (!data) {
            return res.status(404).json({
                error: "Tipo_archivo not found"
            });
        }
        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const updateTipoArchivo = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "extension",
            "mime_type"
        ]

        const textFields = ["nombre", "extension", "mime_type"]
        for (const field of textFields) {
            if (payload[field] !== undefined && (typeof payload[field] !== 'string' || payload[field].trim() === '')) {
                return res.status(400).json({
                    error: `${field} no puede estar vacío`
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

        const result = await tipoArchivoModel.updateTipoArchivo(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Tipo_archivo not found"
            });
        }
        res.status(201).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createTipoArchivo = async (req, res) => {
    try {

        const {
            nombre,
            extension,
            mime_type
        } = req.body

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!extension || extension.trim() === '') {
            return res.status(400).json({
                error: "extension is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!mime_type || mime_type.trim() === '') {
            return res.status(400).json({
                error: "mime_type is a mandatory field. Cannot be undefined or null"
            })
        }

        const columns = [
            "nombre",
            "extension",
            "mime_type"
        ]

        const values = [
            nombre,
            extension,
            mime_type
        ]

        const data = await tipoArchivoModel.createTipoArchivo(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Tipo_archivo not added :("
            });
        }
        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getTipoArchivos,
    getById,
    deleteTipoArchivo,
    updateTipoArchivo,
    createTipoArchivo
}
