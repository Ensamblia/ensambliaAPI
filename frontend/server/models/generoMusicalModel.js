import pool from '../db.js'

const getGeneroMusical = async () => {
    const query = `
                    SELECT * FROM ensamblia.genero_musical
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.genero_musical
                    WHERE genero_musical_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteGeneroMusical = async (id) => {
    const query = `
                    DELETE FROM ensamblia.genero_musical
                    WHERE genero_musical_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateGeneroMusical = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.genero_musical
                    SET ${updates.join(", ")}
                    WHERE genero_musical_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createGeneroMusical = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.genero_musical (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getGeneroMusical,
    getById,
    deleteGeneroMusical,
    updateGeneroMusical,
    createGeneroMusical
}