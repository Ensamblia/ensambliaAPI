import pool from '../db.js'

const getMultimedia = async () => {
    const query = `
                    SELECT * FROM ensamblia.multimedia
                    ORDER BY fecha_subida
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.multimedia
                    WHERE multimedia_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.multimedia
                    WHERE perfil_id = $1
                    ORDER BY fecha_subida DESC
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByAnuncioId = async (anuncio_id) => {
    const query = (`
                    SELECT * FROM ensamblia.multimedia
                    WHERE anuncio_id = $1
                    ORDER BY fecha_subida DESC
                    `)
    const result = await pool.query(query, [anuncio_id])
    return (result.rows)
}

const deleteMultimedia = async (id) => {
    const query = `
                    DELETE FROM ensamblia.multimedia
                    WHERE multimedia_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateMultimedia = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.multimedia
                    SET ${updates.join(", ")}
                    WHERE multimedia_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createMultimedia = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.multimedia (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getMultimedia,
    getById,
    getByPerfilId,
    getByAnuncioId,
    deleteMultimedia,
    updateMultimedia,
    createMultimedia
}