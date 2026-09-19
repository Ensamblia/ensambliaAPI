import pool from '../db.js'

const getGrupoGeneros = async () => {
    const query = `
                    SELECT * FROM ensamblia.grupo_genero
                    ORDER BY grupo_id, genero_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (grupo_id, genero_id) => {

    const query = (`
                    SELECT * FROM ensamblia.grupo_genero
                    WHERE grupo_id = $1 AND genero_id = $2
                    `)
    const result = await pool.query(query, [grupo_id, genero_id])
    return (result.rows[0])
}

const createGrupoGenero = async (grupo_id, genero_id) => {
    const query = `
                    INSERT INTO ensamblia.grupo_genero (grupo_id, genero_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [grupo_id, genero_id])
    return (result.rows[0])
}

const deleteGrupoGenero = async (grupo_id, genero_id) => {
    const query = `
                    DELETE FROM ensamblia.grupo_genero
                    WHERE grupo_id = $1 AND genero_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [grupo_id, genero_id])
    return (result.rows[0])
}

export default {
    getGrupoGeneros,
    getById,
    createGrupoGenero,
    deleteGrupoGenero
}
