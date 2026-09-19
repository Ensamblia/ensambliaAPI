import path from "node:path";
import express from "express";
import { createServer } from "./index.js";

const app = createServer();
const port = process.env.PORT || 3000;

// En producción, sirve los archivos compilados de la SPA
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Servir archivos estáticos
app.use(express.static(distPath));

// Manejar React Router - servir index.html para rutas que no sean API
app.get("*", (req, res) => {
    // No servir index.html para rutas API
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
    }

    res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
    console.log(`🚀 Fusion Starter server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
});

// Cierre controlado
process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 Received SIGINT, shutting down gracefully");
    process.exit(0);
});