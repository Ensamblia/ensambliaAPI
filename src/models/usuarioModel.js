import pool from '../db.js';

const getUser = async (usuario) => {
    const query = `
                    SELECT usuario_id, usuario, password_hash
                    FROM ensamblia.usuario
                    WHERE usuario = $1`
    const result = await pool.query(query, [usuario])
    return (result.rows[0])
}

const createUser = async (usuario, passwordHash) => {
    const query = `
                    INSERT INTO ensamblia.usuario (usuario, password_hash)
                    VALUES ($1, $2)
                    RETURNING usuario_id, usuario, creado_en
                    `
    const result = await pool.query(query, [usuario, passwordHash])
    return (result.rows[0])
}

export default {
    getUser,
    createUser
}