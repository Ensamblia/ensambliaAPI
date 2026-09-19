import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Token not given"
        })
    }

    const token = authHeader.split(" ")[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        return next()
    } catch (error) {
        return res.status(401).json({
            mensaje: "Invalid or expired token"
        })
    }
}

export { authMiddleware }