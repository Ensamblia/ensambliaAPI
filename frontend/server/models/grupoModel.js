import pool from '../db.js'

const getGrupos = async () => {
    const query = `
                    SELECT * FROM ensamblia.grupo
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.grupo
                    WHERE grupo_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteGrupo = async (id) => {
    const query = `
                    DELETE FROM ensamblia.grupo
                    WHERE grupo_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateGrupo = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.grupo
                    SET ${updates.join(", ")}
                    WHERE grupo_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createGrupo = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.grupo (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getGrupos,
    getById,
    deleteGrupo,
    updateGrupo,
    createGrupo
}