import pool from '../db.js'

const getPerfilGeneroMusicales = async () => {
    const query = `
                    SELECT * FROM ensamblia.perfil_genero_musical
                    ORDER BY perfil_id, genero_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (perfil_id, genero_id) => {

    const query = (`
                    SELECT * FROM ensamblia.perfil_genero_musical
                    WHERE perfil_id = $1 AND genero_id = $2
                    `)
    const result = await pool.query(query, [perfil_id, genero_id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_genero_musical
                    WHERE perfil_id = $1
                    ORDER BY genero_id
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByGeneroId = async (genero_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_genero_musical
                    WHERE genero_id = $1
                    ORDER BY perfil_id
                    `)
    const result = await pool.query(query, [genero_id])
    return (result.rows)
}

const createPerfilGeneroMusical = async (perfil_id, genero_id) => {
    const query = `
                    INSERT INTO ensamblia.perfil_genero_musical (perfil_id, genero_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, genero_id])
    return (result.rows[0])
}

const deletePerfilGeneroMusical = async (perfil_id, genero_id) => {
    const query = `
                    DELETE FROM ensamblia.perfil_genero_musical
                    WHERE perfil_id = $1 AND genero_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, genero_id])
    return (result.rows[0])
}

export default {
    getPerfilGeneroMusicales,
    getById,
    getByPerfilId,
    getByGeneroId,
    createPerfilGeneroMusical,
    deletePerfilGeneroMusical
}
