import pool from '../db.js';


const getChats = async () => {
    const query = `
                    SELECT * FROM ensamblia.chat
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.chat
                    WHERE chat_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteChat = async (id) => {
    const query = `
                    DELETE FROM ensamblia.chat
                    WHERE chat_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

export default {
    getChats,
    getById,
    deleteChat
}