import grupoGeneroModel from '../models/grupoGeneroModel.js'

const getGrupoGeneros = async (req, res) => {
    try {
        const data = await grupoGeneroModel.getGrupoGeneros()
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
        const { grupo_id, genero_id } = req.params
        const data = await grupoGeneroModel.getById(grupo_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for grupo_id: ${grupo_id} and genero_id: ${genero_id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const createGrupoGenero = async (req, res) => {
    try {
        const { grupo_id, genero_id } = req.body

        if (grupo_id === undefined || !Number.isInteger(grupo_id)) {
            return res.status(400).json({
                error: "grupo_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (genero_id === undefined || !Number.isInteger(genero_id)) {
            return res.status(400).json({
                error: "genero_id es un campo obligatorio y debe ser un entero"
            })
        }

        const data = await grupoGeneroModel.createGrupoGenero(grupo_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Grupo_genero no añadido correctamente"
            });
        }
        res.status(201).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deleteGrupoGenero = async (req, res) => {
    try {
        const { grupo_id, genero_id } = req.params
        const data = await grupoGeneroModel.deleteGrupoGenero(grupo_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Grupo_genero no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getGrupoGeneros,
    getById,
    createGrupoGenero,
    deleteGrupoGenero
}
