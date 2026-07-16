import perfilGrupoModel from '../models/perfilGrupoModel.js'

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
        const { perfil_id, grupo_id } = req.params
        const data = await perfilGrupoModel.getById(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and grupo_id: ${grupo_id}`
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
        const data = await perfilGrupoModel.getByPerfilId(perfil_id)
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

const getByGrupoId = async (req, res) => {
    try {
        const { grupo_id } = req.query
        if (!grupo_id) {
            return res.status(400).json({
                error: "grupo_id es un parámetro requerido"
            })
        }
        const data = await perfilGrupoModel.getByGrupoId(grupo_id)
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

        const data = await perfilGrupoModel.createPerfilGrupo(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_grupo no añadido correctamente"
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

const deletePerfilGrupo = async (req, res) => {
    try {
        const { perfil_id, grupo_id } = req.params
        const data = await perfilGrupoModel.deletePerfilGrupo(perfil_id, grupo_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_grupo no encontrado"
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
    getPerfilGrupos,
    getById,
    getByPerfilId,
    getByGrupoId,
    createPerfilGrupo,
    deletePerfilGrupo
}