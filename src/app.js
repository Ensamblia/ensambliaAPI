import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import instrumentoRoutes from './routes/instrumentoRoutes.js'
import anuncioRoutes from './routes/anuncioRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import ciudadRoutes from './routes/ciudadRoutes.js'
import comarcaRoutes from './routes/comarcaRoutes.js'
import comentarioRoutes from './routes/comentarioRoutes.js'
import grupoGeneroRoutes from './routes/grupoGeneroRoutes.js'
import mensajeRoutes from './routes/mensajeRoutes.js'
import mensajeLeidoRoutes from './routes/mensajeLeidoRoutes.js'
import perfilRoutes from './routes/perfilRoutes.js'
import perfilChatRoutes from './routes/perfilChatRoutes.js'
import perfilGeneroMusicalRoutes from './routes/perfilGeneroMusicalRoutes.js'
import generoMusicalRoutes from './routes/generoMusicalRoutes.js'
import perfilInstrumentoRoutes from './routes/perfilInstrumentoRoutes.js'
import tipoAnuncioRoutes from './routes/tipoAnuncioRoutes.js'
import multimediaRoutes from './routes/multimediaRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use('/api/instrumentos', instrumentoRoutes)
app.use('/api/anuncios', anuncioRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/ciudades', ciudadRoutes)
app.use('/api/comarcas', comarcaRoutes)
app.use('/api/comentarios', comentarioRoutes)
app.use('/api/grupo-generos', grupoGeneroRoutes)
app.use('/api/mensajes', mensajeRoutes)
app.use('/api/mensaje-leidos', mensajeLeidoRoutes)
app.use('/api/perfiles', perfilRoutes)
app.use('/api/perfil-chats', perfilChatRoutes)
app.use('/api/perfil-genero-musicales', perfilGeneroMusicalRoutes)
app.use('/api/genero_musical', generoMusicalRoutes)
app.use('/api/perfil-instrumentos', perfilInstrumentoRoutes)
app.use('/api/tipo-anuncios', tipoAnuncioRoutes)
app.use('/api/multimedia', multimediaRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})