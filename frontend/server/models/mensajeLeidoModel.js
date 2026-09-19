import pool from '../db.js'

const getMensajeLeidos = async () => {
    const query = `
                    SELECT * FROM ensamblia.mensaje_leido
                    ORDER BY mensaje_id, perfil_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (mensaje_id, perfil_id) => {

    const query = (`
                    SELECT * FROM ensamblia.mensaje_leido
                    WHERE mensaje_id = $1 AND perfil_id = $2
                    `)
    const result = await pool.query(query, [mensaje_id, perfil_id])
    return (result.rows[0])
}

const createMensajeLeido = async (mensaje_id, perfil_id) => {
    const query = `
                    INSERT INTO ensamblia.mensaje_leido (mensaje_id, perfil_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [mensaje_id, perfil_id])
    return (result.rows[0])
}

const deleteMensajeLeido = async (mensaje_id, perfil_id) => {
    const query = `
                    DELETE FROM ensamblia.mensaje_leido
                    WHERE mensaje_id = $1 AND perfil_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [mensaje_id, perfil_id])
    return (result.rows[0])
}

export default {
    getMensajeLeidos,
    getById,
    createMensajeLeido,
    deleteMensajeLeido
}
