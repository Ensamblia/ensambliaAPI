import perfilGeneroMusicalModel from '../models/perfilGeneroMusicalModel.js'

const getPerfilGeneroMusicales = async (req, res) => {
    try {
        const data = await perfilGeneroMusicalModel.getPerfilGeneroMusicales()
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
        const { perfil_id, genero_id } = req.params
        const data = await perfilGeneroMusicalModel.getById(perfil_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: `Nothing found for perfil_id: ${perfil_id} and genero_id: ${genero_id}`
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
        const data = await perfilGeneroMusicalModel.getByPerfilId(perfil_id)
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

const getByGeneroId = async (req, res) => {
    try {
        const { genero_id } = req.query
        const data = await perfilGeneroMusicalModel.getByGeneroId(genero_id)
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

const createPerfilGeneroMusical = async (req, res) => {
    try {
        const { perfil_id, genero_id } = req.body

        if (perfil_id === undefined || !Number.isInteger(perfil_id)) {
            return res.status(400).json({
                error: "perfil_id es un campo obligatorio y debe ser un entero"
            })
        }

        if (genero_id === undefined || !Number.isInteger(genero_id)) {
            return res.status(400).json({
                error: "genero_id es un campo obligatorio y debe ser un entero"
            })
        }

        const data = await perfilGeneroMusicalModel.createPerfilGeneroMusical(perfil_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_genero_musical no añadido correctamente"
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

const deletePerfilGeneroMusical = async (req, res) => {
    try {
        const { perfil_id, genero_id } = req.params
        const data = await perfilGeneroMusicalModel.deletePerfilGeneroMusical(perfil_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_genero_musical no encontrado"
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
    getPerfilGeneroMusicales,
    getById,
    getByPerfilId,
    getByGeneroId,
    createPerfilGeneroMusical,
    deletePerfilGeneroMusical
}
