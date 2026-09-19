import pool from '../db.js'

const getComentarios = async () => {
    const query = `
                    SELECT * FROM ensamblia.Comentario
                    ORDER BY fecha_publicacion
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.comentario
                    WHERE comentario_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.comentario
                    WHERE perfil_id = $1
                    ORDER BY fecha_publicacion DESC
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByAnuncioId = async (anuncio_id) => {
    const query = (`
                    SELECT * FROM ensamblia.comentario
                    WHERE anuncio_id = $1
                    ORDER BY fecha_publicacion DESC
                    `)
    const result = await pool.query(query, [anuncio_id])
    return (result.rows)
}

const deleteComentario = async (id) => {
    const query = `
                    DELETE FROM ensamblia.comentario
                    WHERE comentario_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateComentario = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.comentario
                    SET ${updates.join(", ")}
                    WHERE comentario_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createComentario = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.comentario (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getComentarios,
    getById,
    getByPerfilId,
    getByAnuncioId,
    deleteComentario,
    updateComentario,
    createComentario
}