import pool from '../db.js'

const getAnuncios = async () => {
    const query = `
                    SELECT * FROM ensamblia.anuncio
                    ORDER BY fecha_publicacion DESC
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.anuncio
                    WHERE anuncio_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteAnuncio = async (id) => {
    const query = `
                    DELETE FROM ensamblia.anuncio
                    WHERE anuncio_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateAnuncio = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.anuncio
                    SET ${updates.join(", ")}
                    WHERE anuncio_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createAnuncio = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.anuncio (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getAnuncios,
    getById,
    deleteAnuncio,
    updateAnuncio,
    createAnuncio,
    deleteAnuncio
}