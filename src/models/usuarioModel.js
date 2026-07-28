import pool from '../db.js';

const getUser = async (usuario) => {
    const query = `
                    SELECT usuario_id, usuario, password_hash, es_admin
                    FROM ensamblia.usuario
                    WHERE usuario = $1`
    const result = await pool.query(query, [usuario])
    return (result.rows[0])
}

const createUser = async (usuario, passwordHash, esAdmin = false) => {
    const query = `
                    INSERT INTO ensamblia.usuario (usuario, password_hash, es_admin)
                    VALUES ($1, $2, $3)
                    RETURNING usuario_id, usuario, es_admin, creado_en
                    `
    const result = await pool.query(query, [usuario, passwordHash, esAdmin])
    return (result.rows[0])
}

const getUsuarios = async () => {
    const query = `
                    SELECT usuario_id, usuario, es_admin, creado_en
                    FROM ensamblia.usuario
                    ORDER BY usuario_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {
    const query = `
                    SELECT usuario_id, usuario, es_admin, creado_en
                    FROM ensamblia.usuario
                    WHERE usuario_id = $1
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateUsuario = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.usuario
                    SET ${updates.join(", ")}
                    WHERE usuario_id = $${values.length}
                    RETURNING usuario_id, usuario, es_admin, creado_en
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const deleteUsuario = async (id) => {
    const query = `
                    DELETE FROM ensamblia.usuario
                    WHERE usuario_id = $1
                    RETURNING usuario_id, usuario
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

export default {
    getUser,
    createUser,
    getUsuarios,
    getById,
    updateUsuario,
    deleteUsuario
}