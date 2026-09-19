import pool from '../db.js'

const getMensajes = async () => {
    const query = `
                    SELECT * FROM ensamblia.mensaje
                    ORDER BY fecha_envio
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.mensaje
                    WHERE mensaje_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const getByChatId = async (chat_id) => {
    const query = (`
                    SELECT * FROM ensamblia.mensaje
                    WHERE chat_id = $1
                    ORDER BY fecha_envio
                    `)
    const result = await pool.query(query, [chat_id])
    return (result.rows)
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.mensaje
                    WHERE perfil_id = $1
                    ORDER BY fecha_envio DESC
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const deleteMensaje = async (id) => {
    const query = `
                    DELETE FROM ensamblia.mensaje
                    WHERE mensaje_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateMensaje = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.mensaje
                    SET ${updates.join(", ")}
                    WHERE mensaje_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createMensaje = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.mensaje (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getMensajes,
    getById,
    getByChatId,
    getByPerfilId,
    deleteMensaje,
    updateMensaje,
    createMensaje
}
