import pool from '../db.js'

const getPerfilChats = async () => {
    const query = `
                    SELECT * FROM ensamblia.perfil_chat
                    ORDER BY perfil_id, chat_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (perfil_id, chat_id) => {

    const query = (`
                    SELECT * FROM ensamblia.perfil_chat
                    WHERE perfil_id = $1 AND chat_id = $2
                    `)
    const result = await pool.query(query, [perfil_id, chat_id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_chat
                    WHERE perfil_id = $1
                    ORDER BY fecha_union DESC
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByChatId = async (chat_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_chat
                    WHERE chat_id = $1
                    ORDER BY fecha_union
                    `)
    const result = await pool.query(query, [chat_id])
    return (result.rows)
}

const createPerfilChat = async (perfil_id, chat_id) => {
    const query = `
                    INSERT INTO ensamblia.perfil_chat (perfil_id, chat_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, chat_id])
    return (result.rows[0])
}

const deletePerfilChat = async (perfil_id, chat_id) => {
    const query = `
                    DELETE FROM ensamblia.perfil_chat
                    WHERE perfil_id = $1 AND chat_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, chat_id])
    return (result.rows[0])
}

export default {
    getPerfilChats,
    getById,
    getByPerfilId,
    getByChatId,
    createPerfilChat,
    deletePerfilChat
}
