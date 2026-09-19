import pool from '../db.js'

const getInstrumentos = async () => {
    const query = `
                    SELECT * FROM ensamblia.instrumento
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.instrumento
                    WHERE instrumento_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const createInstrumento = async (nombre) => {
    const query = `
                    INSERT INTO ensamblia.instrumento (nombre) 
                    VALUES ($1) 
                    RETURNING *
                    `
    //RETURNING * si se quiere que regrese el objeto recién insertado
    const result = await pool.query(query, [nombre])
    return (result.rows[0])
}

const updateInstrumento = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.instrumento
                    SET ${updates.join(", ")}
                    WHERE instrumento_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const deleteInstrumento = async (id) => {
    const query = `
                    DELETE FROM ensamblia.instrumento
                    WHERE instrumento_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

export default {
    getInstrumentos,
    getById,
    createInstrumento,
    updateInstrumento,
    deleteInstrumento
}