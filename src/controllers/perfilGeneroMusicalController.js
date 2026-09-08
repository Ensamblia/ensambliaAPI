import perfilGeneroMusicalModel from '../models/perfilGeneroMusicalModel.js'
import perfilModel from '../models/perfilModel.js'

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
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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

        const data = await perfilGeneroMusicalModel.createPerfilGeneroMusical(perfil_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_genero_musical no añadido correctamente"
            });
        }
        res.status(201).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

const deletePerfilGeneroMusical = async (req, res) => {
    try {
        const { perfil_id, genero_id } = req.params

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

        const data = await perfilGeneroMusicalModel.deletePerfilGeneroMusical(perfil_id, genero_id)
        if (!data) {
            return res.status(404).json({
                error: "Perfil_genero_musical no encontrado"
            });
        }
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno del servidor" })
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
