import perfilGrupoModel from '../models/perfilGrupoModel.js'
import perfilModel from '../models/perfilModel.js'

const getPerfilGrupos = async (req, res) => {
    try {
        const data = await perfilGrupoModel.getPerfilGrupos()
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
        const { perfil_id, grupo_id } = req.params
        const data = await perfilGrupoModel.getById(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and grupo_id: ${grupo_id}`
            });
        }
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const getByPerfilId = async (req, res) => {
    try {
        const { perfil_id } = req.query
        const data = await perfilGrupoModel.getByPerfilId(perfil_id)
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

const getByGrupoId = async (req, res) => {
    try {
        const { grupo_id } = req.query
        const data = await perfilGrupoModel.getByGrupoId(grupo_id)
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

const createPerfilGrupo = async (req, res) => {
    try {
        const { perfil_id, grupo_id } = req.body

        if (perfil_id === undefined || !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (grupo_id === undefined || !Number.isInteger(grupo_id)) {
            return res.status(400).json({
                error: "grupo_id es un campo obligatorio y debe ser un entero"
            })
        }

        const perfil = await perfilModel.getById(perfil_id)
        if (!perfil) {
            return res.status(404).json({
                error: `Perfil no encontrado: ${perfil_id}`
            })
        }
        if (perfil.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes modificar el perfil de otro usuario"
            })
        }

        const data = await perfilGrupoModel.createPerfilGrupo(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_grupo no añadido correctamente"
            });
        }
        res.status(201).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deletePerfilGrupo = async (req, res) => {
    try {
        const { perfil_id, grupo_id } = req.params

        const perfil = await perfilModel.getById(perfil_id)
        if (!perfil) {
            return res.status(404).json({
                error: `Perfil no encontrado: ${perfil_id}`
            })
        }
        if (perfil.usuario_id !== req.usuario.usuario_id) {
            return res.status(403).json({
                error: "No puedes modificar el perfil de otro usuario"
            })
        }

        const data = await perfilGrupoModel.deletePerfilGrupo(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_grupo no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

export default {
    getPerfilGrupos,
    getById,
    getByPerfilId,
    getByGrupoId,
    createPerfilGrupo,
    deletePerfilGrupo
}
