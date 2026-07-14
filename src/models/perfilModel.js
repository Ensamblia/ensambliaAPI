import pool from '../db.js'

const getPerfiles = async () => {
    const query = `
                    SELECT * FROM ensamblia.perfil
                    ORDER BY perfil_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.perfil
                    WHERE perfil_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const getByUsuarioId = async (usuario_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil
                    WHERE usuario_id = $1
                    ORDER BY perfil_id
                    `)
    const result = await pool.query(query, [usuario_id])
    return (result.rows)
}

const getByComarcaId = async (comarca_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil
                    WHERE comarca_id = $1
                    ORDER BY perfil_id
                    `)
    const result = await pool.query(query, [comarca_id])
    return (result.rows)
}

const deletePerfil = async (id) => {
    const query = `
                    DELETE FROM ensamblia.perfil
                    WHERE perfil_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updatePerfil = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.perfil
                    SET ${updates.join(", ")}
                    WHERE perfil_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createPerfil = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.perfil (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getPerfiles,
    getById,
    getByUsuarioId,
    getByComarcaId,
    deletePerfil,
    updatePerfil,
    createPerfil
}
