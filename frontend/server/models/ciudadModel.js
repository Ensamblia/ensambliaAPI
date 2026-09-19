import pool from '../db.js'

const getCiudades = async () => {
    const query = `
                    SELECT * FROM ensamblia.ciudad
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.ciudad
                    WHERE ciudad_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteCiudad = async (id) => {
    const query = `
                    DELETE FROM ensamblia.ciudad
                    WHERE ciudad_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateCiudad = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.ciudad
                    SET ${updates.join(", ")}
                    WHERE ciudad_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createCiudad = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.ciudad (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getCiudades,
    getById,
    deleteCiudad,
    updateCiudad,
    createCiudad
}