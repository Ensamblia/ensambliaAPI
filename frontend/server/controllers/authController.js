import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import usuarioModel from '../models/usuarioModel.js'

/**
 * POST /api/auth/login
 * Body: { usuario, password }
 * Credentials are stored as env vars: ADMIN_USER and ADMIN_PASSWORD_HASH.
 * Generate a hash once with: node -e "const b=require('bcryptjs');b.hash('tu_password',10).then(console.log)"
 */


const register = async (req, res) => {
    try {
        const { usuario, password } = req.body

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET not set" });
        }

        const existeUsuario = await usuarioModel.getUser(usuario)
        if (existeUsuario) {
            return res.status(409).json({
                message: "Username in use"
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const nuevoUsuario = await usuarioModel.createUser(usuario, passwordHash)

        const token = jwt.sign(
            { usuario_id: nuevoUsuario.usuario_id, usuario: nuevoUsuario.usuario },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        )

        return res.status(201).json({
            message: "New user registered",
            usuario: nuevoUsuario,
            token
        })
    } catch (error) {
        res.status(500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position
        })
    }


}

const login = async (req, res) => {
    const { usuario, password } = req.body;

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ mensaje: "JWT_SECRET not set" })
    }

    const usuarioDb = await usuarioModel.getUser(usuario)

    if (usuarioDb) {
        const passwordValidaDb = await bcrypt.compare(password, usuarioDb.password_hash)
        if (!passwordValidaDb) {
            return res.status(401).json({ mensaje: "Invalid credentials" })
        }

        const tokenDb = jwt.sign(
            { usuario_id: usuarioDb.usuario_id, usuario: usuarioDb.usuario },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        )

        return res.json({ token: tokenDb })
    }

    const adminUser = process.env.ADMIN_USER
    const adminHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminUser || !adminHash) {
        return res.status(500).json({ mensaje: "Admin credentials not set in server" })
    }

    if (usuario !== adminUser) {
        return res.status(401).json({ mensaje: "Invalid credentials" })
    }

    const passwordValida = await bcrypt.compare(password, adminHash);
    if (!passwordValida) {
        return res.status(401).json({ mensaje: "Invalid credentials" });
    }

    const token = jwt.sign(
        { usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    return res.json({ token });
};

export {
    login,
    register
}