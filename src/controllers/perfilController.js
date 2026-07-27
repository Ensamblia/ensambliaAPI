import perfilModel from '../models/perfilModel.js'

const SEXOS_PERMITIDOS = ["Hombre", "Mujer", "Otro", "Prefiero no decir"]

const getMe = async (req, res) => {
    try {
        const usuario_id = req.usuario.usuario_id
        const data = await perfilModel.getByUsuarioId(usuario_id)
        if (data.length === 0) {
            return res.status(404).json({
                error: "Todavía no has creado tu perfil"
            })
        }
        res.status(200).json(data[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getPerfiles = async (req, res) => {
    try {
        const data = await perfilModel.getPerfiles()
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
        const data = await perfilModel.getById(id)
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

const getByUsuarioId = async (req, res) => {
    try {
        const { usuario_id } = req.query
        const data = await perfilModel.getByUsuarioId(usuario_id)
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

const getByComarcaId = async (req, res) => {
    try {
        const { comarca_id } = req.query
        const data = await perfilModel.getByComarcaId(comarca_id)
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

const deletePerfil = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await perfilModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Perfil no encontrado"
            });
        }
        if (existente.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes borrar el perfil de otro usuario"
            });
        }

        const data = await perfilModel.deletePerfil(id)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const updatePerfil = async (req, res) => {
    try {
        const { id } = req.params

        const existente = await perfilModel.getById(id)
        if (!existente) {
            return res.status(404).json({
                error: "Perfil not found"
            });
        }
        if (existente.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes editar el perfil de otro usuario"
            });
        }

        const payload = req.body || {}
        const updates = []
        const values = []

        const allowedFields = [
            "nombre",
            "apellido",
            "correo",
            "numero_telefono",
            "edad",
            "sexo",
            "disponibilidad",
            "descripcion",
            "comarca_id"
        ]

        const textFields = ["nombre", "apellido", "correo", "descripcion"]
        for (const field of textFields) {
            if (payload[field] !== undefined && (typeof payload[field] !== 'string' || payload[field].trim() === '')) {
                return res.status(400).json({
                    error: `${field} no puede estar vacío`
                })
            }
        }

        const integerFields = ["numero_telefono", "edad", "comarca_id"]
        for (const field of integerFields) {
            if (payload[field] !== undefined && payload[field] !== null && !Number.isInteger(payload[field])) {
                return res.status(400).json({
                    error: `${field} debe ser un entero`
                })
            }
        }

        if (payload.sexo !== undefined && payload.sexo !== null && !SEXOS_PERMITIDOS.includes(payload.sexo)) {
            return res.status(400).json({
                error: `sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(", ")}`
            })
        }

        if (payload.disponibilidad !== undefined && typeof payload.disponibilidad !== 'boolean') {
            return res.status(400).json({
                error: "disponibilidad debe ser true o false"
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

        const result = await perfilModel.updatePerfil(updates, values)

        if (!result) {
            return res.status(404).json({
                error: "Perfil not found"
            });
        }
        res.status(201).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createPerfil = async (req, res) => {
    try {

        const {
            nombre,
            apellido,
            correo,
            numero_telefono,
            edad,
            sexo,
            disponibilidad,
            descripcion,
            comarca_id
        } = req.body

        const usuario_id = req.usuario.usuario_id

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                error: "nombre is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!apellido || apellido.trim() === '') {
            return res.status(400).json({
                error: "apellido is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!correo || correo.trim() === '') {
            return res.status(400).json({
                error: "correo is a mandatory field. Cannot be undefined or null"
            })
        }

        if (!descripcion || descripcion.trim() === '') {
            return res.status(400).json({
                error: "descripcion is a mandatory field. Cannot be undefined or null"
            })
        }

        const integerFields = { numero_telefono, edad, comarca_id, usuario_id }
        for (const field in integerFields) {
            const value = integerFields[field]
            if (value !== undefined && value !== null && !Number.isInteger(value)) {
                return res.status(400).json({
                    error: `${field} must be integer`
                })
            }
        }

        if (sexo !== undefined && sexo !== null && !SEXOS_PERMITIDOS.includes(sexo)) {
            return res.status(400).json({
                error: `sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(", ")}`
            })
        }

        if (disponibilidad !== undefined && typeof disponibilidad !== 'boolean') {
            return res.status(400).json({
                error: "disponibilidad debe ser true o false"
            })
        }

        const columns = [
            "nombre",
            "apellido",
            "correo",
            "numero_telefono",
            "edad",
            "sexo",
            "disponibilidad",
            "descripcion",
            "comarca_id",
            "usuario_id"
        ]

        const values = [
            nombre,
            apellido,
            correo,
            numero_telefono,
            edad,
            sexo,
            disponibilidad ?? true,
            descripcion,
            comarca_id,
            usuario_id
        ]

        const data = await perfilModel.createPerfil(columns, values)
        if (!data) {
            return res.status(404).json({
                error: "Perfil no añadido correctamente"
            });
        }
        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getPerfiles,
    getMe,
    getById,
    getByUsuarioId,
    getByComarcaId,
    deletePerfil,
    updatePerfil,
    createPerfil
}
