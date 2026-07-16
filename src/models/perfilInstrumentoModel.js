import pool from '../db.js'

const getPerfilInstrumentos = async () => {
    const query = `
                    SELECT * FROM ensamblia.perfil_instrumento
                    ORDER BY perfil_id, instrumento_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (perfil_id, instrumento_id) => {

    const query = (`
                    SELECT * FROM ensamblia.perfil_instrumento
                    WHERE perfil_id = $1 AND instrumento_id = $2
                    `)
    const result = await pool.query(query, [perfil_id, instrumento_id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_instrumento
                    WHERE perfil_id = $1
                    ORDER BY instrumento_id
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByInstrumentoId = async (instrumento_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_instrumento
                    WHERE instrumento_id = $1
                    ORDER BY perfil_id
                    `)
    const result = await pool.query(query, [instrumento_id])
    return (result.rows)
}

const createPerfilInstrumento = async (perfil_id, instrumento_id) => {
    const query = `
                    INSERT INTO ensamblia.perfil_instrumento (perfil_id, instrumento_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, instrumento_id])
    return (result.rows[0])
}

const deletePerfilInstrumento = async (perfil_id, instrumento_id) => {
    const query = `
                    DELETE FROM ensamblia.perfil_instrumento
                    WHERE perfil_id = $1 AND instrumento_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, instrumento_id])
    return (result.rows[0])
}

export default {
    getPerfilInstrumentos,
    getById,
    getByPerfilId,
    getByInstrumentoId,
    createPerfilInstrumento,
    deletePerfilInstrumento
}
