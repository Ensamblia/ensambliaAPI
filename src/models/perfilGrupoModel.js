import pool from '../db.js'

const getPerfilGrupos = async () => {
    const query = `
                    SELECT * FROM ensamblia.perfil_grupo
                    ORDER BY perfil_id, grupo_id
                    `
    const result = await pool.query(query)
    return (result.rows)
}

const getById = async (perfil_id, grupo_id) => {

    const query = (`
                    SELECT * FROM ensamblia.perfil_grupo
                    WHERE perfil_id = $1 AND grupo_id = $2
                    `)
    const result = await pool.query(query, [perfil_id, grupo_id])
    return (result.rows[0])
}

const getByPerfilId = async (perfil_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_grupo
                    WHERE perfil_id = $1
                    ORDER BY grupo_id
                    `)
    const result = await pool.query(query, [perfil_id])
    return (result.rows)
}

const getByGrupoId = async (grupo_id) => {
    const query = (`
                    SELECT * FROM ensamblia.perfil_grupo
                    WHERE grupo_id = $1
                    ORDER BY perfil_id
                    `)
    const result = await pool.query(query, [grupo_id])
    return (result.rows)
}

const createPerfilGrupo = async (perfil_id, grupo_id) => {
    const query = `
                    INSERT INTO ensamblia.perfil_grupo (perfil_id, grupo_id)
                    VALUES ($1, $2)
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, grupo_id])
    return (result.rows[0])
}

const deletePerfilGrupo = async (perfil_id, grupo_id) => {
    const query = `
                    DELETE FROM ensamblia.perfil_grupo
                    WHERE perfil_id = $1 AND grupo_id = $2
                    RETURNING *
                    `
    const result = await pool.query(query, [perfil_id, grupo_id])
    return (result.rows[0])
}

export default {
    getPerfilGrupos,
    getById,
    getByPerfilId,
    getByGrupoId,
    createPerfilGrupo,
    deletePerfilGrupo
}