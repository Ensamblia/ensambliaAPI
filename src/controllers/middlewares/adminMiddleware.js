const requireAdmin = (req, res, next) => {
    if (!req.usuario?.es_admin) {
        return res.status(403).json({
            error: "Requiere permisos de administrador"
        })
    }
    return next()
}

export { requireAdmin }
