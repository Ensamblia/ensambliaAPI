import pool from '../db.js'

const getTipoArchivos = async () => {
    const query = `
                    SELECT * FROM ensamblia.tipo_archivo
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.tipo_archivo
                    WHERE tipo_archivo_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteTipoArchivo = async (id) => {
    const query = `
                    DELETE FROM ensamblia.tipo_archivo
                    WHERE tipo_archivo_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateTipoArchivo = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.tipo_archivo
                    SET ${updates.join(", ")}
                    WHERE tipo_archivo_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createTipoArchivo = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.tipo_archivo (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getTipoArchivos,
    getById,
    deleteTipoArchivo,
    updateTipoArchivo,
    createTipoArchivo
}