import pool from '../db.js'

const getComarcas = async () => {
    const query = `
                    SELECT * FROM ensamblia.comarca
                    ORDER BY nombre
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (id) => {

    const query = (`
                    SELECT * FROM ensamblia.comarca
                    WHERE comarca_id = $1
                    `)
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const deleteComarca = async (id) => {
    const query = `
                    DELETE FROM ensamblia.comarca
                    WHERE comarca_id = $1
                    RETURNING *
                    `
    const result = await pool.query(query, [id])
    return (result.rows[0])
}

const updateComarca = async (updates, values) => {
    const query = `
                    UPDATE ensamblia.comarca
                    SET ${updates.join(", ")}
                    WHERE comarca_id = $${values.length}
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}

const createComarca = async (columns, values) => {

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
                    INSERT INTO ensamblia.comarca (${columns.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
                    `
    const result = await pool.query(query, values)
    return (result.rows[0])
}


export default {
    getComarcas,
    getById,
    deleteComarca,
    updateComarca,
    createComarca
}