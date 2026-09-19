import pool from '../db.js'

const getTipoAnuncios = async () => {
    const query = `
                    SELECT * FROM ensamblia.tipo_anuncio
                    ORDER BY tipo
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.tipo_anuncio
                    WHERE tipo_anuncio_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteTipoAnuncio = async (id) => {
    const query = `
                    DELETE FROM ensamblia.tipo_anuncio
                    WHERE tipo_anuncio_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateTipoAnuncio = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.tipo_anuncio
                    SET ${updates.join(", ")}
                    WHERE tipo_anuncio_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createTipoAnuncio = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.tipo_anuncio (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getTipoAnuncios,
    getById,
    deleteTipoAnuncio,
    updateTipoAnuncio,
    createTipoAnuncio
}
